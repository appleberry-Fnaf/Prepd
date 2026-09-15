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
            <User className="w-8 h-8 text-ink" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3">Your Profile</h1>
          <p className="text-taupe-600 mb-8 max-w-md mx-auto">Sign in to track your progress, view your submissions, and manage your profile.</p>
          <Link to="/auth" className="btn-warm inline-flex items-center gap-2">
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card-warm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-taupe-300/50" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-parchment border-2 border-taupe-300/50 flex items-center justify-center text-2xl font-bold text-ink">
                {getInitials(profile?.display_name || 'Student')}
              </div>
            )}
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ink text-parchment flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:bg-ink/90 transition-all" title="Change photo">
                {uploadingAvatar ? <Loader className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {!editing ? (
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold text-ink">{profile?.display_name || 'Student'}</h1>
                  <TierBadge points={points} />
                  <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-taupe-400 hover:bg-parchment hover:text-ink transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-taupe-500 text-sm mb-2">{user.email}</p>
                {profile?.bio && <p className="text-taupe-600 text-sm mb-2">{profile.bio}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-taupe-500">
                  {profile?.school_name && <span className="bg-parchment px-2 py-1 rounded border border-taupe-300/30">{profile.school_name}</span>}
                  {profile?.grade_level && <span className="bg-parchment px-2 py-1 rounded border border-taupe-300/30">{profile.grade_level}</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-lg">
                <p className="text-xs text-taupe-500">Tap the camera icon on your photo to upload a picture.</p>
                {avatarError && <p className="text-xs text-red-600">{avatarError}</p>}
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Display Name</label>
                  <input type="text" value={editForm.display_name} onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-taupe-300/50 text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Bio</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-taupe-300/50 text-ink focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">School</label>
                    <input type="text" value={editForm.school_name} onChange={(e) => setEditForm(prev => ({ ...prev, school_name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-taupe-300/50 text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Grade</label>
                    <input type="text" value={editForm.grade_level} onChange={(e) => setEditForm(prev => ({ ...prev, grade_level: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-taupe-300/50 text-ink focus:outline-none focus:ring-2 focus:ring-ink/20" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={saveProfile} disabled={saving}
                    className="px-4 py-2 rounded-xl bg-ink text-parchment text-sm font-medium hover:bg-ink/90 transition-all disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-xl bg-parchment text-ink text-sm font-medium border border-taupe-300/50 hover:bg-cream-200 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-parchment px-4 py-2 rounded-xl border border-taupe-300/50">
              <Zap className="w-5 h-5 text-wood" />
              <div>
                <div className="text-lg font-bold text-ink">{points}</div>
                <div className="text-xs text-taupe-500">points</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-parchment px-4 py-2 rounded-xl border border-taupe-300/50">
              <HeartHandshake className="w-5 h-5 text-ink" />
              <div>
                <div className="text-lg font-bold text-ink">{volunteerHours}</div>
                <div className="text-xs text-taupe-500">volunteer hrs</div>
              </div>
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-taupe-500 mb-1.5">
              <span>Progress to {nextTier.name}</span>
              <span>{points} / {nextTier.min} pts</span>
            </div>
            <div className="w-full h-2 bg-taupe-300/30 rounded-full overflow-hidden">
              <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${tierPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-warm p-5">
          <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center mb-3 border border-taupe-300/30">
            <PenTool className="w-5 h-5 text-ink" />
          </div>
          <div className="text-2xl font-bold text-ink">{totalQuestions}</div>
          <div className="text-sm text-taupe-500">Questions Answered</div>
        </div>
        <div className="card-warm p-5">
          <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center mb-3 border border-taupe-300/30">
            <CheckCircle className="w-5 h-5 text-green-700" />
          </div>
          <div className="text-2xl font-bold text-ink">{accuracy}%</div>
          <div className="text-sm text-taupe-500">Accuracy</div>
        </div>
        <div className="card-warm p-5">
          <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center mb-3 border border-taupe-300/30">
            <Upload className="w-5 h-5 text-ink" />
          </div>
          <div className="text-2xl font-bold text-ink">{approvedCount}</div>
          <div className="text-sm text-taupe-500">Resources Approved</div>
        </div>
        <div className="card-warm p-5">
          <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center mb-3 border border-taupe-300/30">
            <Clock className="w-5 h-5 text-wood" />
          </div>
          <div className="text-2xl font-bold text-ink">{totalStudyTime}</div>
          <div className="text-sm text-taupe-500">Study Minutes</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-warm p-6">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ink" />Study Progress
          </h2>
          {progress.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
              <p className="text-sm text-taupe-500">No progress yet. Start practicing to see your stats!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-parchment/60 border border-taupe-300/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-ink">{getSubjectName(p.subject_id)}</span>
                    <span className="text-xs text-taupe-500">{p.questions_correct}/{p.questions_answered} correct</span>
                  </div>
                  <div className="w-full h-2 bg-taupe-300/30 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-ink rounded-full" style={{ width: `${p.questions_answered > 0 ? (p.questions_correct / p.questions_answered) * 100 : 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-taupe-500">
                    <span>{p.resources_viewed} resources viewed</span>
                    <span>{p.study_time_minutes} min studied</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-warm p-6">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-ink" />My Submissions
            <span className="ml-auto text-xs text-taupe-500 bg-parchment px-2 py-0.5 rounded-full border border-taupe-300/30">{pendingCount} pending</span>
          </h2>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
              <p className="text-sm text-taupe-500 mb-3">No submissions yet.</p>
              <Link to="/contribute" className="text-ink hover:underline text-sm font-medium">Submit your first resource</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 6).map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-parchment/60 border border-taupe-300/30">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'approved' ? 'bg-green-600' : sub.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{sub.title}</p>
                    <p className="text-xs text-taupe-500 capitalize">{sub.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-taupe-500 shrink-0 capitalize">
                    {sub.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
