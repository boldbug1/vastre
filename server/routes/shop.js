const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { auth } = require("../middleware/auth");

// ── CATEGORIES ──────────────────────────────────────────────
router.get("/categories", (req, res) => {
  const cats = db.prepare("SELECT * FROM categories").all();
  res.json(cats);
});

// ── CART ─────────────────────────────────────────────────────
router.get("/cart", auth, (req, res) => {
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.mrp, p.image_url, p.stock
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

router.post("/cart", auth, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const product = db.prepare("SELECT id, stock FROM products WHERE id = ?").get(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.stock < 1) return res.status(400).json({ error: "Product is out of stock" });

  const existing = db.prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?").get(req.user.id, product_id);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) return res.status(400).json({ error: `Only ${product.stock} available. You already have ${existing.quantity} in your bag.` });
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(newQty, existing.id);
  } else {
    if (quantity > product.stock) return res.status(400).json({ error: `Only ${product.stock} available.` });
    db.prepare("INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)").run(uuidv4(), req.user.id, product_id, quantity);
  }
  res.json({ success: true });
});

router.put("/cart/:id", auth, (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  } else {
    const item = db.prepare(`
      SELECT ci.quantity, p.stock FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `).get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: "Cart item not found" });
    if (quantity > item.stock) return res.status(400).json({ error: `Only ${item.stock} available.` });
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?").run(quantity, req.params.id, req.user.id);
  }
  res.json({ success: true });
});

router.delete("/cart/:id", auth, (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── WISHLIST ──────────────────────────────────────────────────
router.get("/wishlist", auth, (req, res) => {
  const items = db.prepare(`
    SELECT p.id, p.name, p.price, p.mrp, p.image_url FROM wishlists w
    JOIN products p ON w.product_id = p.id WHERE w.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

router.post("/wishlist/:product_id", auth, (req, res) => {
  const exists = db.prepare("SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ?").get(req.user.id, req.params.product_id);
  if (exists) {
    db.prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?").run(req.user.id, req.params.product_id);
    res.json({ wishlisted: false });
  } else {
    db.prepare("INSERT OR IGNORE INTO wishlists VALUES (?, ?)").run(req.user.id, req.params.product_id);
    res.json({ wishlisted: true });
  }
});

// ── ORDERS ────────────────────────────────────────────────────
router.get("/orders", auth, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  const ordersWithItems = orders.map(o => {
    const items = db.prepare(`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
    `).all(o.id);
    return { ...o, items };
  });
  res.json(ordersWithItems);
});

router.post("/orders", auth, (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Delivery address required" });

  const cartItems = db.prepare(`
    SELECT ci.quantity, p.id as product_id, p.price, p.stock FROM cart_items ci
    JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?
  `).all(req.user.id);

  if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

  for (const item of cartItems) {
    if (item.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for a product` });
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderId = uuidv4();

  const createOrder = db.transaction(() => {
    db.prepare("INSERT INTO orders (id, user_id, total, address) VALUES (?, ?, ?, ?)").run(orderId, req.user.id, total, address);
    for (const item of cartItems) {
      db.prepare("INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)").run(uuidv4(), orderId, item.product_id, item.quantity, item.price);
      db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.product_id);
    }
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);
  });

  createOrder();
  res.json({ orderId, total });
});

module.exports = router;
