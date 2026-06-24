import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { fmt, FALLBACK_IMG } from '../api';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import './Orders.css';

function OrderItemImg({ src, alt }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <img
      src={imgErr ? FALLBACK_IMG : src}
      alt={alt}
      className="order-item-img"
      onError={() => setImgErr(true)}
    />
  );
}

function OrdersSkeleton() {
  return (
    <div className="orders-list" style={{gap:20}}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="order-card skeleton-order">
          <div className="order-header">
            <div style={{flex:1}}>
              <div className="skeleton" style={{height:14,width:160,marginBottom:8}} />
              <div className="skeleton" style={{height:12,width:120}} />
            </div>
            <div style={{textAlign:'right',flex:1}}>
              <div className="skeleton" style={{height:14,width:80,marginBottom:8,marginLeft:'auto'}} />
              <div className="skeleton" style={{height:12,width:100,marginLeft:'auto'}} />
            </div>
          </div>
          <div className="order-items" style={{gap:12}}>
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="order-item" style={{gap:14}}>
                <div className="skeleton" style={{width:60,height:75,borderRadius:'var(--radius)'}} />
                <div style={{flex:1}}>
                  <div className="skeleton" style={{height:13,width:'60%',marginBottom:6}} />
                  <div className="skeleton" style={{height:12,width:'40%'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusColor = { pending: 'badge-sand', processing: 'badge-clay', shipped: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red' };

  return (
    <div className="container orders-page fade-in">
      <h1 className="display" style={{fontSize:'32px', marginBottom:'32px'}}>My Orders</h1>
      {loading ? <OrdersSkeleton /> : orders.length === 0 ? (
        <div className="empty-state fade-in">
          <Icon name="package" size={48} />
          <p>No orders yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list stagger">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{order.id.slice(0,8).toUpperCase()}</p>
                  <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <span className={`badge ${statusColor[order.status] || 'badge-sand'}`}>{order.status}</span>
                  <p className="order-total">{fmt(order.total)}</p>
                </div>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <OrderItemImg src={item.image_url} alt={item.name} />
                    <div>
                      <p className="order-item-name">{item.name}</p>
                      <p className="order-item-meta">Qty: {item.quantity} × {fmt(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {order.address && <p className="order-address"><Icon name="map" size={12} /> {order.address}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader fade-in"><div className="spinner" /></div>;

  return (
    <div className="container orders-page fade-in">
      <h1 className="display" style={{fontSize:'32px', marginBottom:'32px'}}>My Wishlist</h1>
      {items.length === 0 ? (
        <div className="empty-state">
          <Icon name="heart" size={48} />
          <p>Your wishlist is empty.</p>
          <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
        </div>
      ) : (
        <div className="grid-4 stagger">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
