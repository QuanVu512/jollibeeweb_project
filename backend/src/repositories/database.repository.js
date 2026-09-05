const mongoose = require('mongoose');

function isValidObjectId(value) {
  return mongoose.isValidObjectId(value);
}

function isValidObjectIdType(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function transaction(work) {
  return mongoose.connection.transaction(work);
}

module.exports = { isValidObjectId, isValidObjectIdType, transaction };
