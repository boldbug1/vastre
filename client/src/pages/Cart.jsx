import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api, { fmt, FALLBACK_IMG } from '../api';
import Icon from '../components/Icon';
import './Cart.css';

function CartItem({ item, updateCart, removeFromCart }) {
  const [imgErr, setImgErr] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(item.id), 250);
  };

  return (
    <div className={`cart-item ${removing ? 'removing' : ''}`}>
      <Link to={`/product/${item.product_id}`} className="cart-item-img-wrap img-zoom">
        <img
          src={imgErr ? FALLBACK_IMG : item.image_url}
          alt={item.name}
          className="cart-item-img"
          onError={() => setImgErr(true)}
        />
      </Link>
      <div className="cart-item-info">
        <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
        <p className="cart-item-price">{fmt(item.price)}</p>
        <div className="cart-item-actions">
          <div className="qty-control">
            <button onClick={() => updateCart(item.id, item.quantity - 1)} aria-label="Decrease"><Icon name="minus" size={14} /></button>
            <span className="qty-value">{item.quantity}</span>
            <button onClick={() => updateCart(item.id, Math.min(item.stock, item.quantity + 1))} aria-label="Increase"><Icon name="plus" size={14} /></button>
          </div>
          <button className="remove-btn" onClick={handleRemove}><Icon name="trash" size={13} /> Remove</button>
        </div>
      </div>
      <p className="cart-item-total">{fmt(item.price * item.quantity)}</p>
    </div>
  );
}

function ShippingProgress({ cartTotal }) {
  const freeThreshold = 999;
  if (cartTotal >= freeThreshold) {
    return (
      <div className="shipping-progress">
        <div className="shipping-bar-track"><div className="shipping-bar-fill free" style={{width:'100%'}} /></div>
        <p className="shipping-msg free"><Icon name="check" size={12} /> You've earned free shipping!</p>
      </div>
    );
  }
  const pct = Math.min((cartTotal / freeThreshold) * 100, 99);
  return (
    <div className="shipping-progress">
      <div className="shipping-bar-track"><div className="shipping-bar-fill" style={{width:`${pct}%`}} /></div>
      <p className="shipping-msg">Add <strong>{fmt(freeThreshold - cartTotal)}</strong> more for free shipping</p>
    </div>
  );
}

export default function Cart() {
  const { cart, updateCart, removeFromCart, cartTotal, fetchCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const handleOrder = async () => {
    if (!address.trim()) { showToast('Please enter your delivery address'); return; }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { address });
      await fetchCart();
      setOrderDone(data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not place order');
    }
    setPlacing(false);
  };

  if (orderDone) return (
    <div className="container order-success fade-in">
      <div className="order-success-card scale-in">
        <div className="success-icon-wrap"><Icon name="needle" size={40} /></div>
        <h2 className="display">Order Placed!</h2>
        <p>Your order <strong>#{orderDone.orderId.slice(0,8).toUpperCase()}</strong> for <strong>{fmt(orderDone.total)}</strong> has been placed successfully.</p>
        <p className="success-note">We'll begin processing it shortly. Expect delivery in 5–7 working days.</p>
        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  if (!cart.length) return (
    <div className="container empty-cart fade-in">
      <div className="empty-icon"><Icon name="bag" size={48} /></div>
      <h2 className="display">Your bag is empty</h2>
      <p className="empty-sub">Add some handcrafted pieces to get started.</p>
      <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
    </div>
  );

  const shipping = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shipping;
  const itemWord = cart.length === 1 ? 'item' : 'items';

  return (
    <div className="cart-page container fade-in">
      <div className="cart-top">
        <h1 className="display cart-title">My Bag</h1>
        <p className="cart-count">{cart.reduce((s,i) => s + i.quantity, 0)} {itemWord}</p>
      </div>
      <ShippingProgress cartTotal={cartTotal} />
      <div className="cart-grid">
        <div className="cart-items stagger">
          {cart.map(item => (
            <CartItem key={item.id} item={item} updateCart={updateCart} removeFromCart={removeFromCart} />
          ))}
        </div>

        <div className="cart-summary card scale-in">
          <h2 className="display summary-title">Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'shipping-free' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
          </div>
          <hr className="divider" />
          <div className="summary-row total"><span>Total</span><span className="total-amount">{fmt(grandTotal)}</span></div>

          {user ? (
            <div className="checkout-section">
              <div className="address-group">
                <label className="address-label">Delivery Address</label>
                <textarea
                  className="input address-input"
                  rows={3}
                  placeholder="Flat / House No., Area, City, Pincode"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
              <button className="btn btn-clay checkout-btn" onClick={handleOrder} disabled={placing}>
                {placing ? (
                  <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Placing Order…</>
                ) : 'Place Order'}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary login-checkout-link">Login to Checkout</Link>
          )}
        </div>
      </div>
    </div>
  );
}
