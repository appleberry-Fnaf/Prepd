import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { APSubject, Submission } from '../lib/supabase';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, ExternalLink, Loader2, Inbox,
} from 'lucide-react';

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
    const { data: subData } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(subData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (isModerator) loadData();
    else if (!authLoading) setLoading(false);
  }, [isModerator, authLoading]);

  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown subject';

  async function decide(sub: Submission, status: 'approved' | 'rejected') {
    setBusy(sub.id);
    const vh = status === 'approved' ? parseFloat(hours[sub.id] || '0') || 0 : 0;
    await supabase.from('submissions').update({
      status,
      volunteer_hours: vh,
      moderator_notes: notes[sub.id] || null,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', sub.id);
    await loadData();
    setBusy(null);
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !isModerator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-6 border border-taupe-300/50">
            <ShieldCheck className="w-8 h-8 text-ink" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3">Moderators only</h1>
          <p className="text-taupe-600 mb-8 max-w-md mx-auto">This page is for moderators. If you should have access, ask an admin to enable it on your account.</p>
          <Link to="/" className="btn-warm inline-flex items-center gap-2">Back to home</Link>
        </div>
      </div>
    );
  }

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending').slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="accent-strip mb-4" />
        <h1 className="text-4xl font-bold text-ink mb-3 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-ink" /> Moderate
        </h1>
        <p className="text-lg text-taupe-600 max-w-2xl">Review submissions, set volunteer hours, and approve or reject. Approved resources publish automatically and award points.</p>
      </div>

      <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" /> Pending
        <span className="ml-1 text-xs text-taupe-500 bg-parchment px-2 py-0.5 rounded-full border border-taupe-300/30">{pending.length}</span>
      </h2>

      {pending.length === 0 ? (
        <div className="card-warm p-10 text-center mb-10">
          <Inbox className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
          <p className="text-sm text-taupe-500">Nothing waiting for review. Nice work! 🎉</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {pending.map((sub) => (
            <div key={sub.id} className="card-warm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{sub.title}</h3>
                  <p className="text-xs text-taupe-500">{subjectName(sub.subject_id)} · <span className="capitalize">{sub.type}</span></p>
                </div>
                {sub.file_url && (
                  <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:text-ink/70 shrink-0">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {sub.description && <p className="text-sm text-taupe-600 mb-4">{sub.description}</p>}

              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-medium text-taupe-600">Volunteer hours</label>
                <input
                  type="number" min="0" step="0.5" value={hours[sub.id] || ''}
                  onChange={(e) => setHours(prev => ({ ...prev, [sub.id]: e.target.value }))}
                  placeholder="0"
                  className="w-20 px-2 py-1 rounded-lg border border-taupe-300/50 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <input
                type="text" value={notes[sub.id] || ''}
                onChange={(e) => setNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                placeholder="Note to the contributor (optional)"
                className="w-full mb-3 px-3 py-2 rounded-lg border border-taupe-300/50 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
              />

              <div className="flex gap-2">
                <button onClick={() => decide(sub, 'approved')} disabled={busy === sub.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-ink text-parchment text-sm font-semibold hover:bg-ink/90 transition-all disabled:opacity-50">
                  {busy === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                </button>
                <button onClick={() => decide(sub, 'rejected')} disabled={busy === sub.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-parchment text-ink text-sm font-semibold border border-taupe-300/50 hover:bg-cream-200 transition-all disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-ink mb-4">Recently reviewed</h2>
          <div className="card-warm divide-y divide-taupe-300/20">
            {reviewed.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'approved' ? 'bg-green-600' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{sub.title}</p>
                  <p className="text-xs text-taupe-500">{subjectName(sub.subject_id)}</p>
                </div>
                <span className="text-xs text-taupe-500 capitalize flex items-center gap-1">
                  {sub.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                  {sub.status}{sub.status === 'approved' && sub.volunteer_hours ? ` · ${sub.volunteer_hours}h` : ''}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
