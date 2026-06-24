import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import './Home.css';

const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=80',
    tag: 'New Collection',
    title: 'Woven from the\nheart of India',
    sub: 'Chanderi silks, Banarasi weaves & Pashmina from master artisans',
    link: '/shop?category=sarees',
    cta: 'Explore Sarees',
  },
  {
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1400&q=80',
    tag: 'Kurtas',
    title: 'Slow fashion.\nFast beauty.',
    sub: 'Khadi kurtas block-printed by hand. Supporting artisans from Kutch.',
    link: '/shop?category=kurtas',
    cta: 'Shop Kurtas',
  },
  {
    img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1400&q=80',
    tag: 'Luxury Shawls',
    title: 'Pure Pashmina\nfrom Ladakh',
    sub: 'High-altitude goat wool. 12-ring certified. Yours for life.',
    link: '/shop?category=shawls',
    cta: 'Shop Shawls',
  },
];

const CRAFTS = [
  { name: 'Banarasi', region: 'Varanasi, UP', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80', slug: 'sarees' },
  { name: 'Phulkari', region: 'Punjab', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', slug: 'dupattas' },
  { name: 'Bandhani', region: 'Rajasthan', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80', slug: 'dupattas' },
  { name: 'Pashmina', region: 'Kashmir', img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80', slug: 'shawls' },
];

const TRUST_ITEMS = [
  { icon: <Icon name="shield-check" size={18} />, head: 'Handcrafted', sub: 'Woven by artisans, not machines' },
  { icon: <Icon name="diamond" size={18} />, head: 'Authentic', sub: 'GI-tagged fabrics & verified crafts' },
  { icon: <Icon name="truck" size={18} />, head: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: <Icon name="refresh-cw" size={18} />, head: 'Easy Returns', sub: '15-day hassle-free returns' },
];

function SkeletonFeatured() {
  return (
    <div className="skeleton-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img skeleton" />
          <div className="skeleton-text skeleton med" />
          <div className="skeleton-text skeleton short" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?featured=true&limit=4').then(r => {
      setFeatured(r.data.products);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = HERO_SLIDES[slide];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${s.img})` }} />
        <div className="hero-overlay" />
        <div className="hero-content container">
          <p className="hero-tag fade-in-up">{s.tag}</p>
          <h1 className="hero-title display fade-in-up" style={{animationDelay:'0.1s'}}>{s.title}</h1>
          <p className="hero-sub fade-in-up" style={{animationDelay:'0.2s'}}>{s.sub}</p>
          <Link to={s.link} className="btn btn-clay fade-in-up" style={{animationDelay:'0.3s'}}>{s.cta}</Link>
        </div>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
        <div className="hero-scroll-hint">
          <span className="scroll-arrow"><Icon name="arrow-down" size={14} /></span>
          <span className="scroll-label">Scroll to explore</span>
        </div>
      </section>

      <section className="trust-bar fade-in">
        <div className="container trust-inner">
          {TRUST_ITEMS.map(({ icon, head, sub }) => (
            <div key={head} className="trust-item">
              <span className="trust-icon">{icon}</span>
              <div>
                <p className="trust-head">{head}</p>
                <p className="trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container fade-in-up">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Curated for you</p>
            <h2 className="section-title display">Featured Pieces</h2>
          </div>
          <Link to="/shop?featured=true" className="btn btn-outline">View All</Link>
        </div>
        {loading ? <SkeletonFeatured /> : (
          <div className="grid-4 stagger">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="crafts-section">
        <div className="container">
          <p className="section-eyebrow" style={{textAlign:'center'}}>Heritage of craft</p>
          <h2 className="section-title display" style={{textAlign:'center',marginBottom:'36px'}}>Roots of Every Thread</h2>
          <div className="crafts-grid stagger">
            {CRAFTS.map(c => (
              <Link to={`/shop?category=${c.slug}`} key={c.name} className="craft-card">
                <div className="craft-img-wrap img-zoom">
                  <img src={c.img} alt={c.name} loading="lazy" />
                </div>
                <div className="craft-info">
                  <p className="craft-name display">{c.name}</p>
                  <p className="craft-region">{c.region}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="story-banner container fade-in-up">
        <div className="story-inner">
          <div className="story-text">
            <p className="section-eyebrow">Our Story</p>
            <h2 className="display" style={{fontSize:'36px', lineHeight:1.25, marginBottom:'16px'}}>
              Every weave is a conversation between the hand and the loom.
            </h2>
            <p style={{color:'var(--muted)', fontSize:'15px', lineHeight:1.7, marginBottom:'24px'}}>
              VASTRE was born from the belief that Indian textiles deserve a platform that honours their stories — not just their appearance. We work directly with artisans' cooperatives across 14 states.
            </p>
            <Link to="/shop" className="btn btn-primary">Shop the Collection</Link>
          </div>
          <div className="story-img img-zoom">
            <img src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80" alt="Artisan" />
          </div>
        </div>
      </section>
    </main>
  );
}
