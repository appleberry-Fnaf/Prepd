import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { CatMark } from '../components/Logo';

export default function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSaving(true);
    const { error } = await updatePassword(password);
    if (error) setError(error);
    else { setDone(true); setTimeout(() => navigate('/profile'), 1600); }
    setSaving(false);
  }

  const fieldLabel = { fontSize: 11, fontFamily: 'var(--ah-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'var(--ah-muted)', marginBottom: 8, display: 'block' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ah-mono)', fontSize: 12, color: 'var(--ah-muted)', textDecoration: 'none', marginBottom: 28 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <div className="dk-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <CatMark className="w-9 h-9" />
            <div>
              <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 16, fontWeight: 700, color: 'var(--ah-text)' }}>Prepd</div>
              <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', letterSpacing: '0.04em' }}>AP STUDY PLATFORM</div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ah-text)', marginBottom: 6 }}>Set a new password</h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><div className="dk-spin" /></div>
          ) : done ? (
            <div className="dk-alert dk-alert-green">✓ Password updated — taking you to your profile…</div>
          ) : !user ? (
            <div>
              <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                This reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link to="/auth" className="dk-btn dk-btn-primary">Back to sign in</Link>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: 22 }}>Choose a new password for your account.</p>
              {error && <div className="dk-alert dk-alert-red" style={{ marginBottom: 16 }}>⚠ {error}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={fieldLabel}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <div className="dk-input-icon">
                      <Lock className="w-4 h-4" />
                      <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min 6 characters" required minLength={6} className="dk-input" style={{ paddingLeft: 40, paddingRight: 44 }} />
                    </div>
                    <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ah-muted)' }}>
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={fieldLabel}>Confirm password</label>
                  <div className="dk-input-icon">
                    <Lock className="w-4 h-4" />
                    <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password" required minLength={6} className="dk-input" style={{ paddingLeft: 40 }} />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="dk-btn dk-btn-primary" style={{ width: '100%', marginTop: 4 }}>
                  {saving ? <div className="dk-spin" style={{ width: 18, height: 18, borderTopColor: '#1e1c1a' }} /> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
