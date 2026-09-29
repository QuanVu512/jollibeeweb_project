const { createHash } = require('node:crypto');
const repository = require('../repositories/attendance.repository');
const shifts = require('../repositories/shift.repository');
const database = require('../repositories/database.repository');
const validators = require('../validators/attendanceValidators');
const { recordAudit } = require('./auditService');
const { MINUTE, workDate, atTime, evaluate, weekRange } = require('../utils/attendanceTime');
const { billSnapshot } = require('../utils/attendanceBill');
const { EARLY_WINDOW_MINUTES, COOLDOWN_SECONDS } = require('../constants/attendance');
const { pagination, paginationResult } = require('../utils/adminQuery');
const ApiError = require('../utils/ApiError');

function conflict(code, message, details = {}) { return new ApiError(409, message, { code, ...details }); }

function fingerprint(operation, payload) {
  const { requestId, ...fields } = payload;
  return createHash('sha256').update(JSON.stringify({ operation, ...fields })).digest('hex');
}

function replayResult(log, hash) {
  if (!log) return null;
  if (log.fingerprint !== hash) throw conflict('REQUEST_ID_REUSED', 'requestId đã được dùng cho nội dung khác.');
  return log.response;
}

function receipt(item, employee, action, timestamp) {
  return {
    employee: { id: String(employee._id), employeeCode: employee.employeeCode, fullName: employee.fullName },
    sessionId: String(item._id), workDate: item.workDate, action, timestamp,
    checkInAt: item.checkInAt, checkOutAt: item.checkOutAt, kind: item.kind,
    schedule: item.schedule.toObject ? item.schedule.toObject() : item.schedule,
    inStatus: item.inStatus, outStatus: item.outStatus,
    lateMinutes: item.lateMinutes, earlyLeaveMinutes: item.earlyLeaveMinutes
  };
}

