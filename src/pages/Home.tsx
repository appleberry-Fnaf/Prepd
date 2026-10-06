import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate } from 'animejs';
import { Calculator, FlaskConical, Landmark, BookOpen, Globe, Code, ArrowRight, Layers, PenTool, Upload } from 'lucide-react';
import { CatMark } from '../components/Logo';

const FACES = [
  {
    id: 'front',
    subject: 'Math',
    Icon: Calculator,
    bg: 'linear-gradient(145deg, #0e1a30 0%, #172d52 100%)',
    glow: '#3b82f6',
    accent: '#60a5fa',
    cls: 'cube-face-front',
  },
  {
    id: 'right',
    subject: 'Science',
    Icon: FlaskConical,
    bg: 'linear-gradient(145deg, #091e10 0%, #0e2e18 100%)',
    glow: '#22c55e',
    accent: '#4ade80',
    cls: 'cube-face-right',
  },
  {
    id: 'back',
    subject: 'History',
    Icon: Landmark,
    bg: 'linear-gradient(145deg, #1e1000 0%, #2e1800 100%)',
    glow: '#f59e0b',
    accent: '#fbbf24',
    cls: 'cube-face-back',
  },
  {
    id: 'left',
    subject: 'English',
    Icon: BookOpen,
    bg: 'linear-gradient(145deg, #150a25 0%, #200e38 100%)',
    glow: '#8b5cf6',
    accent: '#a78bfa',
    cls: 'cube-face-left',
  },
  {
    id: 'top',
    subject: 'Languages',
    Icon: Globe,
    bg: 'linear-gradient(145deg, #200812 0%, #300f1c 100%)',
    glow: '#f43f5e',
    accent: '#fb7185',
    cls: 'cube-face-top',
  },
  {
    id: 'bottom',
    subject: 'Computer Science',
    Icon: Code,
    bg: 'linear-gradient(145deg, #041520 0%, #071d2c 100%)',
    glow: '#06b6d4',
    accent: '#22d3ee',
    cls: 'cube-face-bottom',
  },
] as const;

const DESTINATIONS = [
  { to: '/subjects',   label: 'Subjects',   Icon: Layers,  color: '#7faaee' },
  { to: '/practice',   label: 'Practice',   Icon: PenTool, color: '#4ade80' },
  { to: '/contribute', label: 'Contribute', Icon: Upload,  color: '#fbbf24' },
];

function playChime() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Two soft sine tones — A4 then E5, quiet and short
    [[440, 0, 0.048], [659, 0.18, 0.032]].forEach(([freq, delay, peak]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 1.6);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 1.6);
    });
  } catch { /* audio not available */ }
}

