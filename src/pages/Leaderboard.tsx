import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Contribution } from '../lib/supabase';
import { Trophy, Crown, Star, Upload, BookOpen, PenTool, CheckCircle, Zap } from 'lucide-react';

interface LeaderboardProfile {
  id: string; display_name: string; avatar_url: string | null;
  total_points: number; volunteer_hours: number;
}

const MEDAL = ['#f5b040', '#a0a8b8', '#b06030'];
const RANK_LABEL = ['Top Contributor', 'Rising Star', 'Active Scholar', 'Contributor'];

const POINT_ITEMS = [
  { icon: Upload,       label: 'Submit a resource',  points: 10, color: '#60a5fa' },
  { icon: BookOpen,     label: 'Resource approved',  points: 25, color: '#4ade80' },
  { icon: Star,         label: 'Get an upvote',      points: 5,  color: '#fbbf24' },
  { icon: PenTool,      label: 'Answer a question',  points: 2,  color: '#a78bfa' },
  { icon: CheckCircle,  label: 'Correct answer',     points: 5,  color: '#4ade80' },
];

export default function Leaderboard() {
  const [topProfiles, setTopProfiles] = useState<LeaderboardProfile[]>([]);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'points' | 'hours'>('points');

  useEffect(() => {
    async function loadData() {
      const orderCol = sortBy === 'hours' ? 'volunteer_hours' : 'total_points';
      const { data: profilesData } = await supabase.from('profiles')
        .select('id, display_name, avatar_url, total_points, volunteer_hours')
        .order(orderCol, { ascending: false }).limit(20);
      setTopProfiles(profilesData || []);
      const { data: cData } = await supabase.from('contributions').select('*').order('created_at', { ascending: false }).limit(10);
      setRecentContributions(cData || []);
      setLoading(false);
    }
    loadData();
  }, [sortBy]);

  const val = (p: LeaderboardProfile) => sortBy === 'hours' ? (p.volunteer_hours || 0) : (p.total_points || 0);
  const unit = sortBy === 'hours' ? 'hrs' : 'pts';
  const getInitials = (name: string | null) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  if (loading) return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">Leaderboard</span>
        <h1 className="dk-heading-xl">Rise through<br />the ranks.</h1>
        <p className="dk-sub" style={{ maxWidth: 460 }}>
          Every contribution earns points. See where you stand.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>

        {/* Top 3 podium */}
        {topProfiles.length >= 2 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
            {[1, 0, 2].map(idx => {
              const p = topProfiles[idx];
              if (!p) return null;
              const isFirst = idx === 0;
              const size = isFirst ? 72 : 56;
              const medalColor = MEDAL[idx];
              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, order: idx === 1 ? 0 : idx === 0 ? 1 : 2 }}>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${medalColor}44` }} />
                  ) : (
                    <div style={{ width: size, height: size, borderRadius: '50%', background: `${medalColor}18`, border: `1px solid ${medalColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ah-sans)', fontSize: isFirst ? 20 : 16, fontWeight: 700, color: medalColor }}>
                      {getInitials(p.display_name)}
                    </div>
                  )}
                  <div style={{ width: isFirst ? 44 : 36, height: isFirst ? 44 : 36, borderRadius: '50%', background: `${medalColor}22`, border: `1px solid ${medalColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isFirst ? <Crown className="w-5 h-5" style={{ color: medalColor }} /> : <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 13, fontWeight: 700, color: medalColor }}>{idx + 1}</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--ah-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ah-text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.display_name || 'Student'}</span>
                  <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: medalColor }}>{val(p)} {unit}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          {/* Rankings table */}
          <div className="dk-card" style={{ overflow: 'hidden', gridColumn: 'span 2', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy className="w-4 h-4" style={{ color: '#f5b040' }} /> Top Contributors
              </h2>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
                {(['points', 'hours'] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`dk-tab ${sortBy === s ? 'dk-tab-active' : 'dk-tab-inactive'}`}
                    style={{ padding: '5px 12px', fontSize: 11 }}>
                    {s === 'points' ? 'Points' : 'Vol. hrs'}
                  </button>
                ))}
              </div>
            </div>

            {topProfiles.length === 0 ? (
              <div className="dk-empty"><Trophy className="w-8 h-8" /><p>No contributors yet. <Link to="/contribute" style={{ color: '#60a5fa' }}>Start contributing</Link></p></div>
            ) : (
              <table className="dk-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Contributor</th>
                    <th style={{ textAlign: 'right' }}>{sortBy === 'hours' ? 'Hours' : 'Points'}</th>
                  </tr>
                </thead>
                <tbody>
                  {topProfiles.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 12, color: i < 3 ? MEDAL[i] : 'var(--ah-muted)', fontWeight: 700 }}>{i + 1}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ah-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ah-muted)', flexShrink: 0 }}>
                              {getInitials(p.display_name)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 13.5, fontWeight: 600 }}>{p.display_name || 'Anonymous'}</div>
                            <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{RANK_LABEL[Math.min(i, 3)]}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 800, color: i < 3 ? MEDAL[i] : 'var(--ah-text)', letterSpacing: '-0.02em' }}>{val(p)}</span>
                        <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', marginLeft: 4 }}>{unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Points guide */}
            <div className="dk-card" style={{ padding: '22px' }}>
              <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap className="w-4 h-4" style={{ color: '#fbbf24' }} /> How to earn
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {POINT_ITEMS.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                    <span style={{ fontSize: 12.5, color: 'var(--ah-muted)', flex: 1 }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, fontWeight: 700, color: item.color }}>+{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            {recentContributions.length > 0 && (
              <div className="dk-card" style={{ padding: '22px' }}>
                <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 16 }}>Recent activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentContributions.slice(0, 6).map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, color: 'var(--ah-muted)', textTransform: 'capitalize' }}>{c.action_type.replace(/_/g, ' ')}</div>
                        <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: '#4ade80', fontWeight: 700 }}>+{c.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
