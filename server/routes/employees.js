const express = require('express');
const Employee = require('../models/Employee');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { department, role } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (role) filter.role = role;
  const employees = await Employee.find(filter).lean();
  res.json(employees);
});

router.get('/:id', async (req, res) => {
  const employee = await Employee.findById(req.params.id).lean();
  if (!employee) return res.status(404).json({ message: 'Not found' });
  res.json(employee);
});

router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create employee', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update employee', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete employee', error: err.message });
  }
});

module.exports = router;
