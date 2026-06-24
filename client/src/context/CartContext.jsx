import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart([]); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch { setCart([]); }
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.map(p => p.id));
    } catch { setWishlist([]); }
  }, [user]);

  useEffect(() => { fetchCart(); fetchWishlist(); }, [fetchCart, fetchWishlist]);

  const addToCart = async (product_id, quantity = 1) => {
    await api.post('/cart', { product_id, quantity });
    await fetchCart();
  };

  const updateCart = async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (id) => {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  };

  const toggleWishlist = async (product_id) => {
    const { data } = await api.post(`/wishlist/${product_id}`);
    await fetchWishlist();
    return data.wishlisted;
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const isWishlisted = (id) => wishlist.includes(id);

  return (
    <CartCtx.Provider value={{ cart, addToCart, updateCart, removeFromCart, cartCount, cartTotal, wishlist, toggleWishlist, isWishlisted, fetchCart }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
