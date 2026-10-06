import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createThreeScene, ThreeScene } from './ThreeObject';
import Ring from './Ring';
import ProgressTicker from './ProgressTicker';
import { SCENES, SCROLL_VH, BG_LIGHT } from './constants';

function getScrollProg(wrapperEl: HTMLElement): number {
  const rect = wrapperEl.getBoundingClientRect();
  const traveled = -rect.top;
  const total = rect.height - window.innerHeight;
  return total > 0 ? Math.max(0, Math.min(1, traveled / total)) : 0;
}

function resolveSceneIndex(p: number): number {
  return Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
}

export default function HeroStage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const threeRef   = useRef<ThreeScene | null>(null);
  const rafRef     = useRef<number>(0);

  const [sceneIdx, setSceneIdx] = useState(0);
  const [scrollP, setScrollP]   = useState(0);
  const [bg, setBg]             = useState('#1e1c1a');

  const scene = SCENES[sceneIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const three = createThreeScene(canvas);
    threeRef.current = three;

    let mx = 0, my = 0;
    function onMouseMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function tick() {
      const wrapper = wrapperRef.current;
      if (!wrapper) { rafRef.current = requestAnimationFrame(tick); return; }

      const p = getScrollProg(wrapper);
      const idx = resolveSceneIndex(p);
      const currentScene = SCENES[idx];

      three.setScrollProgress(p);
      three.setMouseTilt(mx, my);
      three.setBlueprintMode(currentScene.bg === BG_LIGHT);

      setScrollP(p);
      setSceneIdx(idx);
      setBg(currentScene.bg as string);

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      three.dispose();
    };
  }, []);

  const isBlueprint = bg === BG_LIGHT;

  return (
    /* Tall wrapper — scroll driver, position:relative */
    <div ref={wrapperRef} className="ah-scroll-wrapper" style={{ height: `${SCROLL_VH}vh` }}>

      {/* Sticky stage inside the wrapper */}
      <div
        className="ah-stage"
        style={{ background: bg }}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Three.js canvas */}
        <canvas ref={canvasRef} className="ah-canvas" aria-hidden="true" />

        {/* Ring */}
        <div className="ah-ring-wrap" aria-hidden="true">
          <Ring
            activeSegments={scene.ringActive as unknown as number[]}
            accent={scene.accent}
          />
        </div>

        {/* Scene text */}
        <div className={`ah-scene-text ${isBlueprint ? 'ah-scene-text--light' : ''}`}>
          <h2 className="ah-scene-heading" key={`h-${sceneIdx}`}>
            {scene.heading.split('\n').map((line, i) => (
              <span key={i}>{line}{i < scene.heading.split('\n').length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="ah-scene-sub" key={`s-${sceneIdx}`}>
            {scene.subtext}
          </p>
          {scene.link && scene.linkLabel && (
            <Link to={scene.link} className="ah-scene-link" key={`l-${sceneIdx}`}>
              {scene.linkLabel}
            </Link>
          )}
        </div>

        {/* Code card */}
        {scene.card && (
          <div className="ah-code-card" key={`c-${sceneIdx}`} aria-label="Feature detail">
            {scene.card.split('\n').map((line, i) => (
              <span key={i} className="ah-code-line">{line}</span>
            ))}
          </div>
        )}

        {/* Progress ticker */}
        <ProgressTicker progress={scrollP} />
      </div>
    </div>
  );
}
