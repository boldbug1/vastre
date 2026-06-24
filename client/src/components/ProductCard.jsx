import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { fmt, discount, stars, FALLBACK_IMG } from '../api';
import Icon from './Icon';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const [adding, setAdding] = useState(false);

  const disc = discount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);

  const handleCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id);
      showToast(`Added to bag — ${product.name.split('—')[0].trim()}`);
    } catch { showToast('Could not add to bag'); }
    setTimeout(() => setAdding(false), 400);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const result = await toggleWishlist(product.id);
    showToast(result ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card card">
      <div className="product-img-wrap">
        <img
          src={imgErr ? FALLBACK_IMG : product.image_url}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
        {!imgErr && disc >= 10 && (
          <span className="product-discount-tag">{disc}% off</span>
        )}
        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={16} />
        </button>
        {product.stock <= 3 && product.stock > 0 && (
          <span className="low-stock-tag">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="out-of-stock-overlay">Sold Out</span>
        )}
      </div>
      <div className="product-info">
        <p className="product-category">{product.category_name}</p>
        <h3 className="product-name">{product.name}</h3>
        {product.avgRating && (
          <p className="product-rating">
            <span className="stars">{stars(product.avgRating)}</span>
            <span className="rating-count">({product.reviewCount})</span>
          </p>
        )}
        <div className="product-price-row">
          <span className="price-main">{fmt(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="price-mrp">{fmt(product.mrp)}</span>
          )}
        </div>
        {product.stock > 0 ? (
          <button
            className={`btn btn-primary add-to-cart-btn ${adding ? 'adding' : ''}`}
            onClick={handleCart}
            disabled={adding}
          >
            {adding ? 'Adding…' : 'Add to Bag'}
          </button>
        ) : (
          <button className="btn btn-outline add-to-cart-btn" disabled>Sold Out</button>
        )}
      </div>
    </Link>
  );
}
