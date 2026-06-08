import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLoginPage() {
  const { login }   = useAdmin();
  const navigate     = useNavigate();
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0d0d12 0%,#12121a 100%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#00e0c6,#00b4d8)', marginBottom: 16, fontSize: 24, fontWeight: 900, color: '#000' }}>T</div>
          <h1 style={{ fontFamily: "'Cinzel','Trajan Pro',serif", fontSize: 20, letterSpacing: '.12em', color: '#fff', margin: 0, textTransform: 'uppercase' }}>Tattoo Center</h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 4, fontFamily: 'monospace' }}>Admin Panel</p>
        </div>

        {/* card */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: '36px 32px', backdropFilter: 'blur(12px)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', fontFamily: 'monospace' }}>Username</label>
              <input
                className="inp"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', fontFamily: 'monospace' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="inp"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', paddingRight: 44, width: '100%' }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 12, fontFamily: 'monospace' }}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,60,60,.12)', border: '1px solid rgba(220,60,60,.3)', borderRadius: 8, padding: '10px 14px', color: '#ff8080', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{ marginTop: 6, padding: '14px 0', borderRadius: 10, border: 'none', background: loading ? 'rgba(0,224,198,.4)' : 'linear-gradient(135deg,#00e0c6,#00b4d8)', color: '#000', fontFamily: "'Oswald','Arial Narrow',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: '.2s' }}
            >
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,.2)', fontSize: 12 }}>
          <a href="/" style={{ color: 'rgba(0,224,198,.6)', textDecoration: 'none' }}>← Back to website</a>
        </p>
      </div>
    </div>
  );
}
