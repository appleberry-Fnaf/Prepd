import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate } from 'animejs';
import { createThreeScene, ThreeScene } from './ThreeObject';
import Ring from './Ring';
import BlueprintOverlay from './BlueprintOverlay';
import ProgressTicker from './ProgressTicker';
import { SCENES, SCROLL_VH, BG_LIGHT } from './constants';

function getScrollProg(el: HTMLElement): number {
  const rect  = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight;
  return total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
}

function sceneAtProgress(p: number): number {
  return Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
}

export default function HeroStage() {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const threeRef    = useRef<ThreeScene | null>(null);
  const rafRef      = useRef<number>(0);
  const sceneIdxRef = useRef<number>(-1);
  const transitRef  = useRef<boolean>(false);
  const pendingRef  = useRef<number | null>(null);

  // DOM refs for animated regions
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef  = useRef<HTMLDivElement>(null);

  const [scrollP,  setScrollP]  = useState(0);
  const [bg,       setBg]       = useState('#1e1c1a');
  const [blueprint, setBlueprint] = useState(false);
  const [ringData, setRingData] = useState({ active: [0,1,2,3,4,5] as number[], accent: null as string | null });
  const [sceneIdx, setSceneIdx] = useState(0);

  // ── Transition: exit current text+card → swap → enter new ────────────────
  function transitionTo(newIdx: number) {
    if (transitRef.current) { pendingRef.current = newIdx; return; }
    transitRef.current = true;

    const textEl = textRef.current;
    const cardEl = cardRef.current;

    // Exit phase (concurrent)
    if (textEl) animate(textEl, { opacity: [1, 0], translateY: [0, -8],  duration: 160, ease: 'inQuad' });
    if (cardEl) animate(cardEl, { opacity: [1, 0], translateX: [0, 14],  duration: 140, ease: 'inQuad' });

    // After exit delay: swap state, enter
    setTimeout(() => {
      const s = SCENES[newIdx];
      setSceneIdx(newIdx);
      setRingData({ active: [...s.ringActive], accent: s.accent });
      setBg(s.bg);
      setBlueprint(s.bg === BG_LIGHT);

      // Update accent bar color immediately
      if (barRef.current) {
        barRef.current.style.background = s.accent ?? 'transparent';
        barRef.current.style.opacity    = s.accent ? '1' : '0';
      }

      // Enter phase (after React paint)
      requestAnimationFrame(() => {
        if (textEl) animate(textEl, { opacity: [0, 1], translateY: [14, 0], duration: 420, ease: 'outExpo' });
        if (cardEl && s.card) {
          animate(cardEl, { opacity: [0, 1], translateX: [14, 0], duration: 400, delay: 60, ease: 'outExpo' });
        }

        setTimeout(() => {
          transitRef.current = false;
          if (pendingRef.current !== null) {
            const next = pendingRef.current;
            pendingRef.current = null;
            transitionTo(next);
          }
        }, 440);
      });
    }, 165);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Hero entrance (text slides from left) ──
    if (!reduced && textRef.current) {
      const h = textRef.current.querySelector('.ah-scene-heading');
      const s = textRef.current.querySelector('.ah-scene-sub');
      if (h) animate(h, { translateX: [-60, 0], opacity: [0, 1], duration: 900, delay: 380, ease: 'outExpo' });
      if (s) animate(s, { translateX: [-40, 0], opacity: [0, 1], duration: 900, delay: 540, ease: 'outExpo' });
    }

    if (reduced) return;

    // ── Three.js ──
    const three = createThreeScene(canvas);
    threeRef.current = three;

    let mx = 0, my = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── rAF loop ──
    let paused = false;
    function tick() {
      rafRef.current = requestAnimationFrame(tick);
      if (paused) return;

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const p   = getScrollProg(wrapper);
      const idx = sceneAtProgress(p);

      three.setScrollProgress(p);
      three.setMouseTilt(mx, my);
      three.setBlueprintMode(SCENES[idx].bg === BG_LIGHT);

      setScrollP(p);

      if (idx !== sceneIdxRef.current) {
        sceneIdxRef.current = idx;
        transitionTo(idx);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
      three.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene = SCENES[sceneIdx];

  return (
    <div ref={wrapperRef} className="ah-scroll-wrapper" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="ah-stage" style={{ background: bg }} data-bp={blueprint ? '' : undefined}>

        {/* Three.js canvas */}
        <canvas ref={canvasRef} className="ah-canvas" aria-hidden="true" />

        {/* Ring — blueprint prop flips segment colors for light bg */}
        <div className="ah-ring-wrap" aria-hidden="true">
          <Ring
            activeSegments={ringData.active}
            accent={ringData.accent}
            blueprint={blueprint}
          />
        </div>

        {/* Blueprint annotation labels (only during beige scenes) */}
        {scene.annotations && (
          <BlueprintOverlay
            annotations={scene.annotations}
            visible={blueprint}
          />
        )}

        {/* Scene text block */}
        <div
          ref={textRef}
          className={`ah-scene-text ${blueprint ? 'ah-scene-text--light' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Accent bar — colored strip above heading (feature scenes only) */}
          <div
            ref={barRef}
            className="ah-accent-bar"
            style={{ background: scene.accent ?? 'transparent', opacity: scene.accent ? 1 : 0 }}
            aria-hidden="true"
          />

          {/* Monospace section tag */}
          {scene.tag && (
            <span
              className="ah-scene-tag"
              style={{ color: scene.accent ?? 'inherit' }}
            >
              {scene.tag}
            </span>
          )}

          <h2 className="ah-scene-heading">
            {scene.heading.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>

          <p className="ah-scene-sub">{scene.subtext}</p>

          {/* Step list — blueprint scenes only */}
          {scene.steps && (
            <ol className="ah-steps" aria-label="Steps">
              {scene.steps.map((step, i) => (
                <li key={i} className="ah-step">
                  <span className="ah-step-num">0{i + 1}</span>
                  <span className="ah-step-label">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {scene.link && scene.linkLabel && (
            <Link to={scene.link} className="ah-scene-link">
              {scene.linkLabel}
            </Link>
          )}
        </div>

        {/* Code card — always in DOM, hidden when no card */}
        <div
          ref={cardRef}
          className="ah-code-card"
          aria-label="Feature detail"
          style={{ opacity: scene.card ? 1 : 0, pointerEvents: scene.card ? 'none' : 'none' }}
        >
          {scene.card
            ? scene.card.split('\n').map((line, i) => (
                <span key={i} className="ah-code-line">{line}</span>
              ))
            : null}
        </div>

        {/* Progress ticker */}
        <ProgressTicker progress={scrollP} />
      </div>
    </div>
  );
}