// Injectable time is used only by tests. HTTP always uses the server clock.
function createAttendanceService({ clock = () => new Date() } = {}) {
  async function record(body, context, isException = false) {
    const payload = isException ? validators.exception(body) : validators.scan(body);
    const hash = fingerprint(isException ? 'exception' : 'scan', payload);
    try {
      return await database.transaction(async (session) => {
        const replay = replayResult(await repository.replay(context.actor, payload.requestId, session), hash);
        if (replay) return replay;
        const employee = await repository.lockEmployee({ employeeCode: payload.employeeCode, isActive: true }, session);
        if (!employee) throw new ApiError(404, 'Mã nhân viên không tồn tại hoặc nhân viên đã nghỉ việc.', { code: 'EMPLOYEE_UNAVAILABLE' });
        const now = new Date(clock());
        const today = workDate(now);
        const remaining = employee.lastAttendanceAt
          ? Math.ceil((new Date(employee.lastAttendanceAt).getTime() + COOLDOWN_SECONDS * 1000 - now.getTime()) / 1000) : 0;
        if (remaining > 0) {
          const lastTime = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(employee.lastAttendanceAt);
          throw new ApiError(429, `${employee.fullName} vừa ghi nhận lúc ${lastTime}; vui lòng đợi ${remaining} giây.`, {
            code: 'COOLDOWN', employeeCode: employee.employeeCode, fullName: employee.fullName,
            lastRecordedAt: employee.lastAttendanceAt, retryAfterSeconds: remaining
          });
        }
        const open = await repository.openSession(employee._id, session);
        if (open && open.workDate !== today) {
          throw conflict('UNCLOSED_SESSION', `${employee.fullName} còn thiếu giờ ra ngày ${open.workDate}. Hãy xử lý phiên cũ rồi quét lại.`, {
            sessionId: String(open._id), workDate: open.workDate, employeeCode: employee.employeeCode
          });
        }
        if (isException && open) throw conflict('STATE_CHANGED', 'Nhân viên đã có phiên đang mở. Hủy duyệt và quét lại để checkout.');
        let item;
        let before = null;
        let action;
        let auditAction;
        if (open) {
          before = open.toObject();
          if (now <= open.checkInAt) throw conflict('INVALID_CHECKOUT', 'Giờ ra phải sau giờ vào.');
          open.set({ checkOutAt: now, checkOutRecordedBy: context.actor, state: 'CLOSED',
            ...evaluate(open.checkInAt, now, open.schedule, open.kind) });
          open.revision += 1;
          item = await repository.save(open, session);
          action = 'OUT';
          auditAction = 'attendance.checkOut';
        } else {
          const assignments = await shifts.assignmentsForDay(employee._id, today, session);
          const previous = await repository.sessionsForDay(employee._id, today, session);
          const used = new Set(previous.filter(row => row.employeeShift).map(row => String(row.employeeShift)));
          const available = assignments.filter(row => !used.has(String(row._id)));
          let selected;
          let schedule;
          let kind = 'REGULAR';
          if (isException) {
            if (payload.mode === 'SHIFT') {
              selected = available.find(row => String(row._id) === payload.employeeShiftId);
              if (!selected) throw conflict('STATE_CHANGED', 'Ca không còn khả dụng cho nhân viên hôm nay. Hủy duyệt và quét lại.');
            } else {
              const endAt = atTime(today, payload.endTime);
              if (endAt <= now) throw new ApiError(400, 'Giờ kết thúc OT phải sau hiện tại và trong cùng ngày.');
              schedule = { name: 'Làm thêm giờ (OT)', startAt: now, endAt, graceMinutes: 0 };
              kind = 'OT';
            }
          } else {
            selected = available.find(row => now >= new Date(row.startAt).getTime() - EARLY_WINDOW_MINUTES * MINUTE && now < row.endAt);
            if (!selected) {
              throw conflict('APPROVAL_REQUIRED', available.length
                ? 'Ngoài khung giờ ca. Chọn ca cần ghi nhận hoặc duyệt OT.'
                : 'Không có ca chưa chấm công hôm nay. Có thể duyệt làm thêm giờ (OT).', {
                employee: { id: String(employee._id), employeeCode: employee.employeeCode, fullName: employee.fullName },
                workDate: today, serverTime: now,
                assignments: available.map(row => ({ id: String(row._id), name: row.name, startAt: row.startAt, endAt: row.endAt }))
              });
            }
          }
          if (selected) schedule = { name: selected.name, startAt: selected.startAt, endAt: selected.endAt, graceMinutes: selected.graceMinutes };
          const dayEnd = new Date(atTime(today, '00:00').getTime() + 24 * 60 * MINUTE);
          if (await repository.overlap(employee._id, now, dayEnd, null, session)) {
            throw conflict('SESSION_OVERLAP', 'Thời gian vào chồng phiên công đã có. Hãy kiểm tra bảng công.');
          }
          item = await repository.create({
            employee: employee._id, employeeCode: employee.employeeCode, employeeName: employee.fullName,
            employeeShift: selected?._id || null, workDate: today, kind, schedule, checkInAt: now,
            checkInRecordedBy: context.actor, ...evaluate(now, null, schedule, kind),
            approval: isException ? { actor: context.actor, reason: payload.reason, approvedAt: now } : undefined
          }, session);
          action = 'IN';
          auditAction = isException ? (kind === 'OT' ? 'attendance.approveOT' : 'attendance.approveException') : 'attendance.checkIn';
        }
        await repository.markScan(employee._id, now, session);
        const response = receipt(item, employee, action, now);
        const week = weekRange(now);
        // Read our just-written OUT inside the same transaction; OPEN/CANCELLED never add hours.
        const completed = await repository.completedForWeek(employee._id, week, now, session);
        const account = await repository.employeeJob(employee, session);
        response.bill = billSnapshot(response, payload.requestId, account?.role, week, completed);
        await recordAudit(context, {
          action: auditAction, entityType: 'attendance', entityId: item._id, before, after: item,
          reason: payload.reason, requestId: payload.requestId, fingerprint: hash, response
        }, session);
        return response;
      });
    } catch (error) {
      // Different employees may race with the same requestId: the audit unique index is the final guard.
      if (error.code === 11000) {
        const replay = replayResult(await repository.replay(context.actor, payload.requestId), hash);
        if (replay) return replay;
      }
      throw error;
    }
  }

  async function changeSession(id, body, context, cancel = false) {
    validators.objectId(id);
    const payload = validators.change(body, cancel);
    return database.transaction(async (session) => {
      const item = await repository.findSession(id, session);
      if (!item) throw new ApiError(404, 'Không tìm thấy phiên chấm công.');
      await repository.lockEmployee({ _id: item.employee }, session);
      if (item.state === 'CANCELLED') throw conflict('CANCELLED_SESSION', 'Phiên đã hủy, không được sửa hoặc hủy lại.');
      if (item.revision !== payload.revision) throw conflict('STALE_REVISION', 'Bản ghi đã thay đổi. Hãy tải lại bảng công.');
      const before = item.toObject();
      const now = new Date(clock());
      if (cancel) {
        item.set({ state: 'CANCELLED', cancelledAt: now, cancelledBy: context.actor, cancellationReason: payload.reason });
      } else {
        if (workDate(payload.checkInAt) !== item.workDate || (payload.checkOutAt && workDate(payload.checkOutAt) !== item.workDate)) {
          throw new ApiError(400, 'Giờ vào/ra phải thuộc ngày công; chưa hỗ trợ ca qua đêm.');
        }
        if (payload.checkInAt > now || (payload.checkOutAt && payload.checkOutAt > now)) throw new ApiError(400, 'Không ghi giờ công trong tương lai.');
        if (item.state === 'CLOSED' && !payload.checkOutAt) throw new ApiError(400, 'Không mở lại phiên đã hoàn tất; có thể hủy bản ghi nếu ghi sai.');
        const dayEnd = new Date(atTime(item.workDate, '00:00').getTime() + 24 * 60 * MINUTE);
        if (await repository.overlap(item.employee, payload.checkInAt, payload.checkOutAt || dayEnd, id, session)) {
          throw conflict('SESSION_OVERLAP', 'Giờ sửa chồng phiên công khác của nhân viên.');
        }
        // Keep original recorders; adding a previously missing checkout records its actual author.
        if (!item.checkOutAt && payload.checkOutAt) item.checkOutRecordedBy = context.actor;
        item.set({ checkInAt: payload.checkInAt, checkOutAt: payload.checkOutAt,
          state: payload.checkOutAt ? 'CLOSED' : 'OPEN',
          ...evaluate(payload.checkInAt, payload.checkOutAt, item.schedule, item.kind) });
      }
      item.revision += 1;
      await repository.save(item, session);
      await recordAudit(context, {
        action: cancel ? 'attendance.cancel' : 'attendance.correct', entityType: 'attendance',
        entityId: item._id, before, after: item, reason: payload.reason
      }, session);
      return item;
    });
  }

  return {
    scan: (body, context) => record(body, context),
    approveException: (body, context) => record(body, context, true),
    correct: (id, body, context) => changeSession(id, body, context),
    cancel: (id, body, context) => changeSession(id, body, context, true)
  };
}

