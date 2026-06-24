import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import './Shop.css';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name', label: 'Name A–Z' },
];

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img skeleton" />
          <div className="skeleton-text skeleton med" />
          <div className="skeleton-text skeleton short" />
        </div>
      ))}
    </div>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const featured = params.get('featured') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1');

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setParams(p);
  };

  const setPage = (n) => {
    const p = new URLSearchParams(params);
    p.set('page', n);
    setParams(p);
  };

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, sort, limit: 12 });
    if (category) q.set('category', category);
    if (search) q.set('search', search);
    if (featured) q.set('featured', featured);

    api.get(`/products?${q.toString()}`).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, search, featured, sort, page]);

  return (
    <div className="shop-page container fade-in">
      <aside className="shop-sidebar">
        <h2 className="sidebar-title display">Shop</h2>

        <div className="filter-group">
          <p className="filter-label">Category</p>
          <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
          {cats.map(c => (
            <button key={c.id} className={`filter-btn ${category === c.slug ? 'active' : ''}`} onClick={() => setParam('category', c.slug)}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <p className="filter-label">Sort By</p>
          {SORTS.map(s => (
            <button key={s.value} className={`filter-btn ${sort === s.value ? 'active' : ''}`} onClick={() => setParam('sort', s.value)}>
              {s.label}
            </button>
          ))}
        </div>

        {featured && (
          <div className="filter-group">
            <button className="filter-btn active" onClick={() => setParam('featured', '')}><Icon name="close" size={12} /> Featured only</button>
          </div>
        )}
      </aside>

      <div className="shop-main">
        <div className="shop-bar">
          <p className="shop-count">
            {search ? `Results for "${search}" —` : ''} <strong>{total}</strong> {total === 1 ? 'piece' : 'pieces'}
          </p>
          <select className="input sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <div className="empty-state fade-in">
            <Icon name="needle" size={48} />
            <p>No pieces found.</p>
            <button className="btn btn-outline" onClick={() => setParams({})}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="grid-4 stagger">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {pages > 1 && (
              <div className="pagination fade-in-up">
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
