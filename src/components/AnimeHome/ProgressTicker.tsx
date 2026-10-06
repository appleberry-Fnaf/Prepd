interface ProgressTickerProps {
  progress: number; // 0–1
}

export default function ProgressTicker({ progress }: ProgressTickerProps) {
  const pct = Math.round(progress * 100);
  return (
    <div className="ah-progress" aria-label={`Scroll progress: ${pct}%`}>
      <div className="ah-progress-track">
        <div
          className="ah-progress-fill"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="ah-progress-label">{pct}</span>
    </div>
  );
}
