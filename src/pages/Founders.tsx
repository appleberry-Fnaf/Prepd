import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Linkedin } from 'lucide-react';
import SpotifyMiniPlayer, { SpotifyMiniPlayerHandle } from '../components/SpotifyMiniPlayer';
import './founders.css';

interface Founder {
  name: string;
  short: string;
  role: string;
  photo: string;
  baby: string;
  accent: string;
  bio: string[];
  photoPos?: string;   // object-position for the pro photo
  photoZoom?: number;  // scale to fill the circle
  babyPos?: string;
  babyZoom?: number;
  song?: string;       // Spotify track URI — plays on flip to baby pic
  songStopMs?: number; // stop playback at this position (ms)
  linkedin?: string;   // LinkedIn profile URL
  favs?: { label: string; src: string; pos: React.CSSProperties; rot: string; tint?: boolean; glow?: boolean }[];
  musicSticker?: string; // sticker that bridges the circle to the Spotify player
}

const FOUNDERS: Founder[] = [
  {
    name: 'Sai Sahaana Aswanth',
    short: 'Sai',
    role: 'Founder',
    photo: '/founders/sai.webp',
    baby: '/founders/sai-baby.webp',
    accent: '#60a5fa',
    photoPos: 'center 40%',
    photoZoom: 1.4,
    babyPos: 'center 32%',
    babyZoom: 1,
    song: 'spotify:track:2WdAV1VqmllcEznKlVOFxG', // Paris in the Rain — Lauv
    songStopMs: 12000,
    linkedin: 'https://www.linkedin.com/in/sai-sahaana-aswanth-7aab47419/',
    favs: [
      { label: 'Chess',      src: '/founders/favs/chess.png',      pos: { top: '-8%',    left: '-12%' }, rot: '-8deg', tint: true },
      { label: 'Piano',      src: '/founders/favs/piano.png',      pos: { top: '-5%',    right: '-13%' }, rot: '7deg', tint: true },
      { label: 'Spider-Man', src: '/founders/favs/spiderman.png',  pos: { bottom: '26%', left: '-14%' }, rot: '6deg', tint: true },
    ],
    musicSticker: '/founders/favs/headphones.png',
    bio: [
      'My name is Sai Sahaana Aswanth, but I go by Sai. Ever since I was little, I’ve wanted to help the people around me, which led me to pursue biomedical engineering. Since starting high school, I’ve focused on creating opportunities that make a meaningful difference in people’s everyday lives.',
      'I’ve always been drawn to the question, “What can we do better?” I believe meaningful change starts with recognizing a problem and finding ways to address it. As a student, I know that preparing for exams and finding reliable study resources can be challenging, which inspired me to create Prepd, a student-led initiative that makes academic resources more accessible and helps students feel more confident in their learning.',
      'Through Prepd, I hope to build a community where students support one another, share knowledge, and work toward their goals together.',
    ],
  },
  {
    name: 'Sahana Lakshminarasimhan',
    short: 'Sahana',
    role: 'Vice Founder',
    photo: '/founders/sahana.webp',
    baby: '/founders/sahana-baby.jpg',
    accent: '#a855f7',
    photoPos: 'center 28%',
    photoZoom: 1.08,
    babyPos: 'center 62%',
    babyZoom: 1.02,
    bio: [
      'My name is Sahana Lakshminarasimhan, and I’m a high school student passionate about education, collaboration, and creating opportunities that help others succeed.',
      'I believe that every student deserves access to the resources and support they need to reach their full potential. However, finding effective study materials and preparing for exams can sometimes feel overwhelming. This inspired me to support initiatives like Prepd which aim to make learning more accessible for students.',
      'Through this initiative, I hope to encourage students to learn from one another, share resources, and approach their academic goals with greater confidence.',
    ],
  },
];

