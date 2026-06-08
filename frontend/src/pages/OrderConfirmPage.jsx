import { useParams, Link } from 'react-router-dom';
import { waLink } from '../data/data';
import Icons from '../components/shared/Icons';

export default function OrderConfirmPage() {
  const { id } = useParams();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav-h)', background: 'var(--bg)' }}>
      <div className="wrap" style={{ textAlign: 'center', paddingBlock: 80 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center', margin: '0 auto 28px' }}>
          <Icons.check style={{ width: 40, height: 40 }} />
        </div>
        <h1 className="h1" style={{ marginBottom: 14 }}>Order Confirmed!</h1>
        <p className="lede" style={{ margin: '0 auto 8px' }}>
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="text-dim mono" style={{ fontSize: 11, letterSpacing: '.14em', marginBottom: 40 }}>ORDER ID: {id?.toUpperCase()}</p>

        <div className="flex ac jc gap12 wrap-flex">
          <Link to="/shop" className="btn btn-acc btn-lg">Continue Shopping</Link>
          <a href={waLink(`Hi Tattoo Center, I just placed order #${id}. Please confirm my order status.`)} target="_blank" rel="noreferrer" className="btn btn-wa btn-lg">
            <Icons.wa /> Confirm via WhatsApp
          </a>
          <Link to="/account" className="btn btn-ghost">My Account</Link>
        </div>
      </div>
    </div>
  );
}
