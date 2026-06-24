import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import Icon from '../components/Icon';
import './Admin.css';

const EMPTY_FORM = { name: '', description: '', price: '', mrp: '', stock: '', category_id: '', image_url: '', tags: '', is_featured: false };

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=100'),
      api.get('/categories')
    ]).then(([p, c]) => {
      setProducts(p.data.products);
      setCategories(c.data);
    }).catch(() => showToast('Failed to load data')).finally(() => setLoading(false));
  }, []);

  if (authLoading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { showToast('Name and price are required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        stock: parseInt(form.stock) || 0,
        is_featured: form.is_featured
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast('Product updated');
      } else {
        await api.post('/products', payload);
        showToast('Product created');
      }
      resetForm();
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save product');
    }
    setSubmitting(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      mrp: p.mrp ? String(p.mrp) : '', stock: String(p.stock),
      category_id: p.category_id || '', image_url: p.image_url || '',
      tags: p.tags || '', is_featured: !!p.is_featured
    });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted');
      setProducts(p => p.filter(x => x.id !== id));
    } catch {
      showToast('Failed to delete');
    }
  };

  return (
    <div className="admin-page container fade-in">
      <div className="admin-header">
        <h1 className="display admin-title">Admin Panel</h1>
        <p className="admin-sub">Manage your product catalog</p>
      </div>

      <div className="admin-layout">
        <form className="admin-form card" onSubmit={handleSubmit}>
          <h2 className="display admin-form-title">{editingId ? 'Edit Product' : 'Add Product'}</h2>

          <div className="admin-field">
            <label>Name *</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
          </div>

          <div className="admin-field">
            <label>Description</label>
            <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description" style={{resize:'vertical'}} />
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label>Price (₹) *</label>
              <input className="input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="1999" />
            </div>
            <div className="admin-field">
              <label>MRP (₹)</label>
              <input className="input" name="mrp" type="number" step="0.01" min="0" value={form.mrp} onChange={handleChange} placeholder="2999" />
            </div>
          </div>

          <div className="admin-row">
            <div className="admin-field">
              <label>Stock</label>
              <input className="input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="10" />
            </div>
            <div className="admin-field">
              <label>Category</label>
              <select className="input" name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="admin-field">
            <label>Image URL</label>
            <input className="input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://images.unsplash.com/…" />
          </div>

          <div className="admin-field">
            <label>Tags (comma-separated)</label>
            <input className="input" name="tags" value={form.tags} onChange={handleChange} placeholder="silk,festive,handwoven" />
          </div>

          <label className="admin-checkbox">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
            <span>Featured product</span>
          </label>

          <div className="admin-form-actions">
            <button className="btn btn-clay" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            {editingId && <button className="btn btn-outline" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="admin-list">
          <h2 className="display admin-form-title">Products ({products.length})</h2>
          {loading ? <div className="page-loader"><div className="spinner" /></div> : (
            <div className="admin-products">
              {products.map(p => (
                <div key={p.id} className="admin-product-item">
                  <div className="admin-product-img">
                    {p.image_url ? <img src={p.image_url} alt={p.name} /> : <Icon name="bag" size={24} />}
                  </div>
                  <div className="admin-product-info">
                    <p className="admin-product-name">{p.name}</p>
                    <p className="admin-product-meta">₹{p.price} · Stock: {p.stock}{p.is_featured ? ' · Featured' : ''}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button className="btn-ghost" onClick={() => handleEdit(p)} title="Edit"><Icon name="edit" size={16} /></button>
                    <button className="btn-ghost" onClick={() => handleDelete(p.id)} title="Delete" style={{color:'var(--clay)'}}><Icon name="trash" size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
