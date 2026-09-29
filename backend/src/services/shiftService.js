const repository = require('../repositories/shift.repository');
const attendance = require('../repositories/attendance.repository');
const database = require('../repositories/database.repository');
const validators = require('../validators/attendanceValidators');
const { atTime } = require('../utils/attendanceTime');
const { GRACE_MINUTES } = require('../constants/attendance');
const { pagination, paginationResult } = require('../utils/adminQuery');
const { recordAudit } = require('./auditService');
const ApiError = require('../utils/ApiError');

async function listTemplates() { return { items: await repository.listTemplates() }; }

async function saveTemplate(id, body, context) {
  const payload = validators.template(body);
  if (id) validators.objectId(id);
  return database.transaction(async (session) => {
    let item = id ? await repository.findTemplate(id, session) : null;
    if (id && !item) throw new ApiError(404, 'Không tìm thấy ca mẫu.');
    const before = item?.toObject() || null;
    if (item) { item.set(payload); await repository.saveTemplate(item, session); }
    else item = await repository.createTemplate(payload, session);
    await recordAudit(context, {
      action: id ? 'shiftTemplate.update' : 'shiftTemplate.create', entityType: 'shiftTemplate',
      entityId: item._id, before, after: item
    }, session);
    return item;
  });
}

async function listAssignments(query) {
  const filters = validators.filters(query);
  if (query.includeInactive !== 'true') filters.isActive = true;
  const page = pagination(query);
  const [items, total] = await Promise.all([repository.listAssignments(filters, page), repository.countAssignments(filters)]);
  return { items, pagination: paginationResult(page.page, page.limit, total) };
}

async function saveAssignment(id, body, context) {
  const payload = validators.assignment(body);
  if (id) validators.objectId(id);
  return database.transaction(async (session) => {
    // An assignment's employee cannot be changed; cancel and create another instead.
    const old = id ? await repository.findAssignment(id, session) : null;
    if (id && !old) throw new ApiError(404, 'Không tìm thấy lịch ca.');
    if (old && String(old.employee) !== payload.employee) throw new ApiError(400, 'Không đổi nhân viên của lịch ca; hãy hủy và tạo lại.');
    const employee = await attendance.lockEmployee({ _id: payload.employee, isActive: true }, session);
    if (!employee) throw new ApiError(404, 'Nhân viên không tồn tại hoặc đã nghỉ việc.');
    if (old && (!old.isActive || await attendance.assignmentUsed(id, session))) {
      throw new ApiError(409, 'Lịch ca đã hủy hoặc đã có chấm công, không được sửa.');
    }
    const template = await repository.findTemplate(payload.template, session);
    if (!template?.isActive) throw new ApiError(400, 'Ca mẫu không tồn tại hoặc đã ngừng sử dụng.');
    const startAt = atTime(payload.workDate, template.startTime);
    const endAt = atTime(payload.workDate, template.endTime);
    if (await repository.overlapping(employee._id, startAt, endAt, id, session)) {
      throw new ApiError(409, 'Nhân viên đã có ca trùng hoặc chồng giờ.');
    }
    const fields = { ...payload, name: template.name, startAt, endAt, graceMinutes: GRACE_MINUTES, assignedBy: context.actor };
    const before = old?.toObject() || null;
    let item = old;
    if (item) { item.set(fields); await repository.saveAssignment(item, session); }
    else item = await repository.createAssignment(fields, session);
    await recordAudit(context, {
      action: id ? 'employeeShift.update' : 'employeeShift.create', entityType: 'employeeShift',
      entityId: item._id, before, after: item
    }, session);
    return item;
  });
}

async function cancelAssignment(id, body, context) {
  validators.objectId(id);
  const reason = validators.text(body?.reason, 'Lý do', 500);
  return database.transaction(async (session) => {
    const item = await repository.findAssignment(id, session);
    if (!item) throw new ApiError(404, 'Không tìm thấy lịch ca.');
    await attendance.lockEmployee({ _id: item.employee }, session);
    if (!item.isActive || await attendance.assignmentUsed(id, session)) throw new ApiError(409, 'Lịch ca đã hủy hoặc đã có chấm công, không được hủy.');
    const before = item.toObject();
    item.isActive = false;
    await repository.saveAssignment(item, session);
    await recordAudit(context, { action: 'employeeShift.cancel', entityType: 'employeeShift', entityId: item._id, before, after: item, reason }, session);
    return item;
  });
}

module.exports = { listTemplates, saveTemplate, listAssignments, saveAssignment, cancelAssignment };
