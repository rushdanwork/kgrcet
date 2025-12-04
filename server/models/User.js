const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String },
  name: String,
  provider: { type: String, default: 'local' },
  providerId: String,
  role: { type: String, default: 'EMPLOYEE' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
