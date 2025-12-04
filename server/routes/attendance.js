const express = require('express');
const Attendance = require('../models/Attendance');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { date } = req.query;
  const filter = {};
  if (date) filter.date = date;
  const records = await Attendance.find(filter).lean();
  res.json(records);
});

router.post('/', async (req, res) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create attendance', error: err.message });
  }
});

router.post('/clock-in', async (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  let record = await Attendance.findOne({ employeeId, date: today });
  if (!record) {
    record = await Attendance.create({ employeeId, date: today, status: 'present', clockIn: new Date().toISOString() });
  } else {
    record.clockIn = record.clockIn || new Date().toISOString();
    record.status = 'present';
    await record.save();
  }
  res.json(record);
});

router.post('/clock-out', async (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const record = await Attendance.findOne({ employeeId, date: today });
  if (!record) return res.status(404).json({ message: 'No clock-in found' });
  if (!record.clockOut) {
    record.clockOut = new Date().toISOString();
    if (record.clockIn) {
      const diff = new Date(record.clockOut) - new Date(record.clockIn);
      record.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    }
    await record.save();
  }
  res.json(record);
});

module.exports = router;