export default function Founders() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const players = useRef<Record<string, SpotifyMiniPlayerHandle | null>>({});

  const toggle = (f: Founder) => {
    const next = !flipped[f.name];
    setFlipped(prev => ({ ...prev, [f.name]: next }));
    // Play the founder's song when flipping to the baby pic; stop when flipping back
    if (f.song) {
      const p = players.current[f.name];
      if (next) p?.play();
      else p?.stop();
    }
  };

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">About</span>
        <h1 className="dk-heading-xl">Meet the<br />founders.</h1>
        <p className="dk-sub" style={{ maxWidth: 520 }}>
          Prepd is run and built by students! Here are the students who made this happen.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 6vh, 64px)' }}>
          {FOUNDERS.map((f, i) => {
            const isFlipped = !!flipped[f.name];
            return (
              <div
                key={f.name}
                className="dk-card founder-card"
                style={{
                  display: 'grid',
                  gap: 'clamp(20px, 4vw, 44px)',
                  padding: 'clamp(22px, 3vw, 36px)',
                  alignItems: 'center',
                  direction: i % 2 === 1 ? 'rtl' : 'ltr',
                }}
              >
                {/* Photo — circular flip card */}
                <div className="founder-photo" style={{ direction: 'ltr', ['--accent' as string]: f.accent }}>
                  <div className="flip-wrap">
                    <div
                      className={`flip ${isFlipped ? 'is-flipped' : ''}`}
                      onClick={() => toggle(f)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(f); } }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${f.name} — tap to flip between now and baby photo`}
                    >
                      <div className="flip-inner">
                        <div className="flip-face flip-front">
                          <img src={f.photo} alt={f.name}
                            style={{ objectPosition: f.photoPos ?? 'center', transform: `scale(${f.photoZoom ?? 1})` }} />
                        </div>
                        <div className="flip-face flip-back">
                          <img src={f.baby} alt={`${f.short} as a baby`}
                            style={{ objectPosition: f.babyPos ?? 'center', transform: `scale(${f.babyZoom ?? 1})` }} />
                        </div>
                      </div>
                    </div>

                    {/* Favorite-things stickers — pop out when flipped to the baby pic */}
                    {isFlipped && f.favs?.map((fav, k) => (
                      <div
                        key={fav.label}
                        className={`fav ${fav.tint ? 'fav-tint' : ''} ${fav.glow ? 'fav-glow' : ''}`}
                        title={fav.label}
                        style={{
                          ...fav.pos,
                          ['--rot' as string]: fav.rot,
                          animationDelay: `${0.12 + k * 0.09}s, ${0.6 + k * 0.3}s`,
                        }}
                      >
                        <img src={fav.src} alt={fav.label} />
                      </div>
                    ))}

                    {/* Over-ear headphones wrapping the circle, cord into the player */}
                    {isFlipped && f.song && (
                      <svg className="music-rig" viewBox="0 0 100 150" fill="none" aria-hidden="true">
                        {/* headband over the top */}
                        <path d="M6 50 C 6 7, 94 7, 94 50" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
                        {/* ear cups at the middle of the photo */}
                        <rect x="-3" y="35" width="20" height="33" rx="10" fill="#fff" transform="rotate(-11 7 51)" />
                        <rect x="83" y="35" width="20" height="33" rx="10" fill="#fff" transform="rotate(11 93 51)" />
                        {/* cord curling down into the player */}
                        <path d="M8 66 C 1 90, 34 99, 21 117 C 11 131, 35 141, 47 150"
                          stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>

                  {/* Spotify player — reveals + plays when flipped to the baby pic */}
                  {f.song && (
                    <div
                      className="founder-song"
                      style={{
                        maxWidth: 320,
                        width: '100%',
                        marginTop: isFlipped ? 16 : 0,
                        maxHeight: isFlipped ? 120 : 0,
                        opacity: isFlipped ? 1 : 0,
                        overflow: 'hidden',
                        transform: isFlipped ? 'translateY(0)' : 'translateY(-8px)',
                        transition: 'opacity 0.45s ease, max-height 0.45s ease, margin-top 0.45s ease, transform 0.45s ease',
                        pointerEvents: isFlipped ? 'auto' : 'none',
                      }}
                    >
                      <SpotifyMiniPlayer
                        ref={(el) => { players.current[f.name] = el; }}
                        uri={f.song}
                        stopAtMs={f.songStopMs ?? 12000}
                      />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div style={{ direction: 'ltr', minWidth: 0 }}>
                  <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {f.name}
                  </h2>
                  <p style={{ fontFamily: 'var(--ah-mono)', fontSize: 12.5, fontWeight: 700, color: f.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: f.linkedin ? 10 : 16 }}>
                    {f.role}
                  </p>
                  {f.linkedin && (
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        marginBottom: 16, padding: '6px 12px', borderRadius: 999,
                        background: `${f.accent}14`, border: `1px solid ${f.accent}3a`,
                        color: f.accent, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      <Linkedin className="w-4 h-4" /> Connect on LinkedIn
                    </a>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {f.bio.map((para, j) => (
                      <p key={j} style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ah-muted)' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 7vh, 72px)' }}>
          <p style={{ fontSize: 15, color: 'var(--ah-muted)', marginBottom: 18 }}>
            Want to be part of the story?
          </p>
          <Link to="/contribute" className="dk-btn dk-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start contributing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
