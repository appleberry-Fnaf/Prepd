import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Contribution } from '../lib/supabase';
import { Trophy, Crown, Star, Upload, BookOpen, PenTool, CheckCircle, Zap } from 'lucide-react';
import './leaderboard-y2k.css';

interface LeaderboardProfile {
  id: string; display_name: string; avatar_url: string | null;
  total_points: number; volunteer_hours: number;
}

const MEDAL = ['#b8860b', '#808080', '#a0522d'];
const MEDAL_LABEL = ['1st', '2nd', '3rd'];
const RANK_LABEL = ['Top Contributor', 'Rising Star', 'Active Scholar', 'Contributor'];

const POINT_ITEMS = [
  { icon: Upload,       label: 'Submit a resource',  points: 10 },
  { icon: BookOpen,     label: 'Resource approved',  points: 25 },
  { icon: Star,         label: 'Get an upvote',      points: 5  },
  { icon: PenTool,      label: 'Answer a question',  points: 2  },
  { icon: CheckCircle,  label: 'Correct answer',     points: 5  },
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
    <div className="y2k-desktop">

      {/* ── Main window: rankings ────────────────────────────────────────── */}
      <div className="y2k-window y2k-window--main">
        <div className="y2k-titlebar">
          <span className="y2k-title"><Trophy className="w-3.5 h-3.5" /> Prepd_Leaderboard.exe</span>
          <span className="y2k-caption-group">
            <span className="y2k-caption">_</span>
            <span className="y2k-caption">▢</span>
            <span className="y2k-caption">×</span>
          </span>
        </div>
        <div className="y2k-menubar">
          <span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span>
        </div>

        <div className="y2k-body">
          {/* Toolbar: sort toggle */}
          <div className="y2k-toolbar">
            <span style={{ fontSize: 17 }}>Sort by:</span>
            {(['points', 'hours'] as const).map(s => (
              <button key={s} className="y2k-btn" aria-pressed={sortBy === s} onClick={() => setSortBy(s)}>
                {s === 'points' ? 'POINTS' : 'VOL.HRS'}
              </button>
            ))}
          </div>

          {/* Podium — top 3 */}
          {topProfiles.length >= 2 && (
            <div className="y2k-sunken" style={{ marginBottom: 14 }}>
              <div className="y2k-podium">
                {[1, 0, 2].map(idx => {
                  const p = topProfiles[idx];
                  if (!p) return null;
                  const isFirst = idx === 0;
                  const size = isFirst ? 68 : 52;
                  return (
                    <div key={p.id} className="y2k-pod" style={{ order: idx === 1 ? 0 : idx === 0 ? 1 : 2 }}>
                      <div className="y2k-pin" style={{ background: MEDAL[idx], color: '#fff' }}>
                        {isFirst ? '★ 1st ★' : MEDAL_LABEL[idx]}
                      </div>
                      <div className="y2k-pod-av">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" style={{ width: size, height: size, objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Press Start 2P', monospace", fontSize: isFirst ? 16 : 12, background: '#e8e8e8', color: '#000' }}>
                            {getInitials(p.display_name)}
                          </div>
                        )}
                      </div>
                      {isFirst && <Crown className="w-5 h-5" style={{ color: '#b8860b' }} />}
                      <span className="y2k-pod-name">{p.display_name || 'Student'}</span>
                      <span className="y2k-pod-score" style={{ color: MEDAL[idx] }}>{val(p)} {unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rankings listview */}
          <div className="y2k-sunken">
            {topProfiles.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 18 }}>
                No contributors yet. <Link to="/contribute">Start contributing »</Link>
              </div>
            ) : (
              <table className="y2k-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>CONTRIBUTOR</th>
                    <th style={{ textAlign: 'right' }}>{sortBy === 'hours' ? 'HOURS' : 'POINTS'}</th>
                  </tr>
                </thead>
                <tbody>
                  {topProfiles.map((p, i) => (
                    <tr key={p.id}>
                      <td><span className="y2k-rank" style={{ color: i < 3 ? MEDAL[i] : '#000' }}>{i + 1}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="y2k-av-sm" />
                          ) : (
                            <span className="y2k-av-ph">{getInitials(p.display_name)}</span>
                          )}
                          <div>
                            <div>{p.display_name || 'Anonymous'}</div>
                            <div className="y2k-sub">{RANK_LABEL[Math.min(i, 3)]}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="y2k-score" style={{ color: i < 3 ? MEDAL[i] : '#000' }}>{val(p)}</span>
                        <span className="y2k-sub" style={{ marginLeft: 4 }}>{unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Status bar */}
          <div className="y2k-statusbar">
            <span className="y2k-status-cell">{topProfiles.length} contributor(s)</span>
            <span className="y2k-status-cell">Sorted: {sortBy === 'hours' ? 'Vol. hours' : 'Points'}</span>
          </div>
        </div>
      </div>

      {/* ── Side window: how to earn + recent ────────────────────────────── */}
      <div className="y2k-window y2k-window--side">
        <div className="y2k-titlebar">
          <span className="y2k-title"><Zap className="w-3.5 h-3.5" /> HowToEarn.txt</span>
          <span className="y2k-caption-group">
            <span className="y2k-caption">_</span>
            <span className="y2k-caption">×</span>
          </span>
        </div>
        <div className="y2k-body">
          <div className="y2k-h"><Zap className="w-3.5 h-3.5" /> How to earn points</div>
          <div className="y2k-sunken" style={{ padding: '6px 10px', background: '#fff' }}>
            {POINT_ITEMS.map(item => (
              <div key={item.label} className="y2k-earn-row">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="y2k-earn-pts" style={{ color: '#008000' }}>+{item.points}</span>
              </div>
            ))}
          </div>

          {recentContributions.length > 0 && (
            <>
              <div className="y2k-h" style={{ marginTop: 16 }}>Recent activity</div>
              <div className="y2k-sunken" style={{ padding: '6px 10px', background: '#fff' }}>
                {recentContributions.slice(0, 6).map(c => (
                  <div key={c.id} className="y2k-earn-row">
                    <span style={{ textTransform: 'capitalize' }}>{c.action_type.replace(/_/g, ' ')}</span>
                    <span className="y2k-earn-pts" style={{ color: '#008000' }}>+{c.points}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
