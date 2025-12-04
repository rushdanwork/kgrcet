const admin = require('firebase-admin');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: 'User not registered' });
    }
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: user.role,
      userId: user._id.toString(),
      employeeId: user.employeeId,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'HR')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
}

module.exports = { authMiddleware, requireAdmin };
