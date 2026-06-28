import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { APSubject, Submission } from '../lib/supabase';
import {
  Upload, FileText, BookOpen, PenTool, ChevronRight, ArrowLeft,
  CheckCircle, Clock, AlertCircle, XCircle, Send, Star, Inbox, Loader2,
} from 'lucide-react';

const typeOptions = [
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'guide', label: 'Study Guide', icon: BookOpen },
  { value: 'test', label: 'Practice Test', icon: PenTool },
];

const statusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded"><CheckCircle className="w-3 h-3" />Approved</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded"><XCircle className="w-3 h-3" />Rejected</span>;
    default:
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded"><Clock className="w-3 h-3" />Pending</span>;
  }
};

export default function Contribute() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subjectId: '', type: 'notes', title: '', description: '', fileUrl: '', externalUrl: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: subjectsData } = await supabase.from('ap_subjects').select('*').order('name');
      setSubjects(subjectsData || []);
      if (user) {
        const { data: subData } = await supabase.from('submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setMySubmissions(subData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError('Please sign in to submit resources.'); return; }
    if (!form.subjectId || !form.title) { setError('Please fill in all required fields.'); return; }
    setSubmitting(true); setError('');
    const { error: submitError } = await supabase.from('submissions').insert({
      user_id: user.id, subject_id: form.subjectId, title: form.title, description: form.description,
      type: form.type, file_url: form.fileUrl || null, status: 'pending',
    });
    if (submitError) { setError(submitError.message); }
    else {
      setSuccess(true);
      setForm({ subjectId: '', type: 'notes', title: '', description: '', fileUrl: '', externalUrl: '' });
      const { data: subData } = await supabase.from('submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setMySubmissions(subData || []);
      setTimeout(() => setSuccess(false), 4000);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-6 border border-taupe-300/50">
            <Upload className="w-8 h-8 text-ink" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3">Contribute</h1>
          <p className="text-taupe-600 mb-8 max-w-md mx-auto">Share your notes, study guides, and practice tests with the AP community. Sign in to get started.</p>
          <Link to="/auth" className="btn-warm inline-flex items-center gap-2">
            Sign In to Contribute <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="accent-strip mb-4" />
        <h1 className="text-4xl font-bold text-ink mb-3">Contribute</h1>
        <p className="text-lg text-taupe-600 max-w-2xl">Share your notes, study guides, and practice tests. Your submissions will be reviewed by moderators before being published.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="card-warm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-ink" />Submit a Resource
            </h2>
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">Submission received! It will be reviewed by a moderator soon.</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">AP Subject <span className="text-red-500">*</span></label>
                <select value={form.subjectId} onChange={(e) => setForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-taupe-300/50 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400">
                  <option value="">Select a subject...</option>
                  {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Resource Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {typeOptions.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button key={t.value} type="button" onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                        className={`p-3 rounded-xl border text-center transition-all ${form.type === t.value ? 'border-ink bg-ink/5' : 'border-taupe-300/50 hover:bg-parchment/60'}`}>
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${form.type === t.value ? 'text-ink' : 'text-taupe-400'}`} />
                        <div className={`text-xs font-medium ${form.type === t.value ? 'text-ink' : 'text-taupe-600'}`}>{t.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Unit 3 Comprehensive Notes"
                  className="w-full px-4 py-3 rounded-xl border border-taupe-300/50 bg-white text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what this resource covers..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-taupe-300/50 bg-white text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Link (optional)</label>
                <input type="url" value={form.fileUrl} onChange={(e) => setForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-taupe-300/50 bg-white text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                <p className="text-xs text-taupe-500 mt-1">Link to your Google Drive, Dropbox, or any file sharing service.</p>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ink text-parchment font-semibold text-sm hover:bg-ink/90 transition-all disabled:opacity-50 shadow-md shadow-ink/15">
                {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>) : (<><Upload className="w-4 h-4" />Submit Resource</>)}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card-warm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-ink" />My Submissions
            </h2>
            {mySubmissions.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
                <p className="text-sm text-taupe-500">No submissions yet. Share your first resource!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-taupe-300/30 bg-parchment/60">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-ink text-sm">{sub.title}</h3>
                        <p className="text-xs text-taupe-500 mt-0.5">{sub.description}</p>
                      </div>
                      {statusBadge(sub.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-taupe-400">
                      <span className="capitalize">{sub.type}</span>
                      <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>
                    {sub.moderator_notes && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        <span className="font-semibold">Moderator note: </span>{sub.moderator_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 card-warm p-6 border-taupe-300/50 bg-parchment/60">
            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-wood" />Why Contribute?
            </h3>
            <ul className="space-y-2 text-sm text-taupe-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />Help fellow students succeed on their exams</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />Earn points and climb the leaderboard</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />Reinforce your own understanding by teaching</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />Build your academic portfolio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
