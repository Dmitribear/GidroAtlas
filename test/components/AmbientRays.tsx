import React from 'react';

type BeamConfig = {
  left: string;
  bottom: string;
  width: string;
  height: string;
  rotate: number;
  opacity: number;
  delay: number;
  duration: number;
};

const beams: BeamConfig[] = [
  { left: '-5%', bottom: '-15%', width: '45%', height: '120%', rotate: -12, opacity: 0.32, delay: 0, duration: 18 },
  { left: '40%', bottom: '-10%', width: '30%', height: '110%', rotate: -6, opacity: 0.28, delay: 4, duration: 16 },
  { left: '70%', bottom: '-20%', width: '35%', height: '125%', rotate: -16, opacity: 0.24, delay: 8, duration: 20 },
];

export const AmbientRays: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes beamRise {
          0% {
            transform: rotate(var(--beam-rotate, -10deg)) translateY(25%) scale(0.95);
            opacity: 0;
          }
          25% {
            opacity: var(--beam-opacity, 0.28);
          }
          70% {
            opacity: var(--beam-opacity, 0.28);
          }
          100% {
            transform: rotate(var(--beam-rotate, -10deg)) translateY(-30%) scale(1.05);
            opacity: 0;
          }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        {beams.map((beam, idx) => (
          <span
            key={`beam-${idx}`}
            className="absolute"
            style={{
              left: beam.left,
              bottom: beam.bottom,
              width: beam.width,
              height: beam.height,
              background:
                'linear-gradient(160deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.08) 30%, rgba(245,158,11,0.16) 50%, rgba(217,119,6,0.12) 70%, rgba(251,191,36,0) 100%)',
              borderRadius: '32px',
              filter: 'blur(36px)',
              opacity: beam.opacity,
              animation: `beamRise ${beam.duration}s ease-in-out ${beam.delay}s infinite`,
              // CSS variables for the keyframes
              '--beam-rotate': `${beam.rotate}deg`,
              '--beam-opacity': beam.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};
