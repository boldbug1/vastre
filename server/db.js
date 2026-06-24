const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "vastre.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    mrp REAL,
    stock INTEGER DEFAULT 0,
    category_id TEXT REFERENCES categories(id),
    image_url TEXT,
    tags TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id),
    product_id TEXT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    product_id TEXT REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    user_id TEXT REFERENCES users(id),
    product_id TEXT REFERENCES products(id),
    PRIMARY KEY(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id),
    user_id TEXT REFERENCES users(id),
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(product_id, user_id)
  );
`);

// --- Seed ---
const { v4: uuidv4 } = require("uuid");

const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
if (catCount === 0) {
  const cats = [
    { id: uuidv4(), name: "Sarees", slug: "sarees" },
    { id: uuidv4(), name: "Kurtas", slug: "kurtas" },
    { id: uuidv4(), name: "Dupattas", slug: "dupattas" },
    { id: uuidv4(), name: "Lehengas", slug: "lehengas" },
    { id: uuidv4(), name: "Shawls", slug: "shawls" },
  ];
  const insertCat = db.prepare("INSERT INTO categories VALUES (@id, @name, @slug)");
  cats.forEach((c) => insertCat.run(c));

  const catMap = {};
  cats.forEach((c) => (catMap[c.slug] = c.id));

  const products = [
    {
      id: uuidv4(), name: "Chanderi Silk Saree — Saffron Bloom", description: "Handwoven Chanderi silk from Madhya Pradesh with zari border motifs. Lightweight, breathable, and perfect for festive occasions.", price: 3499, mrp: 5200, stock: 18, category_id: catMap["sarees"], image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80", tags: "silk,festive,handwoven", is_featured: 1
    },
    {
      id: uuidv4(), name: "Banarasi Georgette Saree — Midnight Rose", description: "Classic Banarasi weave on soft georgette. Intricate floral jaal pattern with heavy pallu. A heirloom piece.", price: 6200, mrp: 9000, stock: 8, category_id: catMap["sarees"], image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80", tags: "banarasi,silk,bridal", is_featured: 1
    },
    {
      id: uuidv4(), name: "Khadi Cotton Kurta — Indigo Plains", description: "Hand-spun khadi cotton kurta with block-print chest detailing. Slow fashion at its finest — supports artisans from Kutch.", price: 1799, mrp: 2400, stock: 35, category_id: catMap["kurtas"], image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", tags: "khadi,cotton,block-print", is_featured: 1
    },
    {
      id: uuidv4(), name: "Angrakha Kurta — Rust & Ivory", description: "A contemporary take on the traditional Angrakha silhouette. Hand-stitched mirror work at hem and cuffs.", price: 2899, mrp: 3800, stock: 22, category_id: catMap["kurtas"], image_url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80", tags: "angrakha,mirrorwork,festive", is_featured: 0
    },
    {
      id: uuidv4(), name: "Bandhani Dupatta — Rajasthani Sunrise", description: "Traditional tie-dye bandhani dupatta from Jaipur in vibrant ochre and pink. Each piece is uniquely tied by hand.", price: 899, mrp: 1400, stock: 50, category_id: catMap["dupattas"], image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80", tags: "bandhani,dupatta,rajasthani", is_featured: 1
    },
    {
      id: uuidv4(), name: "Phulkari Dupatta — Punjab Heritage", description: "Dense floral embroidery on hand-loomed cotton. Phulkari is a dying craft — each piece takes 3 weeks to make.", price: 1299, mrp: 1900, stock: 15, category_id: catMap["dupattas"], image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", tags: "phulkari,embroidery,punjab", is_featured: 0
    },
    {
      id: uuidv4(), name: "Lehenga Set — Emerald Gota Patti", description: "Three-piece bridal lehenga in raw silk with gota patti embellishments. Comes with blouse and dupatta.", price: 18999, mrp: 28000, stock: 5, category_id: catMap["lehengas"], image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80", tags: "bridal,lehenga,gotapatti,silk", is_featured: 1
    },
    {
      id: uuidv4(), name: "Pashmina Shawl — Kashmir Winter", description: "Pure Pashmina from the high-altitude goats of Ladakh. 12-ring test certified. Subtle self-print, natural ivory.", price: 8500, mrp: 12000, stock: 12, category_id: catMap["shawls"], image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80", tags: "pashmina,kashmir,winter,luxury", is_featured: 1
    },
    {
      id: uuidv4(), name: "Kani Weave Shawl — Floral Garden", description: "Rare Kani tapestry weave from Kanihama village, Kashmir. Each motif is interlocked by hand — no two are alike.", price: 14500, mrp: 20000, stock: 3, category_id: catMap["shawls"], image_url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80", tags: "kani,kashmir,artisan,rare", is_featured: 0
    },
    {
      id: uuidv4(), name: "Ikat Silk Saree — Odisha Temple", description: "Double-ikat silk saree woven in Sambalpur, Odisha. The ikat dyeing process alone takes 15+ days.", price: 7800, mrp: 11500, stock: 6, category_id: catMap["sarees"], image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80", tags: "ikat,silk,odisha,handloom", is_featured: 0
    },
  ];

  const insertProd = db.prepare(`INSERT INTO products 
    (id, name, description, price, mrp, stock, category_id, image_url, tags, is_featured)
    VALUES (@id, @name, @description, @price, @mrp, @stock, @category_id, @image_url, @tags, @is_featured)`);
  products.forEach((p) => insertProd.run(p));

  console.log("✅ Database seeded");
}

module.exports = db;
