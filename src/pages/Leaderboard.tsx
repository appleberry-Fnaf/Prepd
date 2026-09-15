import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Contribution } from '../lib/supabase';
import {
  Trophy, Medal, Crown, Star, ArrowUp, Award, Zap,
  BookOpen, PenTool, Upload, CheckCircle, Loader,
} from 'lucide-react';

interface LeaderboardProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  volunteer_hours: number;
}

const rankStyles = [
  { bg: 'bg-parchment border-taupe-300/50', icon: Crown, color: 'text-wood', medal: 'bg-wood' },
  { bg: 'bg-cream-200/50 border-taupe-300/50', icon: Medal, color: 'text-taupe-600', medal: 'bg-taupe-600' },
  { bg: 'bg-cream-200/30 border-taupe-300/50', icon: Award, color: 'text-wood', medal: 'bg-taupe-400' },
];

const badgeColors: Record<string, string> = {
  'submission': 'bg-parchment text-ink',
  'resource_approved': 'bg-green-50 text-green-700',
  'upvote': 'bg-amber-50 text-amber-700',
  'question_answered': 'bg-wood/20 text-wood',
  'question_correct': 'bg-teal-50 text-teal-700',
};

const badgeIcons: Record<string, React.ElementType> = {
  'submission': Upload,
  'resource_approved': BookOpen,
  'upvote': Star,
  'question_answered': PenTool,
  'question_correct': CheckCircle,
};

