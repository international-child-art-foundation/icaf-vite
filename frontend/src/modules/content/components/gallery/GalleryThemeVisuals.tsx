type ThemeVisualProps = {
  family: string;
};

function normalizeFamily(family: string) {
  return family.trim().toUpperCase();
}

function CherryBlossomVisual() {
  return (
    <>
      <style>
        {`
          @keyframes cherry-drift {
            0% { transform: translate3d(-10%, 8%, 0) rotate(0deg); opacity: 0.45; }
            50% { transform: translate3d(12%, -10%, 0) rotate(14deg); opacity: 0.85; }
            100% { transform: translate3d(28%, 14%, 0) rotate(28deg); opacity: 0.45; }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[#fff7fb]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(250,170,205,0.72),transparent_32%),linear-gradient(130deg,rgba(255,255,255,0.86),rgba(250,216,229,0.78)_48%,rgba(103,74,99,0.82))]" />
      <div className="absolute -left-8 top-3 h-16 w-36 rotate-[-10deg] rounded-full border-t-[10px] border-[#6f4b5d]/70" />
      <span className="absolute left-[56%] top-4 h-5 w-3 rounded-[60%_40%_60%_40%] bg-[#f6a8c8] opacity-80 [animation:cherry-drift_7s_ease-in-out_infinite]" />
      <span className="absolute left-[72%] top-10 h-4 w-2.5 rounded-[60%_40%_60%_40%] bg-white/80 [animation:cherry-drift_9s_ease-in-out_infinite_reverse]" />
      <span className="absolute left-[42%] top-16 h-3.5 w-2 rounded-[60%_40%_60%_40%] bg-[#e97faa]/85 [animation:cherry-drift_8s_ease-in-out_infinite]" />
    </>
  );
}

function DefaultThemeVisual({ family }: ThemeVisualProps) {
  const hue = [...normalizeFamily(family)].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  ) % 360;

  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          `linear-gradient(135deg, hsl(${hue} 74% 92%), hsl(${(hue + 42) % 360} 64% 70%) 56%, hsl(${(hue + 190) % 360} 42% 38%))`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.75),transparent_34%),radial-gradient(circle_at_78%_70%,rgba(255,255,255,0.28),transparent_30%)]" />
      <div className="absolute -right-8 bottom-3 h-20 w-32 rotate-[-18deg] rounded-full border-[12px] border-white/30" />
    </div>
  );
}

export function GalleryThemeVisual({ family }: ThemeVisualProps) {
  switch (normalizeFamily(family)) {
    case 'CHERRY_BLOSSOM':
    case 'CHERRYBLOSSOM':
      return <CherryBlossomVisual />;
    default:
      return <DefaultThemeVisual family={family} />;
  }
}
