import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { APSubject, Submission } from '../lib/supabase';
import {
  Upload, FileText, BookOpen, PenTool,
  CheckCircle, Clock, XCircle, Send, Star, Inbox, Loader2, Paperclip, X as XIcon,
} from 'lucide-react';

const typeOptions = [
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'guide', label: 'Study Guide', icon: BookOpen },
  { value: 'test', label: 'Practice Test', icon: PenTool },
];

const statusBadge = (status: string) => {
  if (status === 'approved') return <span className="dk-badge dk-badge-green"><CheckCircle className="w-3 h-3" />Approved</span>;
  if (status === 'rejected') return <span className="dk-badge dk-badge-red"><XCircle className="w-3 h-3" />Rejected</span>;
  return <span className="dk-badge dk-badge-amber"><Clock className="w-3 h-3" />Pending</span>;
};

export default function Contribute() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subjectId: '', type: 'notes', title: '', description: '', fileUrl: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileError, setFileError] = useState('');

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFileError('');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setFileError('Only PDF files are supported.'); return; }
    if (file.size > 10 * 1024 * 1024) { setFileError('File must be under 10 MB.'); return; }
    setUploadingFile(true);
    const path = `${user.id}/${crypto.randomUUID()}.pdf`;
    const { error: upErr } = await supabase.storage.from('pdf-contributions').upload(path, file, { cacheControl: '3600' });
    if (upErr) {
      setFileError('Upload failed — check "pdf-contributions" bucket in Supabase.');
    } else {
      const { data } = supabase.storage.from('pdf-contributions').getPublicUrl(path);
      setForm(prev => ({ ...prev, fileUrl: data.publicUrl }));
      setUploadedFileName(file.name);
    }
    setUploadingFile(false);
  }

  function clearUploadedFile() { setUploadedFileName(''); setForm(prev => ({ ...prev, fileUrl: '' })); setFileError(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError('Please sign in to submit resources.'); return; }
    if (!form.subjectId || !form.title) { setError('Fill in all required fields.'); return; }
    setSubmitting(true); setError('');
    const { error: submitError } = await supabase.from('submissions').insert({
      user_id: user.id, subject_id: form.subjectId, title: form.title,
      description: form.description, type: form.type, file_url: form.fileUrl || null, status: 'pending',
    });
    if (submitError) { setError(submitError.message); }
    else {
      setSuccess(true);
      setForm({ subjectId: '', type: 'notes', title: '', description: '', fileUrl: '' });
      setUploadedFileName(''); setFileError('');
      const { data } = await supabase.from('submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setMySubmissions(data || []);
      setTimeout(() => setSuccess(false), 4000);
    }
    setSubmitting(false);
  }

  if (loading) return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;

  if (!user) {
    return (
      <div className="dk-empty" style={{ minHeight: '70vh' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Upload className="w-7 h-7" style={{ color: '#fbbf24' }} />
        </div>
        <h2 className="dk-heading-lg" style={{ marginBottom: 8 }}>Contribute</h2>
        <p style={{ color: 'var(--ah-muted)', marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
          Share notes, study guides, and practice tests. Sign in to get started.
        </p>
        <Link to="/auth" className="dk-btn dk-btn-primary">Sign in to contribute</Link>
      </div>
    );
  }

  const labelStyle = { fontSize: 12, fontFamily: 'var(--ah-mono)', letterSpacing: '0.04em', color: 'var(--ah-muted)', textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' };

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">Contribute</span>
        <h1 className="dk-heading-xl">Share your work.<br />Earn real credit.</h1>
        <p className="dk-sub" style={{ maxWidth: 460 }}>
          Upload notes and study guides — approved submissions earn points and volunteer hours.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
          {/* Submit form */}
          <div className="dk-card" style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 16, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Send className="w-4 h-4" style={{ color: '#fbbf24' }} /> Submit a Resource
            </h2>

            {success && <div className="dk-alert dk-alert-green" style={{ marginBottom: 18 }}><CheckCircle className="w-4 h-4 shrink-0" /> Submitted! A moderator will review it soon.</div>}
            {error  && <div className="dk-alert dk-alert-red"   style={{ marginBottom: 18 }}><span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span> {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>AP Subject *</label>
                <select value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))} className="dk-input">
                  <option value="">Select a subject…</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Resource Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {typeOptions.map(t => {
                    const Icon = t.icon;
                    const active = form.type === t.value;
                    return (
                      <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                        style={{ padding: '12px 8px', borderRadius: 8, border: `1px solid ${active ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(251,191,36,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                        <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: active ? '#fbbf24' : 'var(--ah-muted)' }} />
                        <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: active ? '#fbbf24' : 'var(--ah-muted)' }}>{t.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Unit 3 Comprehensive Notes" className="dk-input" required />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Briefly describe what this covers…" rows={3} className="dk-input" />
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Paperclip className="w-3 h-3" /> Upload PDF (optional)
                </label>
                {uploadedFileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.07)' }}>
                    <FileText className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />
                    <span style={{ fontSize: 13, color: 'var(--ah-text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFileName}</span>
                    <button type="button" onClick={clearUploadedFile} style={{ background: 'none', border: 'none', color: 'var(--ah-muted)', cursor: 'pointer', padding: 0 }}>
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 16px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                    {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--ah-muted)' }} /> : <Upload className="w-5 h-5" style={{ color: 'var(--ah-muted)' }} />}
                    <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: 'var(--ah-muted)' }}>{uploadingFile ? 'Uploading…' : 'Click to upload PDF'}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>PDF only · max 10 MB</span>
                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                  </label>
                )}
                {fileError && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 6 }}>{fileError}</p>}
              </div>

              <div>
                <label style={labelStyle}>Or paste a link (optional)</label>
                <input type="url" value={uploadedFileName ? '' : form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))}
                  placeholder="https://drive.google.com/…" disabled={!!uploadedFileName}
                  className="dk-input" style={{ opacity: uploadedFileName ? 0.4 : 1 }} />
              </div>

              <button type="submit" disabled={submitting} className="dk-btn dk-btn-primary" style={{ width: '100%' }}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Upload className="w-4 h-4" /> Submit Resource</>}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* My submissions */}
            <div className="dk-card" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Inbox className="w-4 h-4" style={{ color: 'var(--ah-muted)' }} /> My Submissions
              </h2>
              {mySubmissions.length === 0 ? (
                <div className="dk-empty" style={{ padding: '28px 0' }}>
                  <Inbox className="w-8 h-8" /><p>No submissions yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mySubmissions.map(sub => (
                    <div key={sub.id} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--ah-text)', marginBottom: 2 }}>{sub.title}</div>
                          {sub.description && <div style={{ fontSize: 11.5, color: 'var(--ah-muted)' }}>{sub.description}</div>}
                        </div>
                        {statusBadge(sub.status)}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>{sub.type}</span>
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                      {sub.moderator_notes && (
                        <div className="dk-alert dk-alert-amber" style={{ marginTop: 8, fontSize: 12 }}>
                          <span style={{ flexShrink: 0 }}>Mod:</span> {sub.moderator_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Why contribute */}
            <div className="dk-card" style={{ padding: '22px 24px' }}>
              <h3 style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star className="w-4 h-4" style={{ color: '#fbbf24' }} /> Why contribute?
              </h3>
              {[
                'Help fellow students succeed on their exams',
                'Earn points and climb the leaderboard',
                'Earn verified volunteer hours for college apps',
                'Build your academic portfolio',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#4ade80', marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: 'var(--ah-muted)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
