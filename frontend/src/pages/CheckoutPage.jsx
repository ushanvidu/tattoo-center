import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getPayhereHash } from '../utils/api';
import { fmt } from '../data/data';
import Icons from '../components/shared/Icons';

const SHIPPING      = 350;
const PAYHERE_URL_SANDBOX = 'https://sandbox.payhere.lk/pay/checkout';
const PAYHERE_URL_LIVE    = 'https://www.payhere.lk/pay/checkout';

/* ── small helper: load PayHere SDK script once ── */
function usePayhereScript(sandbox) {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || typeof window === 'undefined') return;
    const src = sandbox
      ? 'https://sandbox.payhere.lk/lib/payhere.js'
      : 'https://www.payhere.lk/lib/payhere.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { loaded.current = true; return; }
    const s = document.createElement('script');
    s.src   = src;
    s.async = true;
    s.onload = () => { loaded.current = true; };
    document.head.appendChild(s);
  }, [sandbox]);
}

/* ── Koko installment display ── */
function KokoInstallments({ total }) {
  const perMonth = Math.ceil(total / 3);
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          flex: 1, background: 'rgba(255,184,0,.07)',
          border: '1px solid rgba(255,184,0,.2)',
          borderRadius: 10, padding: '13px 10px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,184,0,.6)', fontFamily: 'var(--f-mono)', marginBottom: 4 }}>
            MONTH {n}
          </div>
          <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 700, fontSize: 17, color: '#ffb800' }}>
            {fmt(perMonth)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const s        = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name,      setName]      = useState(user?.fullName || '');
  const [email,     setEmail]     = useState(user?.email || '');
  const [phone,     setPhone]     = useState(user?.phone || '');
  const [address,   setAddress]   = useState('');
  const [city,      setCity]      = useState('');
  const [step,      setStep]      = useState(1);
  const [payMethod, setPayMethod] = useState('payhere');
  const [error,     setError]     = useState('');
  const [paying,    setPaying]    = useState(false);

  const shipping = SHIPPING;
  const subtotal = s.cartTotal;
  const total    = subtotal + shipping;

  /* Sync user data when it loads from auth storage */
  useEffect(() => {
    if (user?.fullName && !name) setName(user.fullName);
    if (user?.email   && !email) setEmail(user.email);
    if (user?.phone   && !phone) setPhone(user.phone);
  }, [user]); // eslint-disable-line

  /* Load PayHere JS SDK */
  usePayhereScript(true); // set false once going live

  if (s.cart.length === 0) {
    return (
      <div className="wrap section col ac jc" style={{ paddingTop: 'calc(var(--nav-h) + 60px)', gap: 16, textAlign: 'center' }}>
        <Icons.cart style={{ width: 48, height: 48, color: 'var(--faint)' }} />
        <h2 className="h2">Your cart is empty</h2>
        <Link to="/shop" className="btn btn-acc">Shop Equipment</Link>
      </div>
    );
  }

  function validateDetails() {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  }

  /* ── PayHere payment ── */
  async function handlePayhere() {
    setPaying(true);
    setError('');
    try {
      const orderId = `TC-${Date.now()}`;
      const { hash, merchant_id, sandbox } = await getPayhereHash(orderId, total);

      const payment = {
        sandbox,
        merchant_id,
        return_url:  `${window.location.origin}/order-confirm/${orderId}`,
        cancel_url:  `${window.location.origin}/checkout`,
        notify_url:  `${window.location.origin.replace('5173', '5001')}/api/payment/payhere-notify`,
        order_id:    orderId,
        items:       `Tattoo Center Order (${s.cart.length} item${s.cart.length > 1 ? 's' : ''})`,
        amount:      total.toFixed(2),
        currency:    'LKR',
        hash,
        first_name:  name.split(' ')[0] || name,
        last_name:   name.split(' ').slice(1).join(' ') || '-',
        email,
        phone,
        address,
        city,
        country:     'Sri Lanka',
      };

      /* Set up event handlers on window.payhere */
      if (window.payhere) {
        window.payhere.onCompleted = async (pid) => {
          try {
            const order = await createOrder({
              items: s.cart, total, name, email, phone, address, city,
              user_id: user?.id, payhere_id: pid, payment_method: 'payhere',
              status: 'paid',
            });
            s.clearCart();
            navigate(`/order-confirm/${order._id || orderId}`);
          } catch {
            s.clearCart();
            navigate(`/order-confirm/${orderId}`);
          }
        };
        window.payhere.onDismissed = () => {
          setError('Payment was cancelled. You can try again.');
          setPaying(false);
        };
        window.payhere.onError = (msg) => {
          setError(`Payment error: ${msg}. Please try again.`);
          setPaying(false);
        };
        window.payhere.startPayment(payment);
      } else {
        /* Fallback: redirect to hosted PayHere checkout via POST form */
        const url = sandbox ? PAYHERE_URL_SANDBOX : PAYHERE_URL_LIVE;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        Object.entries(payment).forEach(([k, v]) => {
          const inp = document.createElement('input');
          inp.type = 'hidden'; inp.name = k; inp.value = String(v);
          form.appendChild(inp);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not initiate payment. Please try again.');
      setPaying(false);
    }
  }

  /* ── Koko payment (placeholder until merchant account activated) ── */
  async function handleKoko() {
    setPaying(true);
    setError('');
    try {
      const orderId = `TC-KOKO-${Date.now()}`;
      await createOrder({
        items: s.cart, total, name, email, phone, address, city,
        user_id: user?.id, payment_method: 'koko', status: 'pending',
      });
      // Once Koko merchant account is active, redirect to Koko checkout here
      setError('Koko BNPL is available — please contact us on WhatsApp to complete your installment plan order.');
    } catch {
      setError('Could not create order. Please try WhatsApp ordering.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'calc(var(--bar-h, 40px) + var(--nav-h, 70px) + 28px)', paddingBottom: 80, background: 'var(--bg)' }}>
      <div className="wrap">

        <div style={{ marginBottom: 32 }}>
          <span className="eyebrow no-line">Secure Checkout</span>
          <h1 className="h1" style={{ fontSize: 36, marginTop: 8 }}>Complete Your Order</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,380px)', gap: 40, alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div className="col gap24">

            {/* Step 1: Shipping details */}
            <div className="card card-pad">
              <div className="flex jb ac" style={{ marginBottom: 20 }}>
                <h2 className="h3">1. Shipping Details</h2>
                {step > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Edit</button>}
              </div>

              {step === 1 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div className="field">
                      <label>Full Name *</label>
                      <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="Kasun Perera" />
                    </div>
                    <div className="field">
                      <label>Email *</label>
                      <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="field">
                      <label>Phone *</label>
                      <input className="inp" value={phone} onChange={e => setPhone(e.target.value)} placeholder="071 234 5678" />
                    </div>
                    <div className="field">
                      <label>City *</label>
                      <input className="inp" value={city} onChange={e => setCity(e.target.value)} placeholder="Colombo" />
                    </div>
                    <div className="field" style={{ gridColumn: '1/-1' }}>
                      <label>Delivery Address *</label>
                      <textarea className="inp" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="No. 42, Temple Road, Dehiwala" />
                    </div>
                  </div>
                  {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                  <button className="btn btn-acc" onClick={() => validateDetails() && setStep(2)}>
                    Continue to Payment <Icons.arrow />
                  </button>
                </>
              ) : (
                <p className="text-dim">{name} · {email} · {city}</p>
              )}
            </div>

            {/* Step 2: Payment method */}
            {step >= 2 && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom: 20 }}>2. Payment Method</h2>

                {/* Method tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                  {/* PayHere tab */}
                  <button
                    type="button"
                    onClick={() => setPayMethod('payhere')}
                    style={{
                      flex: 1, padding: '13px 10px',
                      borderRadius: 10, cursor: 'pointer',
                      border: payMethod === 'payhere'
                        ? '2px solid var(--acc)'
                        : '2px solid rgba(255,255,255,.08)',
                      background: payMethod === 'payhere'
                        ? 'rgba(0,224,198,.07)'
                        : 'rgba(255,255,255,.03)',
                      transition: '.18s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>💳</span>
                    <span style={{
                      fontFamily: 'var(--f-disp)', fontSize: 12, fontWeight: 700,
                      letterSpacing: '.05em', textTransform: 'uppercase',
                      color: payMethod === 'payhere' ? 'var(--acc)' : 'var(--dim)',
                    }}>
                      PayHere
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--faint)' }}>Card · Bank · Mobile</span>
                  </button>

                  {/* Koko tab */}
                  <button
                    type="button"
                    onClick={() => setPayMethod('koko')}
                    style={{
                      flex: 1, padding: '13px 10px',
                      borderRadius: 10, cursor: 'pointer',
                      border: payMethod === 'koko'
                        ? '2px solid #ffb800'
                        : '2px solid rgba(255,255,255,.08)',
                      background: payMethod === 'koko'
                        ? 'rgba(255,184,0,.07)'
                        : 'rgba(255,255,255,.03)',
                      transition: '.18s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🛒</span>
                    <span style={{
                      fontFamily: 'var(--f-disp)', fontSize: 12, fontWeight: 700,
                      letterSpacing: '.05em', textTransform: 'uppercase',
                      color: payMethod === 'koko' ? '#ffb800' : 'var(--dim)',
                    }}>
                      Koko
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--faint)' }}>Pay in 3 months</span>
                  </button>
                </div>

                {/* ── PayHere panel ── */}
                {payMethod === 'payhere' && (
                  <>
                    <div style={{
                      background: 'rgba(0,224,198,.05)',
                      border: '1px solid rgba(0,224,198,.15)',
                      borderRadius: 10, padding: '12px 14px', marginBottom: 18,
                      fontSize: 13, color: 'var(--dim)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--acc)', display: 'block', marginBottom: 4 }}>PayHere — Secure Sri Lankan Payment Gateway</strong>
                      Pay with Visa, Mastercard, AMEX, internet banking, or mobile payment apps (frimi, eZcash, mCash). Your card details are never stored on our server.
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                      {['Visa', 'Mastercard', 'AMEX', 'frimi', 'eZcash', 'mCash', 'Internet Banking'].map(m => (
                        <span key={m} style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(255,255,255,.05)',
                          border: '1px solid rgba(255,255,255,.1)',
                          fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--f-mono)',
                        }}>{m}</span>
                      ))}
                    </div>
                    {error && (
                      <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
                    )}
                    <button
                      className="btn btn-acc btn-block"
                      onClick={handlePayhere}
                      disabled={paying}
                      style={{ opacity: paying ? .7 : 1 }}
                    >
                      {paying ? 'Opening PayHere…' : `Pay ${fmt(total)} with PayHere →`}
                    </button>
                  </>
                )}

                {/* ── Koko BNPL panel ── */}
                {payMethod === 'koko' && (
                  <>
                    <div style={{
                      background: 'rgba(255,184,0,.05)',
                      border: '1px solid rgba(255,184,0,.15)',
                      borderRadius: 10, padding: '12px 14px', marginBottom: 18,
                      fontSize: 13, color: 'var(--dim)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: '#ffb800', display: 'block', marginBottom: 4 }}>Koko — Buy Now, Pay in 3 Easy Installments</strong>
                      Split your total into 3 equal monthly payments — no hidden fees, no interest. Available to eligible cardholders.
                    </div>
                    <KokoInstallments total={total} />
                    {error && (
                      <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
                    )}
                    <button
                      className="btn btn-block"
                      onClick={handleKoko}
                      disabled={paying}
                      style={{
                        opacity: paying ? .7 : 1,
                        background: 'linear-gradient(135deg, #ffb800, #ff8c00)',
                        color: '#1a0a00', fontWeight: 700,
                        border: 'none', borderRadius: 10,
                        padding: '13px 20px', cursor: 'pointer',
                        fontFamily: 'var(--f-disp)', fontSize: 14,
                        letterSpacing: '.04em', textTransform: 'uppercase',
                      }}
                    >
                      {paying ? 'Processing…' : `Pay with Koko — ${fmt(Math.ceil(total / 3))}/mo`}
                    </button>
                    <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 10, textAlign: 'center' }}>
                      Subject to Koko eligibility check · Powered by koko.lk
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Order summary ── */}
          <div className="card card-pad col gap14" style={{ position: 'sticky', top: 'calc(var(--bar-h, 40px) + var(--nav-h, 70px) + 20px)' }}>
            <h3 className="h3" style={{ fontSize: 16 }}>Order Summary</h3>
            {s.cart.map(i => (
              <div key={i.id} className="flex jb gap12" style={{ fontSize: 13, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--f-disp)', textTransform: 'uppercase', fontSize: 12, marginBottom: 2 }}>{i.name}</div>
                  <div className="text-dim" style={{ fontSize: 11 }}>Qty: {i.qty}</div>
                </div>
                <span style={{ fontFamily: 'var(--f-disp)', fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="flex jb text-dim" style={{ fontSize: 13 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex jb text-dim" style={{ fontSize: 13 }}><span>Shipping</span><span>{fmt(shipping)}</span></div>
            <div className="flex jb" style={{ fontSize: 18, fontFamily: 'var(--f-disp)', fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
              <span>Total</span><span style={{ color: 'var(--acc)' }}>{fmt(total)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
              <div className="flex ac gap8" style={{ fontSize: 11.5, color: 'var(--faint)' }}>
                <Icons.shield style={{ width: 13, height: 13 }} />
                <span>SSL Encrypted · Secure Checkout</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--faint)', paddingLeft: 21 }}>
                PayHere · Koko BNPL · Island-wide delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
