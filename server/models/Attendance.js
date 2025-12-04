const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave'], required: true },
  clockIn: String,
  clockOut: String,
  totalHours: Number,
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
