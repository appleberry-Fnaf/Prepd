import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
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
    if (password !== confirm) { setError('The passwords don’t match.'); return; }
    setSaving(true);
    const { error } = await updatePassword(password);
    if (error) setError(error);
    else { setDone(true); setTimeout(() => navigate('/profile'), 1600); }
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-taupe-600 hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-taupe-300/50 p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <CatMark className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-ink">Prepd</h1>
              <p className="text-xs text-taupe-500">AP Study Platform</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Set a new password</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-stone/40 border-t-ink rounded-full animate-spin" />
            </div>
          ) : done ? (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">Password updated! Taking you to your profile…</p>
            </div>
          ) : !user ? (
            <div>
              <p className="text-sm text-taupe-600 mb-4">
                This reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link to="/auth" className="btn-warm inline-flex items-center gap-2">Back to sign in</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-taupe-500 mb-6">Choose a new password for your account.</p>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                    <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe-400 hover:text-ink">
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                    <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required minLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ink text-parchment font-semibold text-sm hover:bg-ink/90 transition-all disabled:opacity-50 shadow-md shadow-ink/15">
                  {saving ? <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" /> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
