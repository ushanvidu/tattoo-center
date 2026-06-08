import { Link } from 'react-router-dom';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

const STATS = [{ n: '8+', l: 'Years in Industry' }, { n: '2,400+', l: 'Artists Served' }, { n: '50+', l: 'Brands Stocked' }, { n: '4.9★', l: 'Avg. Rating' }];

const TEAM = [
  { name: 'Kasun P.', role: 'Founder & Lead Artist', years: '12 yrs tattooing', bio: 'Professional tattoo artist turned equipment curator. Tests every product personally before listing.' },
  { name: 'Dilshan M.', role: 'Equipment Specialist', years: '8 yrs in the industry', bio: 'Former distributor rep. Knows every spec of every machine we stock.' },
  { name: 'Sachini R.', role: 'Customer Experience', years: '5 yrs support', bio: 'Fluent in English & Sinhala. Handles all WhatsApp orders and demo bookings.' },
];

const VALUES = [
  { icon: <Icons.shield />, title: 'Artist-Tested Quality', body: 'Every product is scratch-tested by our team of professional tattoo artists before being listed on the site.' },
  { icon: <Icons.eye />,    title: 'See Before You Buy',   body: 'We introduced live demo bookings because we believe in full transparency. No surprises after purchase.' },
  { icon: <Icons.truck />,  title: 'Reliable Delivery',   body: 'Island-wide delivery with tracking. International orders via DHL. Equipment arrives safely packed.' },
  { icon: <Icons.bolt />,   title: 'Premium Partners',    body: 'We partner with leading global brands — Cheyenne, Bishop, FK Irons, Eternal — to bring you the best.' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>

      {/* hero */}
      <div className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow no-line" style={{ marginBottom: 14 }}>Our Story</span>
          <h1 className="h1" style={{ marginBottom: 18 }}>Built by Artists,<br />For Artists</h1>
          <p className="lede">Tattoo Center was born from a simple frustration: great equipment was hard to find in Sri Lanka. We changed that.</p>
        </div>
      </div>

      {/* stats */}
      <div className="wrap section">
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, borderRadius: 'var(--r)', overflow: 'hidden', border: '1px solid var(--line)' }}>
            {STATS.map(({ n, l }) => (
              <div key={l} style={{ background: 'var(--card)', padding: '32px 24px', textAlign: 'center' }}>
                <div className="h1" style={{ color: 'var(--acc)', fontSize: 'clamp(28px,4vw,48px)', marginBottom: 6 }}>{n}</div>
                <div className="text-dim mono" style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* mission */}
      <div className="wrap section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <Reveal>
            <span className="eyebrow no-line" style={{ marginBottom: 14 }}>Our Mission</span>
            <h2 className="h2" style={{ marginBottom: 20 }}>Professional Equipment Should Be Accessible to Every Artist</h2>
            <p className="lede" style={{ marginBottom: 20 }}>
              We believe every tattooist — from apprentice to world-class professional — deserves access to the same quality equipment used in top studios globally.
            </p>
            <p className="text-dim" style={{ lineHeight: 1.7, marginBottom: 28 }}>
              Tattoo Center was founded in 2018 to bridge the gap between international premium brands and local artists in Sri Lanka. Today we serve artists across the country and ship internationally.
            </p>
            <Link to="/shop" className="btn btn-acc">Explore Our Range</Link>
          </Reveal>
          <Reveal>
            <div className="ph" style={{ borderRadius: 'var(--r-xl)', aspectRatio: '4/5', border: '1px solid var(--line-2)' }}>
              <span className="ph-label">Studio Photo</span>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(0,224,198,.15), transparent 60%)' }} />
            </div>
          </Reveal>
        </div>
      </div>

      {/* values */}
      <div className="wrap section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">What We Stand For</span>
            <h2 className="h2">Our Core Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {VALUES.map(({ icon, title, body }) => (
              <div key={title} className="card card-pad flex gap16">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,224,198,.08)', border: '1px solid rgba(0,224,198,.2)', display: 'grid', placeItems: 'center', color: 'var(--acc)', flexShrink: 0 }}>{icon}</div>
                <div>
                  <h3 className="h3" style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
                  <p className="text-dim" style={{ fontSize: 14 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* team */}
      <div className="wrap section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">The People Behind It</span>
            <h2 className="h2">Meet the Team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TEAM.map(({ name, role, years, bio }) => (
              <div key={name} className="card card-pad col gap14">
                <div className="avatar" style={{ width: 60, height: 60, fontSize: 22 }}>{name[0]}</div>
                <div>
                  <h3 className="h3" style={{ fontSize: 17, marginBottom: 3 }}>{name}</h3>
                  <p className="text-acc mono" style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>{role}</p>
                  <p className="text-dim" style={{ fontSize: 11.5 }}>{years}</p>
                </div>
                <p className="text-dim" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{bio}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* CTA */}
      <div className="wrap" style={{ paddingBottom: 100 }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 24px', background: 'linear-gradient(135deg, var(--card) 0%, rgba(0,224,198,.06) 100%)' }}>
          <h2 className="h2" style={{ marginBottom: 12 }}>Ready to Upgrade Your Studio?</h2>
          <p className="lede" style={{ margin: '0 auto 28px' }}>Book a free live demo and meet the team.</p>
          <div className="flex ac jc gap12 wrap-flex">
            <Link to="/booking" className="btn btn-acc btn-lg"><Icons.cal /> Book a Demo</Link>
            <Link to="/contact" className="btn btn-ghost btn-lg"><Icons.mail /> Get in Touch</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
