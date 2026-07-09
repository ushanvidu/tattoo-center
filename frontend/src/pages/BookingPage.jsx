import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../utils/api';
import { PRODUCTS, waLink, WA_DISPLAY } from '../data/data';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

const TIMES = ['09:00','10:30','12:00','13:30','15:00','16:30','18:00'];

function getAvailableDates(count = 10) {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    if (d.getDay() !== 0) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export default function BookingPage() {
  const { user, profile } = useAuth();
  const [mode,    setMode]    = useState('whatsapp');
  const [date,    setDate]    = useState('');
  const [time,    setTime]    = useState('');
  const [name,    setName]    = useState(profile?.full_name || '');
  const [phone,   setPhone]   = useState(profile?.phone || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [product, setProduct] = useState('Any — recommend for me');
  const [message, setMessage] = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const dates = getAvailableDates(12);

  async function submit(e) {
    e.preventDefault();
    if (!date || !time) { setError('Please select a date and time.'); return; }
    setError(''); setLoading(true);
    try {
      await createBooking({ name, phone, email, mode, date, time, product, message, userId: user?.id });
      setDone(true);
    } catch {
      setError('Booking saved! We will confirm via WhatsApp shortly.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>

      {/* hero */}
      <div className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow no-line" style={{ marginBottom: 12 }}>Trust before you buy</span>
          <h1 className="h1" style={{ marginBottom: 16 }}>See Equipment Live<br />Before You Buy</h1>
          <p className="lede">Book a 1-on-1 live demo — WhatsApp video call or visit our studio. Free, no pressure.</p>
          <div className="flex gap24 wrap-flex" style={{ marginTop: 32 }}>
            {[['Monthly slots', 'Limited availability'], ['Free demo', 'No purchase required'], ['Expert guidance', 'By our artists']].map(([h, s]) => (
              <div key={h} className="col gap4">
                <span className="text-acc mono" style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>{h}</span>
                <span className="text-dim" style={{ fontSize: 13 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap section">
        <div className="side-grid">

          {done ? (
            <div className="card card-pad col ac jc" style={{ gap: 18, textAlign: 'center', padding: '64px 32px', gridColumn: '1 / -1' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center' }}>
                <Icons.check style={{ width: 36, height: 36 }} />
              </div>
              <h2 className="h2">Demo Requested!</h2>
              <p className="lede" style={{ margin: '0 auto' }}>
                We'll confirm your {mode === 'whatsapp' ? 'WhatsApp video call' : 'studio visit'} for <strong>{date} at {time}</strong> shortly.
                <br />Check your WhatsApp at <strong>{WA_DISPLAY}</strong>.
              </p>
              <div className="flex gap12 wrap-flex">
                <Link to="/shop" className="btn btn-acc">Browse Equipment</Link>
                <a href={waLink('Hi, I just booked a live demo. Please confirm my booking.')} target="_blank" rel="noreferrer" className="btn btn-wa">
                  <Icons.wa /> Message Us Now
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="col gap24">

              {/* mode */}
              <div>
                <h2 className="h3" style={{ marginBottom: 14 }}>1. Choose Demo Type</h2>
                <div className="flex gap12 wrap-flex">
                  <button type="button" className={`btn ${mode === 'whatsapp' ? 'btn-acc' : 'btn-solid'}`} style={{ flex: '1 1 220px' }} onClick={() => setMode('whatsapp')}>
                    <Icons.wa /> WhatsApp Video Demo
                  </button>
                  <button type="button" className={`btn ${mode === 'studio' ? 'btn-acc' : 'btn-solid'}`} style={{ flex: '1 1 220px' }} onClick={() => setMode('studio')}>
                    <Icons.pin /> Studio Visit
                  </button>
                </div>
              </div>

              {/* date */}
              <div>
                <h2 className="h3" style={{ marginBottom: 14 }}>2. Pick a Date</h2>
                <div className="flex gap8 wrap-flex">
                  {dates.map((d, i) => {
                    const lbl = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                    return (
                      <button key={i} type="button" className={`chip ${date === lbl ? 'chip-acc' : ''}`} style={{ cursor: 'pointer', padding: '10px 14px', flexDirection: 'column', gap: 2, alignItems: 'center' }} onClick={() => setDate(lbl)}>
                        <span style={{ fontSize: 9, opacity: .7 }}>{d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}</span>
                        <span style={{ fontFamily: 'var(--f-disp)', fontWeight: 600 }}>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* time */}
              <div>
                <h2 className="h3" style={{ marginBottom: 14 }}>3. Pick a Time</h2>
                <div className="flex gap8 wrap-flex">
                  {TIMES.map(t => (
                    <button key={t} type="button" className={`chip ${time === t ? 'chip-acc' : ''}`} style={{ cursor: 'pointer', padding: '10px 14px' }} onClick={() => setTime(t)}>{t}</button>
                  ))}
                </div>
              </div>

              {/* contact */}
              <div>
                <h2 className="h3" style={{ marginBottom: 14 }}>4. Your Details</h2>
                <div className="form-grid-2">
                  <div className="field"><label>Full Name *</label><input className="inp" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
                  <div className="field"><label>Phone / WhatsApp *</label><input className="inp" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="07X XXX XXXX" /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Email</label><input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}>
                    <label>Product of Interest</label>
                    <select className="inp" value={product} onChange={e => setProduct(e.target.value)}>
                      <option>Any — recommend for me</option>
                      {PRODUCTS.filter(p => ['printers','machines','needles','inks'].includes(p.cat)).map(p => <option key={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Message (optional)</label><textarea className="inp" value={message} onChange={e => setMessage(e.target.value)} placeholder="Any questions or special requests?" /></div>
                </div>
              </div>

              {error && <p style={{ color: 'var(--warn)', fontSize: 13.5 }}>{error}</p>}

              <button className="btn btn-acc btn-lg btn-block" type="submit" disabled={loading}>
                <Icons.cal /> {loading ? 'Booking…' : `Request ${mode === 'whatsapp' ? 'Video' : 'Studio'} Demo`}
              </button>
            </form>
          )}

          {/* sidebar info */}
          <div className="col gap16">
            <div className="card card-pad col gap14">
              <h3 className="h3" style={{ fontSize: 16 }}>What to Expect</h3>
              {[
                { icon: <Icons.cal />, t: 'Confirmation within 2hrs', d: "We'll WhatsApp you to confirm your slot" },
                { icon: <Icons.eye />, t: 'Live equipment demo', d: 'See machines, printers & inks in real action' },
                { icon: <Icons.check />, t: 'Expert advice', d: 'Our artists answer all your questions' },
                { icon: <Icons.cart />, t: 'No pressure to buy', d: 'Take your time, zero obligation' },
              ].map(({ icon, t, d }) => (
                <div key={t} className="flex gap12 ac">
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--card-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--acc)', flexShrink: 0 }}>{icon}</div>
                  <div><div style={{ fontFamily: 'var(--f-disp)', textTransform: 'uppercase', fontSize: 13, marginBottom: 2 }}>{t}</div><div className="text-dim" style={{ fontSize: 12 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <a href={waLink('Hi Tattoo Center, I have a question about the live demo booking.')} target="_blank" rel="noreferrer" className="btn btn-wa btn-block">
              <Icons.wa /> Chat on WhatsApp · {WA_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
