import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { fmt, discount, stars, FALLBACK_IMG } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import './ProductDetail.css';

function DetailSkeleton() {
  return (
    <div className="detail-skeleton container">
      <div className="detail-grid">
        <div className="skeleton" style={{aspectRatio:'3/4',borderRadius:'var(--radius-lg)'}} />
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="skeleton" style={{height:12,width:80}} />
          <div className="skeleton" style={{height:28,width:'80%'}} />
          <div className="skeleton" style={{height:12,width:120}} />
          <div className="skeleton" style={{height:40,width:'60%',marginTop:16}} />
          <div className="skeleton" style={{height:60,width:'100%',marginTop:8}} />
          <div className="skeleton" style={{height:40,width:'100%',marginTop:16}} />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      return api.get(`/products?category=${r.data.category_name}&limit=4`);
    }).then(r => {
      setRelated(r.data.products.filter(p => p.id !== id).slice(0, 4));
    }).catch(() => navigate('/shop'));
  }, [id]);

  const handleCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      showToast(`Added ${qty} × ${product.name.split('—')[0].trim()} to bag`);
    } catch { showToast('Could not add to bag'); }
    setAdding(false);
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    const r = await toggleWishlist(product.id);
    showToast(r ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      const r = await api.get(`/products/${id}`);
      setProduct(r.data);
      setReview({ rating: 5, comment: '' });
      showToast('Review submitted!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not submit review');
    }
    setSubmitting(false);
  };

  if (!product) return <DetailSkeleton />;

  const disc = discount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);
  const tags = product.tags ? product.tags.split(',') : [];

  return (
    <div className="product-detail fade-in">
      <div className="container">
        <nav className="breadcrumb">
          <span onClick={() => navigate('/shop')} style={{cursor:'pointer'}}>Shop</span>
          <Icon name="chevron-right" size={12} />
          <span onClick={() => navigate(`/shop?category=${product.category_name?.toLowerCase()}`)} style={{cursor:'pointer'}}>{product.category_name}</span>
          <Icon name="chevron-right" size={12} />
          <span className="bc-active">{product.name.split('—')[0].trim()}</span>
        </nav>

        <div className="detail-grid fade-in-up">
          <div className="detail-img-wrap img-zoom">
            <img
              src={imgErr ? FALLBACK_IMG : product.image_url}
              alt={product.name}
              onError={() => setImgErr(true)}
              loading="eager"
            />
            {!imgErr && disc >= 10 && <span className="product-discount-tag">{disc}% off</span>}
          </div>

          <div className="detail-info fade-in-up" style={{animationDelay:'0.15s'}}>
            <p className="detail-category">{product.category_name}</p>
            <h1 className="detail-name display">{product.name}</h1>

            {product.avgRating && (
              <div className="detail-rating">
                <span className="stars">{stars(product.avgRating)}</span>
                <span style={{fontSize:'13px',color:'var(--muted)'}}>{product.avgRating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="detail-price">
              <span className="price-main" style={{fontSize:'26px'}}>{fmt(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="price-mrp" style={{fontSize:'16px'}}>{fmt(product.mrp)}</span>
                  <span className="discount">{disc}% off</span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {tags.length > 0 && (
              <div className="detail-tags">
                {tags.map(t => <span key={t} className="badge badge-sand">{t.trim()}</span>)}
              </div>
            )}

            <div className={`stock-status ${product.stock <= 3 ? 'low' : ''}`}>
              {product.stock === 0 ? (
                <><Icon name="close" size={14} /> Out of stock</>
              ) : product.stock <= 3 ? (
                <><Icon name="alert" size={14} /> Only {product.stock} left</>
              ) : (
                <><Icon name="check" size={14} /> In stock ({product.stock} available)</>
              )}
            </div>

            {product.stock > 0 && (
              <div className="qty-row">
                <div className="qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
                  <span className="qty-value">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
                </div>
                <button className="btn btn-primary add-cart-btn" onClick={handleCart} disabled={adding}>
                  {adding ? 'Adding…' : 'Add to Bag'}
                </button>
                <button className={`wishlist-icon ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}>
                  <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={18} />
                </button>
              </div>
            )}

            <div className="detail-perks">
              <p><Icon name="truck" size={14} /> Free shipping on orders above ₹999</p>
              <p><Icon name="refresh-cw" size={14} /> Easy 15-day returns</p>
              <p><Icon name="shield-check" size={14} /> Authenticity guaranteed</p>
            </div>
          </div>
        </div>

        <div className="reviews-section fade-in-up">
          <h2 className="display" style={{fontSize:'28px', marginBottom:'24px'}}>Customer Reviews</h2>

          {product.reviews?.length === 0 && (
            <p style={{color:'var(--muted)', marginBottom:'32px'}}>No reviews yet. Be the first!</p>
          )}

          <div className="reviews-list">
            {product.reviews?.map(r => (
              <div key={r.id} className="review-card scale-in">
                <div className="review-header">
                  <div>
                    <p className="review-user">{r.user_name}</p>
                    <span className="stars">{stars(r.rating)}</span>
                  </div>
                  <p className="review-date">{new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>

          {user && (
            <form className="review-form scale-in" onSubmit={handleReview}>
              <h3 className="display" style={{fontSize:'20px',marginBottom:'16px'}}>Write a Review</h3>
              <div className="star-select">
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} className={`star-btn ${n <= review.rating ? 'active' : ''}`} onClick={() => setReview(r => ({...r, rating: n}))}>★</button>
                ))}
              </div>
              <textarea className="input" rows={3} placeholder="Share your experience with this piece…" value={review.comment} onChange={e => setReview(r => ({...r, comment: e.target.value}))} style={{resize:'vertical', marginTop:'12px'}} />
              <button className="btn btn-clay" type="submit" disabled={submitting} style={{marginTop:'12px'}}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <p className="section-eyebrow">You may also like</p>
            <h2 className="section-title display" style={{marginBottom:'28px'}}>Related Pieces</h2>
            <div className="grid-4 stagger">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
