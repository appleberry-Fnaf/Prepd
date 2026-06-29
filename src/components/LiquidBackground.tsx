interface LiquidBackgroundProps {
  className?: string;
}

/**
 * Animated "pool water" caustics background. Two layers of fractal-noise
 * turbulence (coarse + fine) are remapped into thin bright light-lines and
 * slowly morphed via SVG SMIL animation, recreating the rippling caustic
 * network you see on the bottom of a sunlit swimming pool. Layered over a
 * light cyan/blue gradient. Purely decorative and pointer-events-none so it
 * never interferes with the content on top of it.
 */
export default function LiquidBackground({ className = '' }: LiquidBackgroundProps) {
  return (
    <div
      className={`liquid-bg absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="caustics"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Coarse, large caustic network */}
          <filter id="liquid-caustic-a" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.014"
              numOctaves={2}
              seed={3}
              stitchTiles="stitch"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="26s"
                values="0.012 0.014; 0.015 0.011; 0.011 0.015; 0.012 0.014"
                repeatCount="indefinite"
              />
            </feTurbulence>
            {/* White fill, alpha = luminance of the noise field */}
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0.33 0.59 0.11 0 0"
              result="lum"
            />
            {/* Turn the smooth gradient into thin bright contour lines */}
            <feComponentTransfer in="lum" result="lines">
              <feFuncA type="discrete" tableValues="0 0 0 0 1 0 0 0 0 0 1 0 0 0 0" />
            </feComponentTransfer>
            <feGaussianBlur in="lines" stdDeviation="0.5" />
          </filter>

          {/* Fine, secondary caustic network */}
          <filter id="liquid-caustic-b" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.024 0.028"
              numOctaves={2}
              seed={11}
              stitchTiles="stitch"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="19s"
                values="0.024 0.028; 0.028 0.023; 0.023 0.029; 0.024 0.028"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0.33 0.59 0.11 0 0"
              result="lum"
            />
            <feComponentTransfer in="lum" result="lines">
              <feFuncA type="discrete" tableValues="0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0" />
            </feComponentTransfer>
            <feGaussianBlur in="lines" stdDeviation="0.35" />
          </filter>
        </defs>

        <rect
          className="caustic-layer caustic-layer--a"
          width="100%"
          height="100%"
          filter="url(#liquid-caustic-a)"
        />
        <rect
          className="caustic-layer caustic-layer--b"
          width="100%"
          height="100%"
          filter="url(#liquid-caustic-b)"
        />
      </svg>

      {/* Soft surface sheen drifting across the water */}
      <div className="liquid-sheen" />
    </div>
  );
}
