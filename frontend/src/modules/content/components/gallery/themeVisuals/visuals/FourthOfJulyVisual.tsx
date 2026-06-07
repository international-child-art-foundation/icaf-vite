import type { ThemeVisualProps } from '../types';

export function FourthOfJulyVisual({ isActive = false }: ThemeVisualProps) {
  const launchAnimation = isActive
    ? '[animation:firework-launch_6.4s_ease-in-out_1_forwards]'
    : '';

  return (
    <>
      <style>
        {`
          @keyframes firework-launch {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.7);
            }

            10% {
              opacity: 0.75;
            }

            49% {
              opacity: 0.75;
              transform: translateY(-40px) scale(0.7);
            }

            100% {
              opacity: 0;
              transform: translateY(-40px) scale(0.7);
            }
          }

          #firework-base {
            background-color: #000000;
          }
        `}
      </style>

      <div
        id="firework-base"
        className={`absolute bottom-0 right-32 h-3 w-2 rounded-full ${launchAnimation}`}
      />
    </>
  );
}