export default function Leaderboard() {
  const [topProfiles, setTopProfiles] = useState<LeaderboardProfile[]>([]);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'points' | 'hours'>('points');

  useEffect(() => {
    async function loadData() {
      const orderCol = sortBy === 'hours' ? 'volunteer_hours' : 'total_points';
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, total_points, volunteer_hours')
        .order(orderCol, { ascending: false })
        .limit(20);
      setTopProfiles(profilesData || []);
      const { data: contributionsData } = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentContributions(contributionsData || []);
      setLoading(false);
    }
    loadData();
  }, [sortBy]);

  const val = (p: LeaderboardProfile) => (sortBy === 'hours' ? (p.volunteer_hours || 0) : (p.total_points || 0));
  const unit = sortBy === 'hours' ? 'hrs' : 'pts';
  const unitLong = sortBy === 'hours' ? 'hours' : 'points';

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRankStyle = (index: number) => {
    if (index < 3) return rankStyles[index];
    return { bg: 'bg-white border-taupe-300/50', icon: ArrowUp, color: 'text-taupe-400', medal: 'bg-taupe-300' };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="accent-strip mb-4" />
        <h1 className="text-4xl font-bold text-ink mb-3">Leaderboard</h1>
        <p className="text-lg text-taupe-600 max-w-2xl">
          Top contributors who help the AP community thrive. Earn points by submitting resources, answering questions, and more.
        </p>
      </div>

      {topProfiles.length > 0 && (
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6">
            {topProfiles[1] && (
              <div className="order-2 sm:order-1 flex flex-col items-center">
                {topProfiles[1].avatar_url ? (
                  <img src={topProfiles[1].avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-taupe-300/50 flex items-center justify-center text-xl font-bold text-ink mb-3">
                    {getInitials(topProfiles[1].display_name)}
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-taupe-600 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-parchment">2</span>
                </div>
                <p className="font-semibold text-ink text-sm text-center max-w-[120px] truncate">{topProfiles[1].display_name || 'Student'}</p>
                <p className="text-sm text-taupe-500">{val(topProfiles[1])} {unit}</p>
              </div>
            )}
            <div className="order-1 sm:order-2 flex flex-col items-center -mt-4">
              {topProfiles[0].avatar_url ? (
                <img src={topProfiles[0].avatar_url} alt="" className="w-24 h-24 rounded-full object-cover mb-3 ring-4 ring-wood/20" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-wood/20 flex items-center justify-center text-xl font-bold text-ink mb-3 ring-4 ring-wood/20">
                  {getInitials(topProfiles[0].display_name)}
                </div>
              )}
              <div className="w-14 h-14 rounded-full bg-wood flex items-center justify-center mb-2 shadow-lg shadow-wood/30">
                <Crown className="w-7 h-7 text-parchment" />
              </div>
              <p className="font-semibold text-ink text-sm text-center max-w-[120px] truncate">{topProfiles[0].display_name || 'Student'}</p>
              <p className="text-sm text-wood font-semibold">{val(topProfiles[0])} {unit}</p>
            </div>
            {topProfiles[2] && (
              <div className="order-3 flex flex-col items-center">
                {topProfiles[2].avatar_url ? (
                  <img src={topProfiles[2].avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-taupe-300/30 flex items-center justify-center text-xl font-bold text-ink mb-3">
                    {getInitials(topProfiles[2].display_name)}
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-taupe-400 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-parchment">3</span>
                </div>
                <p className="font-semibold text-ink text-sm text-center max-w-[120px] truncate">{topProfiles[2].display_name || 'Student'}</p>
                <p className="text-sm text-taupe-500">{val(topProfiles[2])} {unit}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-warm overflow-hidden">
            <div className="px-6 py-4 border-b border-taupe-300/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <Trophy className="w-5 h-5 text-wood" />Top Contributors
              </h2>
              <div className="flex items-center gap-1 bg-parchment rounded-lg p-0.5 border border-taupe-300/30">
                <button onClick={() => setSortBy('points')} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${sortBy === 'points' ? 'bg-ink text-parchment' : 'text-taupe-600 hover:text-ink'}`}>Points</button>
                <button onClick={() => setSortBy('hours')} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${sortBy === 'hours' ? 'bg-ink text-parchment' : 'text-taupe-600 hover:text-ink'}`}>Volunteer hrs</button>
              </div>
            </div>
            <div className="divide-y divide-taupe-300/20">
              {topProfiles.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Trophy className="w-10 h-10 text-taupe-300 mx-auto mb-3" />
                  <p className="text-sm text-taupe-500">No contributors yet. Be the first to earn points!</p>
                  <Link to="/contribute" className="text-ink hover:underline text-sm font-medium mt-2 inline-block">Start contributing</Link>
                </div>
              ) : (
                topProfiles.map((profile, index) => {
                  const style = getRankStyle(index);
                  const Icon = style.icon;
                  return (
                    <div key={profile.id} className={`flex items-center gap-4 px-6 py-4 ${index < 3 ? style.bg : ''}`}>
                      <div className={`w-8 h-8 rounded-full ${style.medal} flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-bold ${index < 3 ? 'text-parchment' : 'text-ink'}`}>{index + 1}</span>
                      </div>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-taupe-300/50 flex items-center justify-center text-sm font-bold text-ink shrink-0">
                          {getInitials(profile.display_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink text-sm truncate">{profile.display_name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2 text-xs text-taupe-500">
                          <Icon className={`w-3 h-3 ${style.color}`} />
                          <span>{index === 0 ? 'Top Contributor' : index === 1 ? 'Rising Star' : index === 2 ? 'Active Scholar' : 'Contributor'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-ink">{val(profile)}</div>
                        <div className="text-xs text-taupe-500">{unitLong}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-warm p-6">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-ink" />How to Earn Points
            </h2>
            <div className="space-y-3">
              {[
                { icon: Upload, label: 'Submit a resource', points: 10, color: 'text-ink' },
                { icon: BookOpen, label: 'Resource approved', points: 25, color: 'text-green-700' },
                { icon: Star, label: 'Get an upvote', points: 5, color: 'text-wood' },
                { icon: PenTool, label: 'Answer a question', points: 2, color: 'text-ink' },
                { icon: CheckCircle, label: 'Correct answer', points: 5, color: 'text-green-700' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-parchment/60 border border-taupe-300/20">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm text-ink">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>

          {recentContributions.length > 0 && (
            <div className="card-warm p-6">
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Loader className="w-5 h-5 text-ink" />Recent Activity
              </h2>
              <div className="space-y-3">
                {recentContributions.map((c) => {
                  const badgeColor = badgeColors[c.action_type] || 'bg-parchment text-ink';
                  const BadgeIcon = badgeIcons[c.action_type] || Star;
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-parchment/60 border border-taupe-300/20">
                      <div className={`w-8 h-8 rounded-lg ${badgeColor} flex items-center justify-center shrink-0`}>
                        <BadgeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink capitalize">{c.action_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-taupe-500">{new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-700">+{c.points}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
