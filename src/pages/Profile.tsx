import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { APSubject, UserProgress, Submission } from '../lib/supabase';
import {
  User, Edit, BookOpen, PenTool, Upload, Camera, Loader,
  ChevronRight, Clock, CheckCircle, Zap, HeartHandshake,
} from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { getNextTier, tierProgress } from '../lib/rewards';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', school_name: '', grade_level: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: subjectsData } = await supabase.from('ap_subjects').select('*');
      setSubjects(subjectsData || []);
      if (user) {
        const { data: progData } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
        setProgress(progData || []);
        const { data: subData } = await supabase.from('submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setSubmissions(subData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({ display_name: profile.display_name || '', bio: profile.bio || '', school_name: profile.school_name || '', grade_level: profile.grade_level || '', avatar_url: profile.avatar_url || '' });
    }
  }, [profile]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: editForm.display_name, bio: editForm.bio, school_name: editForm.school_name, grade_level: editForm.grade_level,
      avatar_url: editForm.avatar_url || null,
      updated_at: new Date().toISOString(),
    });
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarError('');
    if (!file.type.startsWith('image/')) { setAvatarError('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError('Image must be under 5 MB.'); return; }
    setUploadingAvatar(true);
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (upErr) {
      setAvatarError('Upload failed — make sure the "avatars" storage bucket exists.');
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setEditForm(prev => ({ ...prev, avatar_url: `${data.publicUrl}?v=${Date.now()}` }));
    }
    setUploadingAvatar(false);
  }

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const totalQuestions = progress.reduce((acc, p) => acc + p.questions_answered, 0);
  const totalCorrect = progress.reduce((acc, p) => acc + p.questions_correct, 0);
  const totalStudyTime = progress.reduce((acc, p) => acc + p.study_time_minutes, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const points = profile?.total_points || 0;
  const volunteerHours = profile?.volunteer_hours || 0;
  const nextTier = getNextTier(points);
  const tierPct = tierProgress(points);
  const getInitials = (name: string | null) => { if (!name) return '??'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };
  const displayAvatar = editing ? editForm.avatar_url : (profile?.avatar_url || '');

  const fieldLabel: React.CSSProperties = { fontSize: 11, fontFamily: 'var(--ah-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ah-muted)', marginBottom: 6, display: 'block' };

  if (loading) return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;

  if (!user) {
    return (
      <div className="dk-empty" style={{ minHeight: '70vh' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <User className="w-7 h-7" style={{ color: 'var(--ah-muted)' }} />
        </div>
        <h2 className="dk-heading-lg" style={{ marginBottom: 8 }}>Your Profile</h2>
        <p style={{ color: 'var(--ah-muted)', marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
          Sign in to track your progress, view your submissions, and manage your profile.
        </p>
        <Link to="/auth" className="dk-btn dk-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Sign In <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">Profile</span>
        <h1 className="dk-heading-xl">{profile?.display_name || 'Student'}</h1>
        <p className="dk-sub">{user.email}</p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>

        {/* Profile card */}
        <div className="dk-card" style={{ padding: '28px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ah-sans)', fontSize: 22, fontWeight: 700, color: 'var(--ah-text)' }}>
                  {getInitials(profile?.display_name || 'Student')}
                </div>
              )}
              {editing && (
                <label style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: 'var(--ah-text)', color: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #0a0f1e' }} title="Change photo">
                  {uploadingAvatar ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                </label>
              )}
            </div>

            {/* Info / edit form */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!editing ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--ah-sans)', fontSize: 18, fontWeight: 700, color: 'var(--ah-text)' }}>{profile?.display_name || 'Student'}</span>
                    <TierBadge points={points} />
                    <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ah-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  {profile?.bio && <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: 6, lineHeight: 1.55 }}>{profile.bio}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile?.school_name && <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '3px 8px' }}>{profile.school_name}</span>}
                    {profile?.grade_level && <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '3px 8px' }}>{profile.grade_level}</span>}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--ah-muted)' }}>Tap the camera icon on your photo to upload a picture.</p>
                  {avatarError && <p style={{ fontSize: 11.5, color: '#f87171' }}>{avatarError}</p>}
                  <div>
                    <label style={fieldLabel}>Display Name</label>
                    <input type="text" value={editForm.display_name} onChange={e => setEditForm(p => ({ ...p, display_name: e.target.value }))} className="dk-input" />
                  </div>
                  <div>
                    <label style={fieldLabel}>Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={2} className="dk-input" style={{ resize: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={fieldLabel}>School</label>
                      <input type="text" value={editForm.school_name} onChange={e => setEditForm(p => ({ ...p, school_name: e.target.value }))} className="dk-input" />
                    </div>
                    <div>
                      <label style={fieldLabel}>Grade</label>
                      <input type="text" value={editForm.grade_level} onChange={e => setEditForm(p => ({ ...p, grade_level: e.target.value }))} className="dk-input" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveProfile} disabled={saving} className="dk-btn dk-btn-primary dk-btn-sm">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="dk-btn dk-btn-ghost dk-btn-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Points + hours */}
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <Zap className="w-4 h-4" style={{ color: '#f5c842', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 17, fontWeight: 800, color: '#f5c842', letterSpacing: '-0.02em' }}>{points}</div>
                  <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 9.5, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>points</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 14px' }}>
                <HeartHandshake className="w-4 h-4" style={{ color: 'var(--ah-muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 17, fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em' }}>{volunteerHours}</div>
                  <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 9.5, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>vol hrs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          {nextTier && (
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: 'var(--ah-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Progress to {nextTier.name}</span>
                <span>{points} / {nextTier.min} pts</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#f5c842', borderRadius: 4, width: `${tierPct}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { icon: PenTool, label: 'Questions Answered', value: totalQuestions, color: '#60a5fa' },
            { icon: CheckCircle, label: 'Accuracy', value: `${accuracy}%`, color: '#4ade80' },
            { icon: Upload, label: 'Resources Approved', value: approvedCount, color: '#60a5fa' },
            { icon: Clock, label: 'Study Minutes', value: totalStudyTime, color: '#f5c842' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="dk-card" style={{ padding: '18px 20px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 22, fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress + Submissions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {/* Study progress */}
          <div className="dk-card" style={{ padding: '22px' }}>
            <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen className="w-4 h-4" style={{ color: '#60a5fa' }} /> Study Progress
            </h2>
            {progress.length === 0 ? (
              <div className="dk-empty" style={{ padding: '28px 0' }}>
                <BookOpen className="w-8 h-8" />
                <p>No progress yet. Start practicing!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {progress.map(p => {
                  const acc = p.questions_answered > 0 ? (p.questions_correct / p.questions_answered) * 100 : 0;
                  return (
                    <div key={p.id} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--ah-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ah-text)' }}>{getSubjectName(p.subject_id)}</span>
                        <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: 'var(--ah-muted)' }}>{p.questions_correct}/{p.questions_answered}</span>
                      </div>
                      <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', background: '#4ade80', borderRadius: 3, width: `${acc}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>{p.resources_viewed} resources viewed</span>
                        <span>{p.study_time_minutes} min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My submissions */}
          <div className="dk-card" style={{ padding: '22px' }}>
            <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload className="w-4 h-4" style={{ color: '#f5c842' }} /> My Submissions
              {pendingCount > 0 && <span className="dk-badge dk-badge-amber" style={{ marginLeft: 'auto' }}>{pendingCount} pending</span>}
            </h2>
            {submissions.length === 0 ? (
              <div className="dk-empty" style={{ padding: '28px 0' }}>
                <Upload className="w-8 h-8" />
                <p style={{ marginBottom: 12 }}>No submissions yet.</p>
                <Link to="/contribute" style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: '#60a5fa', textDecoration: 'none' }}>Submit your first resource →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submissions.slice(0, 6).map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: sub.status === 'approved' ? '#4ade80' : sub.status === 'rejected' ? '#f87171' : '#f5c842' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ah-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.title}</div>
                      <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', textTransform: 'capitalize' }}>{sub.type}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: sub.status === 'approved' ? '#4ade80' : sub.status === 'rejected' ? '#f87171' : '#f5c842', textTransform: 'capitalize', flexShrink: 0 }}>{sub.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
