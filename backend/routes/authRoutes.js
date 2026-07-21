import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { createToken, hashToken } from '../utils/tokens.js';
import {
  isEmailConfigured,
  sendEmail,
  verificationEmail,
  resetPasswordEmail,
} from '../utils/email.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const clientUrl = () =>
  (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

// Whether we can return dev links in API responses (only when email is off
// and we're not in production) — a convenience for local testing.
const devHint = () => !isEmailConfigured() && process.env.NODE_ENV !== 'production';

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
});

// Lazily created so it reads GOOGLE_CLIENT_ID after dotenv has loaded
// (ES module imports run before server.js calls dotenv.config()).
let _googleClient;
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!_googleClient) _googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return _googleClient;
};

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email: email?.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailOn = isEmailConfigured();
    const { raw, hash } = createToken();

    const user = await User.create({
      name,
      email,
      password,
      // If we can't send email, auto-verify so the app remains usable.
      isVerified: !emailOn,
      verificationToken: emailOn ? hash : undefined,
      verificationTokenExpires: emailOn ? Date.now() + 24 * 60 * 60 * 1000 : undefined,
    });

    if (emailOn) {
      const link = `${clientUrl()}/verify-email?token=${raw}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email — DSA Tracker',
        html: verificationEmail(user.name, link),
        text: `Verify your email: ${link}`,
      });

      return res.status(201).json({
        needsVerification: true,
        email: user.email,
        message: 'Registration successful. Please check your email to verify your account.',
        ...(devHint() ? { devVerifyLink: link } : {}),
      });
    }

    // Email off → log the user straight in.
    return res.status(201).json({
      ...publicUser(user),
      token: generateToken(user._id),
      needsVerification: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (isEmailConfigured() && !user.isVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
        message: 'Please verify your email before logging in.',
      });
    }

    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Google sign-in — verifies the Google ID token, then upserts the user.
// ---------------------------------------------------------------------------
router.post('/google', async (req, res) => {
  const googleClient = getGoogleClient();
  if (!googleClient) {
    return res.status(500).json({ message: 'Google sign-in is not configured on the server.' });
  }

  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link Google to an existing local account and mark verified.
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (!user.isVerified) { user.isVerified = true; changed = true; }
      if (changed) await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        isVerified: true,
      });
    }

    res.json({ ...publicUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google sign-in failed' });
  }
});

// ---------------------------------------------------------------------------
// Verify email
// ---------------------------------------------------------------------------
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const user = await User.findOne({
      verificationToken: hashToken(token),
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      ...publicUser(user),
      token: generateToken(user._id),
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Resend verification
// ---------------------------------------------------------------------------
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Only send if there's an unverified account and email is configured.
    if (user && !user.isVerified && isEmailConfigured()) {
      const { raw, hash } = createToken();
      user.verificationToken = hash;
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      const link = `${clientUrl()}/verify-email?token=${raw}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email — DSA Tracker',
        html: verificationEmail(user.name, link),
        text: `Verify your email: ${link}`,
      });
    }

    res.json({ message: 'If an unverified account exists, a new link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase() });
    let devResetLink;

    // Only local accounts (with a password) can reset it.
    if (user && user.password) {
      const { raw, hash } = createToken();
      user.resetPasswordToken = hash;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const link = `${clientUrl()}/reset-password?token=${raw}`;
      devResetLink = link;
      await sendEmail({
        to: user.email,
        subject: 'Reset your password — DSA Tracker',
        html: resetPasswordEmail(user.name, link),
        text: `Reset your password: ${link}`,
      });
    }

    // Generic response — never reveal whether the email exists.
    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      ...(devHint() && devResetLink ? { devResetLink } : {}),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Missing token or password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password; // hashed by the pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ ...publicUser(user), token: generateToken(user._id), message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      solvedQuestions: user.solvedQuestions,
      starredQuestions: user.starredQuestions,
      notes: user.notes,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export default router;
