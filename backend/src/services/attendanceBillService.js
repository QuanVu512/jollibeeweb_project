const repository = require('../repositories/attendance.repository');
const { requestId } = require('../validators/attendanceValidators');
const { buildBill } = require('../utils/attendanceBill');
const ApiError = require('../utils/ApiError');

async function download(id, context) {
  const log = await repository.replay(context.actor, requestId(id));
  const bill = log?.entityType === 'attendance' && log.response?.bill;
  if (!bill) throw new ApiError(404, 'Không tìm thấy bill của lượt ghi nhận này.');
  return { fileName: bill.fileName, buffer: await buildBill(bill) };
}

module.exports = { download };
