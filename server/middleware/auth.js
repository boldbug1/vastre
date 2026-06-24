const jwt = require("jsonwebtoken");

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ CRITICAL: JWT_SECRET environment variable is not set.");
    console.error("   Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    console.error("   Then set: JWT_SECRET=<your-secret>");
    process.exit(1);
  }
  return secret;
})();

const TOKEN_OPTIONS = { expiresIn: "7d" };

const auth = (req, res, next) => {
  let token = null;

  // Try cookie first (HttpOnly cookie — more secure)
  if (req.cookies?.vastre_token) {
    token = req.cookies.vastre_token;
  }

  // Fallback to Authorization header (for non-browser clients)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

module.exports = { auth, adminOnly, JWT_SECRET, TOKEN_OPTIONS };