async function list(query) {
  const filters = validators.filters(query);
  if (query.state) {
    if (!['OPEN', 'CLOSED', 'CANCELLED'].includes(query.state)) throw new ApiError(400, 'Trạng thái phiên không hợp lệ.');
    filters.state = query.state;
  }
  if (query.status) {
    if (query.status === 'LATE') filters.inStatus = 'LATE';
    else if (query.status === 'EARLY_LEAVE') filters.outStatus = 'EARLY_LEAVE';
    else if (query.status === 'ON_TIME') { filters.inStatus = 'ON_TIME'; filters.outStatus = { $in: [null, 'ON_TIME'] }; }
    else throw new ApiError(400, 'Đánh giá công không hợp lệ.');
  }
  const page = pagination(query);
  const [items, total] = await Promise.all([repository.list(filters, page), repository.count(filters)]);
  return { items, pagination: paginationResult(page.page, page.limit, total) };
}

async function detail(id) {
  validators.objectId(id);
  const item = await repository.detail(id);
  if (!item) throw new ApiError(404, 'Không tìm thấy phiên chấm công.');
  return item;
}

async function history(id, query) {
  await detail(id);
  const page = pagination(query, { defaultLimit: 50 });
  const [items, total] = await Promise.all([repository.history(id, page), repository.historyCount(id)]);
  return { items, pagination: paginationResult(page.page, page.limit, total) };
}

module.exports = { ...createAttendanceService(), createAttendanceService, list, detail, history };
