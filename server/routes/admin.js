const express = require('express');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware, requireAdmin);

router.get('/users', async (_req, res) => {
  const users = await User.find({}).lean();
  res.json(users);
});

router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create user', error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;
