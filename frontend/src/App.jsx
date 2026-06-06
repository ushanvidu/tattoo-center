import { useStore } from './context/StoreContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/overlays/CartDrawer';
import QuickPreview from './components/overlays/QuickPreview';
import BookingModal from './components/overlays/BookingModal';
import WhatsAppFAB from './components/overlays/WhatsAppFAB';
import Toasts from './components/overlays/Toasts';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import StencilPage from './pages/StencilPage';

function Pages() {
  const s = useStore();
  if (s.route === 'shop')    return <ShopPage />;
  if (s.route === 'stencil') return <StencilPage />;
  return <HomePage />;
}

export default function App() {
  return (
    <>
      <Header />
      <main><Pages /></main>
      <Footer />
      <CartDrawer />
      <QuickPreview />
      <BookingModal />
      <WhatsAppFAB />
      <Toasts />
    </>
  );
}
