// app.js: builds the Express app (no DB connection here, so tests can import it)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';

// ---- Models ----
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt hash, never plain text
}));
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', new mongoose.Schema({
  name: { type: String, default: 'Anonymous', maxlength: 60 },
  text: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
}));

const EVENTS = [
  { id: 1, title: 'CodeSprint', day: 'Mar 14', venue: 'Lab 2', blurb: '3-hour algorithm contest.' },
  { id: 2, title: 'Hack the Campus', day: 'Mar 14', venue: 'Auditorium', blurb: '24-hour build challenge.' },
  { id: 3, title: 'AI Showcase', day: 'Mar 15', venue: 'Seminar Hall', blurb: 'Student ML demos.' },
  { id: 4, title: 'Robo Race', day: 'Mar 15', venue: 'Quadrangle', blurb: 'Line-follower bot race.' },
];

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy; needed for secure cookies + rate limit

// ---- Security middleware ----
app.use(helmet());                                   // security headers
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));            // small body limit
app.use(cookieParser());
app.use(mongoSanitize());                            // strips $ and . keys → blocks NoSQL injection
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });

const cookieOptions = {
  httpOnly: true,                                    // JS cannot read it (stops XSS theft)
  secure: isProd,                                    // HTTPS only in production
  sameSite: isProd ? 'none' : 'lax',                 // 'none' needed: Netlify + Render are different sites. Use 'strict' if same site.
  maxAge: 60 * 60 * 1000,
};
const isStr = (v) => typeof v === 'string' && v.length > 0;

function requireAuth(req, res, next) {
  try { req.user = jwt.verify(req.cookies.token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Please log in' }); }
}

// ---- Routes ----
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/events', (_req, res) => res.json(EVENTS));

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  if (![name, email, password].every(isStr) || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  try {
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ id: user._id, name: user.name });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  // Type check: rejects objects like { "$ne": null } before they reach MongoDB
  if (!isStr(email) || !isStr(password)) return res.status(400).json({ error: 'Invalid input' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Wrong email or password' });
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, cookieOptions).json({ name: user.name });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined }).json({ ok: true });
});
app.get('/api/auth/me', (req, res) => {
  try { res.json({ name: jwt.verify(req.cookies.token, JWT_SECRET).name }); }
  catch { res.json({ name: null }); }
});
app.get('/api/feedback', async (_req, res) => {
  res.json(await Feedback.find().sort({ createdAt: -1 }).limit(50));
});
app.post('/api/feedback', requireAuth, async (req, res) => {
  if (!isStr(req.body.text)) return res.status(400).json({ error: 'Feedback text is required' });
  // Stored as-is; the React client renders it as plain text, so scripts never run.
  const item = await Feedback.create({ name: req.user.name, text: req.body.text.slice(0, 500) });
  res.status(201).json(item);
});

module.exports = app;
