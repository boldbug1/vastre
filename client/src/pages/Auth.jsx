import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import './Auth.css';

export function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!');
      navigate(from);
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card scale-in">
        <div className="auth-brand">
          <Icon name="needle" size={32} />
          <p className="display" style={{fontSize:'28px', letterSpacing:'0.1em', marginTop:'8px'}}>VASTRE</p>
          <p style={{fontSize:'11px', color:'var(--clay)', letterSpacing:'0.08em'}}>वस्त्र</p>
        </div>
        <h1 className="auth-title display">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
          </div>
          <button className="btn btn-clay auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">New to VASTRE? <Link to="/register">Create account</Link></p>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      showToast('Account created! Welcome to VASTRE');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card scale-in">
        <div className="auth-brand">
          <Icon name="needle" size={32} />
          <p className="display" style={{fontSize:'28px', letterSpacing:'0.1em', marginTop:'8px'}}>VASTRE</p>
          <p style={{fontSize:'11px', color:'var(--clay)', letterSpacing:'0.08em'}}>वस्त्र</p>
        </div>
        <h1 className="auth-title display">Join VASTRE</h1>
        <p className="auth-sub">Create your account to start shopping</p>
        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" required placeholder="Priya Sharma" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" required placeholder="priya@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
          </div>
          <button className="btn btn-clay auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
