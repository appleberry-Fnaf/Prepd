import { LOGO_DATA_URI } from '../lib/logoData';

// Prepd cat-and-books logo — embedded as a data URI so it always ships,
// even from a fresh clone (public/logo.png is used for the favicon).
export function CatMark({ className = 'w-9 h-9' }: { className?: string }) {
  return <img src={LOGO_DATA_URI} alt="Prepd" className={`object-contain ${className}`} />;
}

export default function Logo({ className = 'h-9' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <CatMark className="h-full w-auto aspect-square" />
      <span className="text-xl font-bold text-ink tracking-tight">Prepd</span>
    </span>
  );
}
