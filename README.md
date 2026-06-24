# 🪡 VASTRE — वस्त्र

> Handcrafted Indian Ethnic Wear — Full Stack E-Commerce

A production-ready e-commerce platform for Indian ethnic fashion. Built with Node.js + Express (backend), React + Vite (frontend), and SQLite (database).

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, React Router 6, Vite    |
| Backend  | Node.js, Express 4                |
| Database | SQLite via better-sqlite3         |
| Auth     | JWT + bcrypt                      |
| Styling  | Pure CSS (custom design system)   |

---

## Features

- 🛍 **Full product catalog** — 10 seeded products across 5 categories
- 🔍 **Search + Filter** — by category, price, featured; full-text search
- 🛒 **Cart** — add, update qty, remove; persisted per user
- ♡ **Wishlist** — toggle save per product
- 📦 **Orders** — place order from cart, view order history
- ⭐ **Reviews** — one review per user per product with star rating
- 🔐 **Auth** — register, login, JWT sessions (7d)
- 📱 **Responsive** — mobile-first layout

---

## Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone / unzip the project

```bash
cd vastre
```

### 2. Install dependencies

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 3. Run development servers

**Terminal 1 — Backend (port 3001)**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend (port 5173)**
```bash
cd client
npm run dev
```

Then open **http://localhost:5173**

---

## Project Structure

```
vastre/
├── server/
│   ├── index.js          # Express entry
│   ├── db.js             # SQLite + schema + seed
│   ├── middleware/
│   │   └── auth.js       # JWT middleware
│   └── routes/
│       ├── auth.js       # /api/auth/*
│       ├── products.js   # /api/products/*
│       └── shop.js       # /api/cart, /api/wishlist, /api/orders
│
└── client/
    └── src/
        ├── api.js         # Axios client + helpers
        ├── App.jsx        # Router
        ├── context/       # Auth, Cart, Toast contexts
        ├── components/    # Navbar, Footer, ProductCard
        └── pages/         # Home, Shop, ProductDetail, Cart, Auth, Orders, Wishlist
```

---

## API Reference

### Auth
| Method | Endpoint            | Auth | Description       |
|--------|---------------------|------|-------------------|
| POST   | /api/auth/register  | —    | Register user     |
| POST   | /api/auth/login     | —    | Login             |
| GET    | /api/auth/me        | ✓    | Get current user  |

### Products
| Method | Endpoint               | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /api/products          | —     | List (filter/search)|
| GET    | /api/products/:id      | —     | Product + reviews   |
| POST   | /api/products/:id/reviews | ✓  | Submit review       |
| POST   | /api/products          | admin | Create product      |
| PUT    | /api/products/:id      | admin | Update product      |
| DELETE | /api/products/:id      | admin | Delete product      |

### Cart / Orders / Wishlist
| Method | Endpoint                    | Auth | Description         |
|--------|-----------------------------|------|---------------------|
| GET    | /api/cart                   | ✓    | Get cart            |
| POST   | /api/cart                   | ✓    | Add to cart         |
| PUT    | /api/cart/:id               | ✓    | Update qty          |
| DELETE | /api/cart/:id               | ✓    | Remove item         |
| GET    | /api/wishlist               | ✓    | Get wishlist        |
| POST   | /api/wishlist/:product_id   | ✓    | Toggle wishlist     |
| GET    | /api/orders                 | ✓    | Order history       |
| POST   | /api/orders                 | ✓    | Place order         |

---

## Admin

To create an admin user, manually update the DB:

```bash
# In server directory, run a one-liner:
node -e "const db=require('./db'); db.prepare(\"UPDATE users SET role='admin' WHERE email=?\").run('your@email.com'); console.log('Done');"
```

Then admins can use the product CRUD endpoints.

---

## Design System

Palette inspired by Indian craft — clay, sand, bark:
- `--clay` `#C4714A` — terracotta accent
- `--sand` `#F5EDE0` — warm background tones
- `--bark` `#2C1F14` — rich dark text
- `--cream` `#FAF6F0` — off-white base

Fonts: **Cormorant Garamond** (display) + **DM Sans** (body)

---

Made with ❤️ for artisans across Bharat 🇮🇳
