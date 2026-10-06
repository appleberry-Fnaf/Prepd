import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { APSubject, Submission } from '../lib/supabase';
import { ShieldCheck, CheckCircle, XCircle, Clock, ExternalLink, Loader2, Inbox } from 'lucide-react';

export default function Moderate() {
  const { user, profile, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [hours, setHours] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isModerator = !!profile?.is_moderator;

  async function loadData() {
    const { data: subjectsData } = await supabase.from('ap_subjects').select('*');
    setSubjects(subjectsData || []);
    const { data: subData } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(subData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isModerator) loadData();
    else if (!authLoading) setLoading(false);
  }, [isModerator, authLoading]);

  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';

  async function decide(sub: Submission, status: 'approved' | 'rejected') {
    setBusy(sub.id);
    const vh = status === 'approved' ? parseFloat(hours[sub.id] || '0') || 0 : 0;
    await supabase.from('submissions').update({
      status, volunteer_hours: vh,
      moderator_notes: notes[sub.id] || null,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', sub.id);
    await loadData();
    setBusy(null);
  }

  if (authLoading || loading) return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;

  if (!user || !isModerator) {
    return (
      <div className="dk-empty" style={{ minHeight: '70vh' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <ShieldCheck className="w-7 h-7" style={{ color: 'var(--ah-muted)' }} />
        </div>
        <h2 className="dk-heading-lg" style={{ marginBottom: 8 }}>Moderators only</h2>
        <p style={{ color: 'var(--ah-muted)', marginBottom: 24, maxWidth: 340, lineHeight: 1.6 }}>
          Ask an admin to enable moderator access on your account.
        </p>
        <Link to="/" className="dk-btn dk-btn-ghost">Back to home</Link>
      </div>
    );
  }

  const pending  = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending').slice(0, 10);

  const fieldLabel = { fontSize: 11, fontFamily: 'var(--ah-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'var(--ah-muted)', marginBottom: 6, display: 'block' };

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">Moderate</span>
        <h1 className="dk-heading-xl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck className="w-8 h-8" style={{ color: '#a78bfa' }} /> Review queue
        </h1>
        <p className="dk-sub" style={{ maxWidth: 480 }}>
          Approve or reject submissions. Approved resources publish automatically and award points.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        {/* Pending */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock className="w-4 h-4" style={{ color: '#fbbf24' }} /> Pending
          </h2>
          <span className="dk-badge dk-badge-amber">{pending.length}</span>
        </div>

        {pending.length === 0 ? (
          <div className="dk-empty dk-card" style={{ marginBottom: 40, padding: '36px' }}>
            <Inbox className="w-8 h-8" />
            <p>Nothing to review — queue is clear.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginBottom: 40 }}>
            {pending.map(sub => (
              <div key={sub.id} className="dk-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 3 }}>{sub.title}</div>
                    <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {subjectName(sub.subject_id)} · {sub.type}
                    </div>
                  </div>
                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: '#60a5fa', textDecoration: 'none', flexShrink: 0 }}>
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {sub.description && <p style={{ fontSize: 12.5, color: 'var(--ah-muted)', marginBottom: 14, lineHeight: 1.5 }}>{sub.description}</p>}

                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: '0 0 auto' }}>
                    <label style={fieldLabel}>Vol. hours</label>
                    <input type="number" min="0" step="0.5" value={hours[sub.id] || ''}
                      onChange={e => setHours(p => ({ ...p, [sub.id]: e.target.value }))}
                      placeholder="0" className="dk-input" style={{ width: 80, padding: '8px 10px', fontSize: 13 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={fieldLabel}>Note (optional)</label>
                    <input type="text" value={notes[sub.id] || ''}
                      onChange={e => setNotes(p => ({ ...p, [sub.id]: e.target.value }))}
                      placeholder="Note to contributor…"
                      className="dk-input" style={{ padding: '8px 10px', fontSize: 13 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => decide(sub, 'approved')} disabled={busy === sub.id}
                    className="dk-btn dk-btn-primary" style={{ flex: 1, fontSize: 12 }}>
                    {busy === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={() => decide(sub, 'rejected')} disabled={busy === sub.id}
                    className="dk-btn dk-btn-danger" style={{ flex: 1, fontSize: 12 }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently reviewed */}
        {reviewed.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 14 }}>Recently reviewed</h2>
            <div className="dk-card" style={{ overflow: 'hidden' }}>
              <table className="dk-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewed.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.title}</td>
                      <td style={{ color: 'var(--ah-muted)', fontSize: 12 }}>{subjectName(sub.subject_id)}</td>
                      <td>
                        <span className={`dk-badge ${sub.status === 'approved' ? 'dk-badge-green' : 'dk-badge-red'}`}>
                          {sub.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--ah-mono)', fontSize: 12 }}>{sub.volunteer_hours ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
