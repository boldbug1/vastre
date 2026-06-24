import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // Don't clear local state here — let AuthContext handle it via /auth/me
    }
    return Promise.reject(err);
  }
);

export default api;

export const fmt = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const discount = (price, mrp) =>
  mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

export const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">'
  + '<rect width="400" height="533" fill="#F5EDE0"/>'
  + '<text x="200" y="270" font-family="Georgia,serif" font-size="20" fill="#8B7355" text-anchor="middle">VASTRE</text>'
  + '</svg>'
);
