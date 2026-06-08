import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Password strength ─────────────────────────────────────── */
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8)              s++;
  if (pw.length >= 12)             s++;
  if (/[A-Z]/.test(pw))            s++;
  if (/\d/.test(pw))               s++;
  if (/[^A-Za-z0-9]/.test(pw))    s++;
  return s;
}
const STRENGTH_LABEL = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#00e0c6'];

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= s ? STRENGTH_COLOR[s] : 'rgba(255,255,255,.1)', transition: 'background .3s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: STRENGTH_COLOR[s], fontFamily: 'monospace', letterSpacing: '.06em' }}>
        {STRENGTH_LABEL[s]}
      </span>
    </div>
  );
}

/* ── Eye icon ──────────────────────────────────────────────── */
function Eye({ open }) {
  return open
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>
    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.9 17.9A10 10 0 0 1 12 19c-6 0-10-7-10-7a18 18 0 0 1 5.1-5.9"/><path d="M10.4 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.1 3.1"/><path d="m2 2 20 20"/></svg>;
}

/* ── Label + error wrapper ─────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: -2 }}>{error}</span>}
    </div>
  );
}

/* ── Password input with show/hide ────────────────────────── */
function PassInput({ value, onChange, placeholder, autoComplete, error }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="inp"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          paddingRight: 44,
          borderColor: error ? 'rgba(239,68,68,.6)' : undefined,
        }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--faint)', display: 'flex', alignItems: 'center', padding: 4,
          zIndex: 2,
        }}
        tabIndex={-1}
      >
        <Eye open={show} />
      </button>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function LoginPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from || '/account';

  const [tab,       setTab]       = useState(location.hash === '#register' ? 'register' : 'login');
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [fieldErrs, setFieldErrs] = useState({});

  /* redirect if already logged in */
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  function switchTab(t) {
    setTab(t); setError(''); setFieldErrs({});
    setPassword(''); setConfirm('');
  }

  /* ── Validation ── */
  function validateLogin() {
    const e = {};
    if (!email.trim())  e.email    = 'Email is required';
    if (!password)      e.password = 'Password is required';
    setFieldErrs(e);
    return !Object.keys(e).length;
  }

  function validateRegister() {
    const e = {};
    if (!name.trim())   e.name     = 'Full name is required';
    if (!email.trim())  e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password)      e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Min 8 characters';
    else if (!/\d/.test(password)) e.password = 'Must contain at least one number';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setFieldErrs(e);
    return !Object.keys(e).length;
  }

  /* ── Submit ── */
  async function handleLogin(e) {
    e.preventDefault();
    if (!validateLogin()) return;
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!validateRegister()) return;
    setError('');
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      /* push content below fixed announcement bar (40px) + nav (70px) */
      paddingTop: 'calc(var(--bar-h, 40px) + var(--nav-h, 70px) + 28px)',
      paddingBottom: 60,
      paddingLeft: 'var(--hpad)',
      paddingRight: 'var(--hpad)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,224,198,.10), transparent 55%)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(255,255,255,.09)',
          borderRadius: 20,
          padding: '32px 28px 26px',
          boxShadow: '0 32px 80px rgba(0,0,0,.5)',
        }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 11, padding: 4, marginBottom: 28, gap: 4 }}>
            {[['login','Sign In'],['register','Create Account']].map(([id, lbl]) => (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: "'Oswald',sans-serif", fontSize: 13.5, fontWeight: 600,
                  letterSpacing: '.04em', textTransform: 'uppercase', transition: '.2s',
                  background: tab === id ? 'linear-gradient(135deg,#00e0c6,#00b4d8)' : 'none',
                  color: tab === id ? '#042522' : 'rgba(255,255,255,.45)',
                  boxShadow: tab === id ? '0 4px 18px rgba(0,224,198,.28)' : 'none',
                }}
              >{lbl}</button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 9, padding: '11px 14px', marginBottom: 20,
              display: 'flex', gap: 9, alignItems: 'flex-start',
            }}>
              <span style={{ color: '#ef4444', fontSize: 15, lineHeight: 1, flexShrink: 0 }}>⚠</span>
              <span style={{ color: '#fca5a5', fontSize: 13.5, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Email Address" error={fieldErrs.email}>
                <input
                  className="inp"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ borderColor: fieldErrs.email ? 'rgba(239,68,68,.6)' : undefined }}
                />
              </Field>

              <Field label="Password" error={fieldErrs.password}>
                <PassInput
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  error={fieldErrs.password}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-acc btn-block"
                style={{ marginTop: 4, opacity: loading ? .7 : 1, transition: 'opacity .15s' }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>
                No account?{' '}
                <button type="button" onClick={() => switchTab('register')} style={{ color: 'var(--acc)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 13, padding: 0 }}>
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full Name" error={fieldErrs.name}>
                <input
                  className="inp"
                  type="text"
                  autoComplete="name"
                  placeholder="Kasun Perera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ borderColor: fieldErrs.name ? 'rgba(239,68,68,.6)' : undefined }}
                />
              </Field>

              <Field label="Email Address" error={fieldErrs.email}>
                <input
                  className="inp"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ borderColor: fieldErrs.email ? 'rgba(239,68,68,.6)' : undefined }}
                />
              </Field>

              <Field label="Password" error={fieldErrs.password}>
                <PassInput
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 chars + one number"
                  autoComplete="new-password"
                  error={fieldErrs.password}
                />
                <PasswordStrengthBar password={password} />
              </Field>

              <Field label="Confirm Password" error={fieldErrs.confirm}>
                <PassInput
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  error={fieldErrs.confirm}
                />
                {confirm && confirm === password && !fieldErrs.confirm && (
                  <span style={{ fontSize: 12, color: '#22c55e', marginTop: -2 }}>✓ Passwords match</span>
                )}
              </Field>

              {/* Requirements checklist */}
              {password && (
                <div style={{
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 9, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 5,
                }}>
                  {[
                    [password.length >= 8,         'At least 8 characters'],
                    [/\d/.test(password),           'Contains a number'],
                    [/[A-Z]/.test(password),        'Contains uppercase letter'],
                    [/[^A-Za-z0-9]/.test(password), 'Special character (optional)'],
                  ].map(([met, lbl]) => (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: met ? '#22c55e' : 'rgba(255,255,255,.3)', transition: 'color .2s' }}>
                      <span style={{ width: 14, textAlign: 'center', flexShrink: 0 }}>{met ? '✓' : '○'}</span>
                      {lbl}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-acc btn-block"
                style={{ marginTop: 4, opacity: loading ? .7 : 1, transition: 'opacity .15s' }}
              >
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>
                Have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} style={{ color: 'var(--acc)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 13, padding: 0 }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 20, flexWrap: 'wrap' }}>
          {['🔒 Secure & encrypted', '✓ No spam ever', '⚡ Instant access'].map(t => (
            <span key={t} style={{ fontSize: 11.5, color: 'var(--faint)', fontFamily: 'monospace', letterSpacing: '.06em' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
