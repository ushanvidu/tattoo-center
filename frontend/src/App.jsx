import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }  from './context/AuthContext';
import Header       from './components/layout/Header';
import Footer       from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import CartDrawer   from './components/overlays/CartDrawer';
import QuickPreview from './components/overlays/QuickPreview';
import BookingModal from './components/overlays/BookingModal';
import WhatsAppFAB  from './components/overlays/WhatsAppFAB';
import Toasts       from './components/overlays/Toasts';

import HomePage         from './pages/HomePage';
import ShopPage         from './pages/ShopPage';
import StencilPage      from './pages/StencilPage';
import ProductPage      from './pages/ProductPage';
import CategoryPage     from './pages/CategoryPage';
import BookingPage      from './pages/BookingPage';
import AboutPage        from './pages/AboutPage';
import ContactPage      from './pages/ContactPage';
import FAQPage          from './pages/FAQPage';
import LoginPage        from './pages/LoginPage';
import AccountPage      from './pages/AccountPage';
import CheckoutPage     from './pages/CheckoutPage';
import OrderConfirmPage from './pages/OrderConfirmPage';

import AdminLoginPage   from './pages/admin/AdminLoginPage';
import AdminDashboard   from './pages/admin/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicLayout() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/shop"              element={<ShopPage />} />
          <Route path="/shop/:cat"         element={<CategoryPage />} />
          <Route path="/product/:id"       element={<ProductPage />} />
          <Route path="/stencil"           element={<StencilPage />} />
          <Route path="/booking"           element={<BookingPage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/faq"               element={<FAQPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/checkout"          element={<CheckoutPage />} />
          <Route path="/order-confirm/:id" element={<OrderConfirmPage />} />
          <Route path="/account"           element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <QuickPreview />
      <BookingModal />
      <WhatsAppFAB />
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/*"     element={<AdminDashboard />} />
      <Route path="/*"           element={<PublicLayout />} />
    </Routes>
  );
}
