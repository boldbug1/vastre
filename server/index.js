const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();

// ── Environment validation ──
if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set.");
  console.error("   Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  process.exit(1);
}

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173").split(",").map(s => s.trim());

// ── Middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Routes ──
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api", require("./routes/shop"));

// ── Health ──
app.get("/api/health", (_, res) => {
  try {
    const db = require("./db");
    db.prepare("SELECT 1").get();
    res.json({ status: "ok", name: "VASTRE API" });
  } catch {
    res.status(503).json({ status: "error", message: "Database unavailable" });
  }
});

// ── 404 ──
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──
app.listen(PORT, () => console.log(`🪡 VASTRE server running on http://localhost:${PORT}`));

// ── Graceful shutdown ──
process.on("SIGTERM", () => { console.log("Shutting down..."); process.exit(0); });
process.on("SIGINT", () => { console.log("Shutting down..."); process.exit(0); });
