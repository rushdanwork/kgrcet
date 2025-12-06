const express = require('express');
const admin = require('firebase-admin');
const User = require('./models/User');

const router = express.Router();

function getFirebaseConfig() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    };
  }

  throw new Error('Missing Firebase service account configuration.');
}

function ensureFirebase() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(getFirebaseConfig()),
    });
  }
}

ensureFirebase();

async function findOrCreateUser(decodedToken, displayName) {
  const provider = decodedToken.firebase?.sign_in_provider || 'firebase';
  const providerId = decodedToken.uid;
  const email = decodedToken.email;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: displayName || decodedToken.name || email,
      provider,
      providerId,
      role: 'EMPLOYEE',
    });
  } else if (!user.providerId) {
    user.providerId = providerId;
    user.provider = provider;
    if (!user.name && (displayName || decodedToken.name)) {
      user.name = displayName || decodedToken.name;
    }
    await user.save();
  }
  return user;
}

router.post('/firebase-login', async (req, res) => {
  const { idToken, name } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'idToken is required' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await findOrCreateUser(decoded, name);
    return res.json({ user });
  } catch (err) {
    console.error('Firebase login error', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await findOrCreateUser(decoded);
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
