const ApiError = require('./ApiError');
const { UTC_OFFSET_MINUTES, GRACE_MINUTES } = require('../constants/attendance');
const MINUTE = 60000;

function workDate(value = new Date()) {
  return new Date(new Date(value).getTime() + UTC_OFFSET_MINUTES * MINUTE).toISOString().slice(0, 10);
}

function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, 'Ngày phải có định dạng YYYY-MM-DD.');
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, 'Ngày không hợp lệ.');
  }
  return value;
}

function validateTime(value) {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ApiError(400, 'Giờ phải có định dạng HH:mm.');
  }
  return value;
}

function atTime(date, time) {
  return new Date(`${validateDate(date)}T${validateTime(time)}:00+07:00`);
}

function weekRange(value) {
  const date = new Date(`${workDate(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  const from = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 7);
  const toExclusive = date.toISOString().slice(0, 10);
  return { from, toExclusive };
}

function evaluate(checkInAt, checkOutAt, schedule, kind = 'REGULAR') {
  const delay = new Date(checkInAt) - new Date(schedule.startAt);
  const lateMinutes = kind === 'REGULAR' && delay > (schedule.graceMinutes ?? GRACE_MINUTES) * MINUTE
    ? Math.ceil(delay / MINUTE) : 0;
  const earlyLeaveMinutes = checkOutAt
    ? Math.max(0, Math.ceil((new Date(schedule.endAt) - new Date(checkOutAt)) / MINUTE)) : 0;
  return {
    inStatus: lateMinutes ? 'LATE' : 'ON_TIME',
    outStatus: checkOutAt ? (earlyLeaveMinutes ? 'EARLY_LEAVE' : 'ON_TIME') : null,
    lateMinutes,
    earlyLeaveMinutes
  };
}

module.exports = { MINUTE, workDate, validateDate, validateTime, atTime, evaluate, weekRange };
