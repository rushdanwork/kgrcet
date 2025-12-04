const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  role: String,
  department: String,
  position: String,
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  performanceIndex: { type: Number, default: 0 },
  hireDate: Date,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
