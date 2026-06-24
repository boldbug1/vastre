const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const { JWT_SECRET, TOKEN_OPTIONS } = require("../middleware/auth");

// ── Rate limiting ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const setTokenCookie = (res, token) => {
  res.cookie("vastre_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

// ── Password validation ──
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
};

// Register
router.post("/register", authLimiter, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const pwErr = validatePassword(password);
  if (pwErr) return res.status(400).json({ error: pwErr });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)").run(id, name, email, hashed);

  const token = jwt.sign({ id, name, email, role: "customer" }, JWT_SECRET, TOKEN_OPTIONS);
  setTokenCookie(res, token);
  res.json({ token, user: { id, name, email, role: "customer" } });
});

// Login
router.post("/login", authLimiter, (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, TOKEN_OPTIONS);
  setTokenCookie(res, token);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Me
router.get("/me", require("../middleware/auth").auth, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

// Logout — clears cookie
router.post("/logout", (req, res) => {
  res.clearCookie("vastre_token", { path: "/" });
  res.json({ success: true });
});

module.exports = router;
