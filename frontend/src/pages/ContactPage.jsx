import { useState } from 'react';
import { Link } from 'react-router-dom';
import { waLink, WA_DISPLAY } from '../data/data';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

export default function ContactPage() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [product, setProduct] = useState('');
  const [message, setMessage] = useState('');
  const [demo,    setDemo]    = useState(false);
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const text = `*Contact Form*%0AName: ${name}%0AEmail: ${email}%0AProduct: ${product || 'N/A'}%0ADemo: ${demo ? 'Yes' : 'No'}%0A%0A${message}`;
    window.open(`https://wa.me/94760336161?text=${text}`, '_blank');
    await new Promise(r => setTimeout(r, 800));
    setDone(true); setLoading(false);
  }

  const INFO = [
    { icon: <Icons.wa />,    label: 'WhatsApp',    value: WA_DISPLAY,              href: waLink('Hi Tattoo Center!') },
    { icon: <Icons.phone />, label: 'Phone',       value: '+94 76 033 6161',       href: 'tel:+94760336161' },
    { icon: <Icons.mail />,  label: 'Email',       value: 'info@tattoo-center.lk', href: 'mailto:info@tattoo-center.lk' },
    { icon: <Icons.pin />,   label: 'Location',    value: 'Colombo, Sri Lanka',    href: null },
  ];

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>

      <div className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow no-line" style={{ marginBottom: 14 }}>Get in Touch</span>
          <h1 className="h1" style={{ marginBottom: 16 }}>We're Here to Help</h1>
          <p className="lede">Questions about equipment, demo bookings, or orders? Reach out any time.</p>
        </div>
      </div>

      <div className="wrap section">
        <div className="side-grid w440">

          {/* form */}
          <Reveal>
            {done ? (
              <div className="card card-pad col ac jc" style={{ gap: 16, textAlign: 'center', padding: '60px 32px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center' }}>
                  <Icons.check style={{ width: 32, height: 32 }} />
                </div>
                <h2 className="h2" style={{ fontSize: 26 }}>Message Sent!</h2>
                <p className="text-dim">We've received your message and will respond via WhatsApp shortly.</p>
                <button className="btn btn-ghost" onClick={() => setDone(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={submit} className="col gap16">
                <h2 className="h2" style={{ fontSize: 26, marginBottom: 4 }}>Send Us a Message</h2>
                <div className="form-grid-2">
                  <div className="field"><label>Name *</label><input className="inp" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
                  <div className="field"><label>Email *</label><input className="inp" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
                </div>
                <div className="field"><label>Product Interest</label><input className="inp" value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Stencil Printers, Machines..." /></div>
                <div className="field"><label>Message *</label><textarea className="inp" required value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us how we can help…" style={{ minHeight: 120 }} /></div>
                <label className="flex ac gap10" style={{ cursor: 'pointer', fontSize: 14, color: 'var(--dim)' }}>
                  <input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)} />
                  I'm interested in booking a live demo
                </label>
                <button className="btn btn-acc btn-lg" type="submit" disabled={loading}>
                  {loading ? 'Sending…' : <><Icons.wa /> Send via WhatsApp</>}
                </button>
                <p className="text-dim" style={{ fontSize: 12 }}>Your message will open in WhatsApp so we can reply instantly.</p>
              </form>
            )}
          </Reveal>

          {/* sidebar */}
          <div className="col gap16">
            <Reveal>
              {INFO.map(({ icon, label, value, href }) => (
                <div key={label} className="card card-pad flex gap14 ac" style={{ marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(0,224,198,.08)', border: '1px solid rgba(0,224,198,.2)', display: 'grid', placeItems: 'center', color: 'var(--acc)', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 3 }}>{label}</div>
                    {href ? <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', fontSize: 15, fontFamily: 'var(--f-disp)', textTransform: 'uppercase' }}>{value}</a>
                           : <span style={{ color: 'var(--text)', fontSize: 15, fontFamily: 'var(--f-disp)', textTransform: 'uppercase' }}>{value}</span>}
                  </div>
                </div>
              ))}
            </Reveal>

            {/* map placeholder */}
            <Reveal>
              <div className="ph" style={{ borderRadius: 'var(--r)', aspectRatio: '16/9', border: '1px solid var(--line-2)' }}>
                <span className="ph-label">Map — Colombo, Sri Lanka</span>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--faint)' }}>
                  <div className="col ac gap8">
                    <Icons.pin style={{ width: 28, height: 28 }} />
                    <span className="mono" style={{ fontSize: 11, letterSpacing: '.1em' }}>COLOMBO, SRI LANKA</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Link to="/booking" className="btn btn-acc btn-block btn-lg">
              <Icons.cal /> Book a Live Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
