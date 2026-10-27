import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CandyCtx {
  enabled: boolean;
  toggle: () => void;
}

const Ctx = createContext<CandyCtx>({ enabled: true, toggle: () => {} });

export function CandyProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('prepd-candy') !== 'off'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('prepd-candy', enabled ? 'on' : 'off'); } catch { /* noop */ }
  }, [enabled]);

  return <Ctx.Provider value={{ enabled, toggle: () => setEnabled(v => !v) }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCandy = () => useContext(Ctx);
