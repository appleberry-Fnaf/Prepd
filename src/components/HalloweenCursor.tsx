import { useEffect, useRef } from 'react';

interface Candy {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotSpeed: number;
  life: number; decay: number;
  size: number; type: number;
  color: string; stripe: string;
}

const PALETTES: [string, string][] = [
  ['#f97316', '#fed7aa'], // orange
  ['#ec4899', '#fce7f3'], // pink
  ['#8b5cf6', '#ede9fe'], // purple
  ['#f5c842', '#fef3c7'], // yellow
  ['#ef4444', '#fee2e2'], // red
  ['#22c55e', '#dcfce7'], // green
];

function drawRound(ctx: CanvasRenderingContext2D, c: Candy) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rot);
  ctx.globalAlpha = c.life;
  ctx.beginPath();
  ctx.arc(0, 0, c.size, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = c.stripe;
  ctx.lineWidth = c.size * 0.38;
  ctx.beginPath();
  ctx.moveTo(-c.size * 1.6, 0);
  ctx.lineTo(c.size * 1.6, 0);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawLollipop(ctx: CanvasRenderingContext2D, c: Candy) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rot);
  ctx.globalAlpha = c.life;
  // stick
  ctx.strokeStyle = '#d6b48a';
  ctx.lineWidth = c.size * 0.18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, c.size * 0.7);
  ctx.lineTo(0, c.size * 2.4);
  ctx.stroke();
  // ball
  ctx.beginPath();
  ctx.arc(0, 0, c.size, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.fill();
  // swirl
  ctx.strokeStyle = c.stripe;
  ctx.lineWidth = c.size * 0.26;
  ctx.beginPath();
  ctx.arc(0, 0, c.size * 0.48, 0.2, Math.PI * 1.3);
  ctx.stroke();
  ctx.restore();
}

function drawCorn(ctx: CanvasRenderingContext2D, c: Candy) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rot);
  ctx.globalAlpha = c.life;
  const h = c.size * 2.6, w = c.size * 1.5;
  // white tip
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(-w * 0.28, h * 0.1);
  ctx.lineTo(w * 0.28, h * 0.1);
  ctx.closePath();
  ctx.fillStyle = '#fff8dc';
  ctx.fill();
  // orange middle
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, h * 0.1);
  ctx.lineTo(-w * 0.52, -h * 0.18);
  ctx.lineTo(w * 0.52, -h * 0.18);
  ctx.lineTo(w * 0.28, h * 0.1);
  ctx.closePath();
  ctx.fillStyle = '#f97316';
  ctx.fill();
  // yellow top
  ctx.beginPath();
  ctx.moveTo(-w * 0.52, -h * 0.18);
  ctx.lineTo(0, -h * 0.5);
  ctx.lineTo(w * 0.52, -h * 0.18);
  ctx.closePath();
  ctx.fillStyle = '#f5c842';
  ctx.fill();
  ctx.restore();
}

export default function HalloweenCursor() {
  const isOctober = new Date().getMonth() === 9;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candies = useRef<Candy[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isOctober) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let lastX = -999, lastY = -999;
    function onMove(e: MouseEvent) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 120) return; // ~11px between spawns
      lastX = e.clientX; lastY = e.clientY;
      const [color, stripe] = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      candies.current.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 3.5 - 0.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.22,
        life: 1,
        decay: 0.016 + Math.random() * 0.014,
        size: 7 + Math.random() * 7,
        type: Math.floor(Math.random() * 3),
        color, stripe,
      });
    }
    window.addEventListener('mousemove', onMove);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const c of candies.current) {
        c.vy += 0.13;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotSpeed;
        c.life -= c.decay;
      }
      candies.current = candies.current.filter(c => c.life > 0);
      for (const c of candies.current) {
        if (c.type === 0) drawRound(ctx, c);
        else if (c.type === 1) drawLollipop(ctx, c);
        else drawCorn(ctx, c);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOctober]);

  if (!isOctober) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998 }}
    />
  );
}
