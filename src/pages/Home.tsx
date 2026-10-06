import { useEffect, useRef } from 'react';
import { Calculator, FlaskConical, Landmark, BookOpen, Globe, Code } from 'lucide-react';

const FACES = [
  {
    id: 'front',
    subject: 'Math',
    Icon: Calculator,
    bg: 'linear-gradient(145deg, #0e1a30 0%, #172d52 100%)',
    glow: '#3b82f6',
    glowRgb: '59,130,246',
    accent: '#60a5fa',
    cls: 'cube-face-front',
  },
  {
    id: 'right',
    subject: 'Science',
    Icon: FlaskConical,
    bg: 'linear-gradient(145deg, #091e10 0%, #0e2e18 100%)',
    glow: '#22c55e',
    glowRgb: '34,197,94',
    accent: '#4ade80',
    cls: 'cube-face-right',
  },
  {
    id: 'back',
    subject: 'History',
    Icon: Landmark,
    bg: 'linear-gradient(145deg, #1e1000 0%, #2e1800 100%)',
    glow: '#f59e0b',
    glowRgb: '245,158,11',
    accent: '#fbbf24',
    cls: 'cube-face-back',
  },
  {
    id: 'left',
    subject: 'English',
    Icon: BookOpen,
    bg: 'linear-gradient(145deg, #150a25 0%, #200e38 100%)',
    glow: '#8b5cf6',
    glowRgb: '139,92,246',
    accent: '#a78bfa',
    cls: 'cube-face-left',
  },
  {
    id: 'top',
    subject: 'Languages',
    Icon: Globe,
    bg: 'linear-gradient(145deg, #200812 0%, #300f1c 100%)',
    glow: '#f43f5e',
    glowRgb: '244,63,94',
    accent: '#fb7185',
    cls: 'cube-face-top',
  },
  {
    id: 'bottom',
    subject: 'Computer Science',
    Icon: Code,
    bg: 'linear-gradient(145deg, #041520 0%, #071d2c 100%)',
    glow: '#06b6d4',
    glowRgb: '6,182,212',
    accent: '#22d3ee',
    cls: 'cube-face-bottom',
  },
] as const;

export default function Home() {
  const cubeRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cube = cubeRef.current;
    const glow = glowRef.current;
    if (!cube) return;

    // Dark bg + hidden scrollbar on body while this page is active
    document.body.classList.add('cube-hero-bg');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      cube.style.transform = 'rotateX(-10deg) rotateY(25deg)';
      return () => { document.body.classList.remove('cube-hero-bg'); };
    }

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let rafId: number;
    let idleAngle = 0;
    let mx = 0, my = 0;
    let lx = 0, ly = 0;
    let lastFaceIdx = -1;

    function getScrollProg() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    }

    function onMouseMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    function tick() {
      idleAngle += 0.055; // ~3.3 deg/sec — barely perceptible, keeps it alive

      if (!isTouch) {
        lx += (mx - lx) * 0.055;
        ly += (my - ly) * 0.055;
      }

      const prog = getScrollProg();
      const scrollRy = -(prog * 360);
      const totalRy = scrollRy + idleAngle + lx * 24;
      const totalRx = -10 + ly * -22;

      cube.style.transform = `rotateX(${totalRx}deg) rotateY(${totalRy}deg)`;

      // Glow + pulse: one step per 1/6 of scroll travel
      const faceIdx = Math.min(Math.floor(prog * 6), 5);
      if (faceIdx !== lastFaceIdx) {
        lastFaceIdx = faceIdx;
        const f = FACES[faceIdx];
        if (glow) {
          glow.style.background =
            `radial-gradient(circle, rgba(${f.glowRgb},0.22) 0%, transparent 65%)`;
        }
        // Scale-pulse via CSS animation
        cube.classList.remove('cube-land-pulse');
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        cube.offsetWidth; // trigger reflow so animation re-fires
        cube.classList.add('cube-land-pulse');
      }

      rafId = requestAnimationFrame(tick);
    }

    if (!isTouch) window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.body.classList.remove('cube-hero-bg');
    };
  }, []);

  return (
    <div className="cube-hero-page">
      {/* Invisible tall div — creates 600 vh of scrollable space */}
      <div style={{ height: '600vh', width: '100%', pointerEvents: 'none' }} aria-hidden="true" />

      {/* Ambient glow bloom (z-index below cube) */}
      <div
        ref={glowRef}
        className="cube-hero-glow"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      {/* Fixed centered cube */}
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
                    width: 'clamp(26px, 5vmin, 58px)',
                    height: 'clamp(26px, 5vmin, 58px)',
                    flexShrink: 0,
                  }}
                />
                <span className="cube-hero-label">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