export default function Home() {
  const cubeRef    = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const readyRef   = useRef<HTMLSpanElement>(null);
  const prepdRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.body.classList.add('cube-hero-bg');

    // ── Startup chime on first interaction ──
    let chimePlayed = false;
    function onFirstInteract() {
      if (chimePlayed) return;
      chimePlayed = true;
      playChime();
    }
    window.addEventListener('click',  onFirstInteract, { once: true });
    window.addEventListener('scroll', onFirstInteract, { once: true, passive: true });

    // ── Slide-in text ──
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      if (readyRef.current) {
        animate(readyRef.current, {
          translateX: [-80, 0], opacity: [0, 1],
          duration: 950, ease: 'outExpo', delay: 450,
        });
      }
      if (prepdRef.current) {
        animate(prepdRef.current, {
          translateX: [-80, 0], opacity: [0, 1],
          duration: 950, ease: 'outExpo', delay: 750,
        });
      }
    }

    // ── Cube rotation + scroll-driven effects ──
    const cube = cubeRef.current;
    if (!cube) return () => { document.body.classList.remove('cube-hero-bg'); };

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let rafId: number;
    let idleAngle = 0;
    let mx = 0, my = 0, lx = 0, ly = 0;
    let lastZone = -1;

    function getScrollProg() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    }

    function onMouseMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    function tick() {
      idleAngle += 0.055;
      if (!isTouch) {
        lx += (mx - lx) * 0.055;
        ly += (my - ly) * 0.055;
      }

      const prog   = getScrollProg();
      const totalRy = -(prog * 360) + idleAngle + lx * 24;
      const totalRx = -10 + ly * -22;
      cube.style.transform = `rotateX(${totalRx}deg) rotateY(${totalRy}deg)`;

      // Hero text: fade out in first 30 % of scroll
      if (textRef.current) {
        textRef.current.style.opacity = String(Math.max(0, 1 - prog * 3.3));
      }

      // CTA panel: fade in from 72 % onward
      if (ctaRef.current) {
        const ctaOpacity = Math.max(0, (prog - 0.72) * 3.6);
        ctaRef.current.style.opacity   = String(ctaOpacity);
        ctaRef.current.style.pointerEvents = ctaOpacity > 0.05 ? 'auto' : 'none';
      }

      // Subtle scale-pulse when crossing a 90 ° Y-face boundary
      const normY = ((totalRy % 360) + 360) % 360;
      const zone  = Math.floor(normY / 90);
      if (zone !== lastZone) {
        lastZone = zone;
        cube.classList.remove('cube-land-pulse');
        void cube.offsetWidth; // reflow
        cube.classList.add('cube-land-pulse');
      }

      rafId = requestAnimationFrame(tick);
    }

    if (!reduced) {
      if (!isTouch) window.addEventListener('mousemove', onMouseMove, { passive: true });
      rafId = requestAnimationFrame(tick);
    } else {
      cube.style.transform = 'rotateX(-10deg) rotateY(25deg)';
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click',  onFirstInteract);
      window.removeEventListener('scroll', onFirstInteract);
      document.body.classList.remove('cube-hero-bg');
    };
  }, []);

  return (
    <div className="cube-hero-page">

      {/* ── Nav ── */}
      <nav className="ch-nav">
        <Link to="/" className="ch-nav-brand">
          <CatMark className="w-8 h-8" />
          <span>Prepd</span>
        </Link>
        <div className="ch-nav-links">
          <Link to="/subjects">Subjects</Link>
          <Link to="/practice">Practice</Link>
          <Link to="/contribute">Contribute</Link>
        </div>
      </nav>

      {/* ── Scroll area — creates the 600 vh of scrollable height ── */}
      <div style={{ height: '600vh' }} aria-hidden="true" />

      {/* ── Warm ambient glow — static, not AI-neon ── */}
      <div className="ch-glow" aria-hidden="true" />

      {/* ── Hero text (slides in, fades out on scroll) ── */}
      <div ref={textRef} className="ch-hero-text" aria-label="Get Ready. Get Prepd.">
        <span ref={readyRef}  className="ch-line">Get Ready.</span>
        <span ref={prepdRef}  className="ch-line ch-line--accent">Get Prepd.</span>
      </div>

      {/* ── Fixed 3D cube ── */}
      <div className="cube-hero-fixed" aria-label="Interactive 3D subject cube">
        <div className="cube-hero-scene">
          <div ref={cubeRef} className="cube-hero-body">
            {FACES.map(({ id, subject, Icon, bg, glow, accent, cls }) => (
              <div
                key={id}
                className={`cube-hero-face ${cls}`}
                style={{ background: bg, ['--face-glow' as string]: glow }}
              >
                <Icon
                  aria-hidden="true"
                  style={{
                    color: accent,
                    width:  'clamp(22px, 4vmin, 52px)',
                    height: 'clamp(22px, 4vmin, 52px)',
                    flexShrink: 0,
                  }}
                />
                <span className="cube-hero-label">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA panel (fades in at end of scroll) ── */}
      <div
        ref={ctaRef}
        className="ch-cta"
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <p className="ch-cta-heading">Where do you want to start?</p>
        <div className="ch-cta-grid">
          {DESTINATIONS.map(({ to, label, Icon, color }) => (
            <Link key={to} to={to} className="ch-cta-card">
              <Icon aria-hidden="true" style={{ color, width: 18, height: 18, flexShrink: 0 }} />
              {label}
              <ArrowRight aria-hidden="true" style={{ width: 14, height: 14, opacity: 0.4 }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
