import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

const ROUTE_MAP = {
  home: '/', shop: '/shop', stencil: '/stencil',
  booking: '/booking', contact: '/contact', about: '/about',
  faq: '/faq', account: '/account', checkout: '/checkout', login: '/login',
};

export function StoreProvider({ children }) {
  const navigate = useNavigate();

  const [cart,     setCart]     = useState(() => { try { return JSON.parse(localStorage.getItem('tc_cart')) || []; } catch { return []; } });
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('tc_wish')) || []; } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [booking,  setBooking]  = useState({ open: false, product: null });
  const [toasts,   setToasts]   = useState([]);

  useEffect(() => { localStorage.setItem('tc_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('tc_wish', JSON.stringify(wishlist)); }, [wishlist]);

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const navTo = useCallback((where, params = {}) => {
    if (where === 'booking') { setBooking({ open: true, product: null }); return; }
    const path = ROUTE_MAP[where] || `/${where}`;
    navigate(path, { state: params });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [navigate]);

  const addToCart = useCallback((p, qty = 1) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...p, qty }];
    });
    toast(`${p.name} added to cart`);
  }, [toast]);

  const removeFromCart = useCallback((id) => setCart(c => c.filter(i => i.id !== id)), []);
  const setQty         = useCallback((id, q) => setCart(c => q < 1 ? c.filter(i => i.id !== id) : c.map(i => i.id === id ? { ...i, qty: q } : i)), []);
  const toggleWish     = useCallback((id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]), []);
  const clearCart      = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  return (
    <StoreContext.Provider value={{
      navTo,
      cart, addToCart, removeFromCart, setQty, cartCount, cartTotal, clearCart,
      wishlist, toggleWish,
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      preview, openPreview: (p) => setPreview(p), closePreview: () => setPreview(null),
      booking, openBooking: (p = null) => setBooking({ open: true, product: p }), closeBooking: () => setBooking({ open: false, product: null }),
      toasts, toast,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
