import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface SpotifyMiniPlayerHandle {
  play: () => void;
  stop: () => void;
}

interface Props {
  /** Spotify track URI, e.g. spotify:track:XXXX */
  uri: string;
  /** Stop playback once position reaches this many milliseconds */
  stopAtMs?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: any) => void;
    __spotifyIframeApi?: any;
  }
}

/**
 * A small, real Spotify player controlled via Spotify's iFrame API.
 * Exposes imperative play()/stop() so the parent can start it from a
 * user gesture (needed for autoplay to be allowed).
 */
const SpotifyMiniPlayer = forwardRef<SpotifyMiniPlayerHandle, Props>(
  ({ uri, stopAtMs = 12000 }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<any>(null);
    const watchingRef = useRef(false);

    useImperativeHandle(ref, () => ({
      play() {
        const c = controllerRef.current;
        if (!c) return;
        watchingRef.current = true;
        try { c.seek(0); c.play(); } catch { /* noop */ }
      },
      stop() {
        const c = controllerRef.current;
        if (!c) return;
        watchingRef.current = false;
        try { c.pause(); c.seek(0); } catch { /* noop */ }
      },
    }));

    useEffect(() => {
      let cancelled = false;

      function create(api: any) {
        if (cancelled || !hostRef.current) return;
        api.createController(
          hostRef.current,
          { uri, width: '100%', height: 80 },
          (controller: any) => {
            controllerRef.current = controller;
            controller.addListener('playback_update', (e: any) => {
              const pos = e?.data?.position ?? 0;
              if (watchingRef.current && pos >= stopAtMs) {
                watchingRef.current = false;
                try { controller.pause(); controller.seek(0); } catch { /* noop */ }
              }
            });
          }
        );
      }

      if (window.__spotifyIframeApi) {
        create(window.__spotifyIframeApi);
      } else {
        const prev = window.onSpotifyIframeApiReady;
        window.onSpotifyIframeApiReady = (api: any) => {
          window.__spotifyIframeApi = api;
          if (prev) prev(api);
          create(api);
        };
        if (!document.getElementById('spotify-iframe-api')) {
          const s = document.createElement('script');
          s.id = 'spotify-iframe-api';
          s.src = 'https://open.spotify.com/embed/iframe-api/v1';
          s.async = true;
          document.body.appendChild(s);
        }
      }

      return () => {
        cancelled = true;
        try { controllerRef.current?.destroy(); } catch { /* noop */ }
      };
    }, [uri, stopAtMs]);

    return <div ref={hostRef} style={{ borderRadius: 12, overflow: 'hidden' }} />;
  }
);

export default SpotifyMiniPlayer;
