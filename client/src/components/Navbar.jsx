import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Icon from './Icon';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, loading: authLoading } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="logo">
          <span className="logo-main display">VASTRE</span>
          <span className="logo-sub">वस्त्र</span>
        </Link>

        <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>All</Link>
          <Link to="/shop?category=sarees" onClick={() => setMenuOpen(false)}>Sarees</Link>
          <Link to="/shop?category=kurtas" onClick={() => setMenuOpen(false)}>Kurtas</Link>
          <Link to="/shop?category=dupattas" onClick={() => setMenuOpen(false)}>Dupattas</Link>
          <Link to="/shop?category=lehengas" onClick={() => setMenuOpen(false)}>Lehengas</Link>
          <Link to="/shop?category=shawls" onClick={() => setMenuOpen(false)}>Shawls</Link>

          <form className="nav-search-mobile" onSubmit={handleSearch}>
            <input className="input" placeholder="Search…" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          </form>
        </nav>

        <div className="nav-actions">
          <form className="nav-search" onSubmit={handleSearch}>
            <input className="input" placeholder="Search ethnic wear…" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
            <button type="submit" className="search-btn" aria-label="Search"><Icon name="search" size={16} /></button>
          </form>

          {authLoading ? (
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>…</span>
          ) : user ? (
            <div className="nav-user">
              <Link to="/wishlist" title="Wishlist"><Icon name="heart" size={18} /></Link>
              <Link to="/orders" title="Orders"><Icon name="package" size={18} /></Link>
              {user.role === 'admin' && <Link to="/admin" title="Admin" className="admin-link">A</Link>}
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="btn-ghost" onClick={handleLogout} style={{fontSize:'12px'}}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost" style={{fontSize:'13px'}}>Login</Link>
          )}

          <Link to="/cart" className="cart-btn" title="Cart">
            <Icon name="bag" size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
