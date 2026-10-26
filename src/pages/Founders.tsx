import { useEffect, useRef, useState } from 'react';
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
    bio: [
      'My name is Sai Sahaana Aswanth, but I go by Sai. Ever since I was little, I’ve wanted to help the people around me, which led me to pursue biomedical engineering and focus on creating things that make a difference in people’s everyday lives.',
      'I’ve always asked the question, “What can I do better?” As a student, I know how overwhelming it can be to prepare for exams and find reliable study resources, and how quickly trying to stand out can turn learning into a competition. That’s why I created Prepd, a student-led initiative that makes academic resources more accessible and helps students feel supported instead of pressured.',
    ],
  },
  {
    name: 'Sahana Lakshminarasimhan',
    short: 'Sahana',
    role: 'Vice Founder',
    photo: '/founders/sahana.webp',
    baby: '/founders/sahana-baby.jpg',
    accent: '#ef4444',
    photoPos: 'center 28%',
    photoZoom: 1.08,
    babyPos: 'center 62%',
    babyZoom: 1.02,
    song: 'spotify:track:2mdEsXPu8ZmkHRRtAdC09e',
    songStopMs: 13000,
    bio: [
      'My name is Sahana Lakshminarasimhan, and I’ve always believed that every student deserves access to the resources and support they need to reach their full potential. I’m passionate about education, collaboration, and creating opportunities that help others succeed.',
      'I know firsthand how overwhelming it can feel to find effective study materials and prepare for exams, and how isolating that pressure can be. That’s what drew me to help build Prepd, an initiative focused on making learning more accessible and turning studying into something students do together, not alone.',
    ],
  },
];

const VISION: string[] = [
  'Our vision is to build a global community of students and educators, united by the belief that learning should be accessible to everyone. We want to connect students with free, high-quality resources and meaningful ways to contribute, allowing them to explore their interests, build new skills, and find their place in a supportive community.',
  'We believe studying should be more than a race to stand out; it should help students discover what matters to them, learn from one another, and recognize their potential to make a difference. Through Prepd, we hope to build a community where students support one another, share what they know, and work toward their goals with greater confidence. No matter who you are, where you come from, or what you’re working toward, there’s a place for you here.',
  'Ultimately, we envision Prepd becoming a place where knowledge is shared freely, passions become purpose, and small acts of help add up to lasting, meaningful change.',
];

const HEADING = 'Meet the\nfounders.';

export default function Founders() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const players = useRef<Record<string, SpotifyMiniPlayerHandle | null>>({});

  // Typewriter effect for the heading
  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setTyped(HEADING); setTypingDone(true); return; }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(HEADING.slice(0, i));
      if (i >= HEADING.length) { window.clearInterval(id); setTypingDone(true); }
    }, 75);
    return () => window.clearInterval(id);
  }, []);

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
        <h1 className="dk-heading-xl" style={{ position: 'relative', whiteSpace: 'pre-wrap' }} aria-label="Meet the founders.">
          {/* hidden sizer reserves the full height so there's no layout shift */}
          <span aria-hidden="true" style={{ visibility: 'hidden' }}>{HEADING}</span>
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
            {typed}
            <span className={`type-caret ${typingDone ? 'type-caret--done' : ''}`}>|</span>
          </span>
        </h1>
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

        {/* Our Vision */}
        <div className="dk-card" style={{ padding: 'clamp(26px, 4vw, 44px)', marginTop: 'clamp(32px, 6vh, 64px)' }}>
          <span className="dk-page-tag" style={{ marginBottom: 10, display: 'inline-block' }}>Our Vision</span>
          <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 'clamp(22px, 3.2vw, 30px)', fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Where we’re headed.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: 760 }}>
            {VISION.map((para, i) => (
              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ah-muted)' }}>{para}</p>
            ))}
          </div>
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
