const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Employee = require('./models/Employee');

const router = express.Router();

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

function oauthCallbackHandler(provider) {
  return async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const providerId = profile.id;
      let user = await User.findOne({ provider, providerId });
      if (!user) {
        user = await User.create({
          email,
          name: profile.displayName,
          provider,
          providerId,
          role: 'EMPLOYEE',
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: `${process.env.SERVER_BASE_URL || 'http://localhost:4000'}/api/auth/google/callback`,
    },
    oauthCallbackHandler('google')
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID || 'placeholder',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'placeholder',
      callbackURL: `${process.env.SERVER_BASE_URL || 'http://localhost:4000'}/api/auth/microsoft/callback`,
      scope: ['user.read', 'openid', 'profile', 'email'],
    },
    oauthCallbackHandler('microsoft')
  )
);

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, employeeId: user.employeeId },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '8h' }
  );
}

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, provider: 'local' });
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Auth error' });
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });
    const token = signToken(user);
    return res.json({ token, user });
  })(req, res, next);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}?token=${token}`);
  }
);

router.get('/microsoft', passport.authenticate('microsoft'));
router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { session: false, failureRedirect: '/login?error=microsoft' }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}?token=${token}`);
  }
);

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.userId);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
