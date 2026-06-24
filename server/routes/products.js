const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { auth, adminOnly } = require("../middleware/auth");

const VALID_SORTS = new Map([
  ["price_asc", "p.price ASC"],
  ["price_desc", "p.price DESC"],
  ["newest", "p.created_at DESC"],
  ["name", "p.name ASC"],
]);

// GET all products (with filters)
router.get("/", (req, res) => {
  const { category, search, featured, sort = "newest", page = 1, limit = 12 } = req.query;
  let query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];

  if (category) { query += ` AND c.slug = ?`; params.push(category); }
  if (featured === "true") { query += ` AND p.is_featured = 1`; }
  if (search) { query += ` AND (p.name LIKE ? OR p.tags LIKE ? OR p.description LIKE ?)`; const s = `%${search}%`; params.push(s, s, s); }

  const orderClause = VALID_SORTS.get(sort) || "p.created_at DESC";
  query += ` ORDER BY ${orderClause}`;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare(query.replace("SELECT p.*, c.name as category_name", "SELECT COUNT(*) as count")).get(...params).count;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const products = db.prepare(query).all(...params);
  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// GET single product with reviews
router.get("/:id", (req, res) => {
  const product = db.prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`).get(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  const reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`).all(req.params.id);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  res.json({ ...product, reviews, avgRating, reviewCount: reviews.length });
});

// POST review
router.post("/:id/reviews", auth, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating 1–5 required" });
  const existing = db.prepare("SELECT id FROM reviews WHERE product_id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (existing) return res.status(409).json({ error: "Already reviewed" });

  const id = uuidv4();
  db.prepare("INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)").run(id, req.params.id, req.user.id, rating, comment || "");
  res.json({ id, rating, comment, user_name: req.user.name });
});

// Admin: Create product
router.post("/", auth, adminOnly, (req, res) => {
  const { name, description, price, mrp, stock, category_id, image_url, tags, is_featured } = req.body;
  if (!name || !price) return res.status(400).json({ error: "name and price required" });
  const id = uuidv4();
  db.prepare(`INSERT INTO products (id, name, description, price, mrp, stock, category_id, image_url, tags, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, name, description || "", price, mrp || null, stock || 0, category_id || null, image_url || "", tags || "", is_featured ? 1 : 0);
  res.json({ id });
});

// Admin: Update product
router.put("/:id", auth, adminOnly, (req, res) => {
  const { name, description, price, mrp, stock, image_url, tags, is_featured } = req.body;
  db.prepare(`UPDATE products SET name=?, description=?, price=?, mrp=?, stock=?, image_url=?, tags=?, is_featured=? WHERE id=?`).run(name, description, price, mrp, stock, image_url, tags, is_featured ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// Admin: Delete product
router.delete("/:id", auth, adminOnly, (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
