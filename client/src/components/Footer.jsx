import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-logo display">VASTRE</p>
          <p className="footer-tagline">वस्त्र — Handcrafted with care.</p>
          <p className="footer-desc">
            Curating the finest Indian ethnic wear from master artisans across the subcontinent.
            Every piece tells a story.
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Shop</p>
          <Link to="/shop?category=sarees">Sarees</Link>
          <Link to="/shop?category=kurtas">Kurtas</Link>
          <Link to="/shop?category=dupattas">Dupattas</Link>
          <Link to="/shop?category=lehengas">Lehengas</Link>
          <Link to="/shop?category=shawls">Shawls</Link>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Account</p>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/cart">My Bag</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Crafts</p>
          <Link to="/shop?category=sarees">Banarasi</Link>
          <Link to="/shop?category=dupattas">Phulkari</Link>
          <Link to="/shop?category=dupattas">Bandhani</Link>
          <Link to="/shop?category=shawls">Pashmina</Link>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} VASTRE — Made with care in Bharat</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
        </div>
      </div>
    </footer>
  );
}
