import { useEffect, useRef, useState } from 'react';
import { Check, Link } from 'lucide-react';
import { TResolvedArtwork } from '@/types/Gallery';
import { formatArtistName } from '@/utils/galleryProcessing';

export const LIP_COLLAPSED_H = 76; // px — used by parent for gesture hit-testing

const CORNER_R = 16; // px, top corner radius
const BORDER_PX = 3; // gradient strip thickness

const LIP_GRADIENT_STOPS = [
  { color: '#DA1E40' },
  { color: '#FFBC42' },
  { color: '#168C39' },
  { color: '#2057CC' },
  { color: '#871EDA' },
];
const ANIM_BRIGHTS = ['#FF4D6D', '#FFD166', '#2DC653', '#4285F4', '#B565F7'];
const ANIM_STAGGER = 0.5;

const GradientStrip = () => (
  <svg
    aria-hidden="true"
    style={{
      display: 'block',
      width: '100%',
      height: BORDER_PX,
      flexShrink: 0,
    }}
    viewBox="0 0 1 1"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient
        id="lipGrad"
        x1="0"
        y1="0"
        x2="1"
        y2="0"
        gradientUnits="objectBoundingBox"
      >
        {LIP_GRADIENT_STOPS.map((s, i) => (
          <stop
            key={s.color}
            offset={`${(i / (LIP_GRADIENT_STOPS.length - 1)) * 100}%`}
            stopColor={s.color}
          >
            <animate
              attributeName="stop-color"
              values={`${s.color};${ANIM_BRIGHTS[i]};${s.color}`}
              dur="3s"
              begin={`${i * ANIM_STAGGER}s`}
              repeatCount="indefinite"
            />
          </stop>
        ))}
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="1" height="1" fill="url(#lipGrad)" />
  </svg>
);

const FacebookGlyph = () => (
  <svg
    viewBox="0 0 32 32"
    width="19"
    height="19"
    fill="currentColor"
    aria-hidden
  >
    <path d="M19.9145 17.0465L20.3704 14.1496H17.5618V12.2667C17.5618 11.4746 17.954 10.7006 19.2078 10.7006H20.5026V8.2337C19.7486 8.11345 18.9866 8.0484 18.223 8.03906C15.9114 8.03906 14.4022 9.42865 14.4022 11.9408V14.1496H11.8398V17.0465H14.4022V24.0533H17.5618V17.0465H19.9145Z" />
  </svg>
);
const WhatsappGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="currentColor"
    aria-hidden
  >
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413z" />
  </svg>
);
const XGlyph = () => (
  <svg
    viewBox="0 0 32 32"
    width="19"
    height="19"
    fill="currentColor"
    aria-hidden
  >
    <path d="M17.5222 14.7749L23.4785 8H22.0671L16.8952 13.8826L12.7644 8H8L14.2466 16.8955L8 24H9.41155L14.8732 17.7878L19.2356 24H24L17.5218 14.7749H17.5222ZM15.5889 16.9738L14.956 16.0881L9.92015 9.03974H12.0882L16.1522 14.728L16.7851 15.6137L22.0677 23.0075H19.8997L15.5889 16.9742V16.9738Z" />
  </svg>
);
const LinkedInGlyph = () => (
  <svg
    viewBox="0 0 32 32"
    width="19"
    height="19"
    fill="currentColor"
    aria-hidden
  >
    <path d="M11.6 24H8.2V13.3H11.6V24ZM9.9 11.8C8.8 11.8 8 11 8 9.9C8 8.8 8.9 8 9.9 8C11 8 11.8 8.8 11.8 9.9C11.8 11 11 11.8 9.9 11.8ZM24 24H20.6V18.2C20.6 16.5 19.9 16 18.9 16C17.9 16 16.9 16.8 16.9 18.3V24H13.5V13.3H16.7V14.8C17 14.1 18.2 13 19.9 13C21.8 13 23.8 14.1 23.8 17.4V24H24Z" />
  </svg>
);

const ICON_COLORS = LIP_GRADIENT_STOPS.map((s) => s.color);

const MobileShareRow = ({ shareUrl }: { shareUrl: string }) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(shareUrl);

  const open = (url: string) => {
    const w = 600,
      h = 400;
    window.open(
      url,
      'sharePopup',
      `status=1,width=${w},height=${h},top=${(window.innerHeight - h) / 2},left=${(window.innerWidth - w) / 2}`,
    );
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const btn = (
    color: string,
    label: string,
    onClick: () => void,
    child: React.ReactNode,
  ) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: 'white',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {child}
    </button>
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {btn(
        ICON_COLORS[0],
        'Copy link',
        () => void copy(),
        copied ? <Check size={17} /> : <Link size={17} />,
      )}
      {btn(
        ICON_COLORS[1],
        'Share on Facebook',
        () => open(`https://www.facebook.com/sharer/sharer.php?u=${enc}`),
        <FacebookGlyph />,
      )}
      {btn(
        ICON_COLORS[2],
        'Share on WhatsApp',
        () => open(`https://wa.me/?text=${enc}`),
        <WhatsappGlyph />,
      )}
      {btn(
        ICON_COLORS[3],
        'Share on X',
        () => open(`https://twitter.com/intent/tweet?url=${enc}`),
        <XGlyph />,
      )}
      {btn(
        ICON_COLORS[4],
        'Share on LinkedIn',
        () =>
          open(`https://www.linkedin.com/shareArticle?mini=true&url=${enc}`),
        <LinkedInGlyph />,
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  artwork: TResolvedArtwork;
  lipY: number; // 0 = collapsed, maxLipY = fully open
  maxLipY: number;
  shareUrl: string;
  shareVisible: boolean;
  textVisible: boolean; // parent fades this on artwork change
  descExpanded: boolean; // false while collapsing for artwork swap, then true to expand
}

const FONT: React.CSSProperties = {
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
};

export const MobileLip = ({
  artwork,
  lipY,
  maxLipY,
  shareUrl,
  shareVisible,
  textVisible,
  descExpanded,
}: Props) => {
  const descRef = useRef<HTMLDivElement>(null);

  // Stop gesture propagation into parent when description content overflows
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      if (el.scrollHeight > el.clientHeight) e.stopPropagation();
    };
    el.addEventListener('touchmove', onMove, { passive: true });
    return () => el.removeEventListener('touchmove', onMove);
  }, [artwork]);

  const name =
    (artwork.artists?.length ?? 0) > 0
      ? formatArtistName(artwork.artists ?? [], artwork.lastInitial)
      : null;
  const location = [artwork.region, artwork.country].filter(Boolean).join(', ');

  const t = maxLipY > 0 ? Math.min(lipY / maxLipY, 1) : 0;

  const hasTitle = !!artwork.title;
  const primaryText = hasTitle ? `\u201c${artwork.title}\u201d` : name;
  const secondaryText = hasTitle ? name : null;

  const maxDescH = Math.floor(window.innerHeight * 0.6 * 0.4);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: `${CORNER_R}px ${CORNER_R}px 0 0`,
        overflow: 'hidden',
        background: 'white',
        maxHeight: LIP_COLLAPSED_H + lipY,
      }}
    >
      <GradientStrip />

      <div
        style={{
          paddingTop: 9,
          paddingBottom: 7,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 34,
            height: 4,
            borderRadius: 2,
            background: 'rgba(0,0,0,0.18)',
          }}
        />
      </div>

      <div
        style={{
          padding: '0 16px 10px',
          textAlign: 'center',
          opacity: textVisible ? 1 : 0,
          transition: textVisible ? 'opacity 0.2s ease' : 'opacity 0.1s ease',
        }}
      >
        {primaryText && (
          <p
            style={{
              ...FONT,
              fontSize: 15,
              fontWeight: 700,
              fontStyle: hasTitle ? 'italic' : 'normal',
              lineHeight: '20px',
              color: '#111',
              whiteSpace: t > 0.05 ? 'normal' : 'nowrap',
              overflow: 'hidden',
              textOverflow: t > 0.05 ? 'clip' : 'ellipsis',
            }}
          >
            {primaryText}
          </p>
        )}
        {secondaryText && (
          <p
            style={{
              ...FONT,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: '18px',
              color: '#555',
              marginTop: 2,
              whiteSpace: t > 0.05 ? 'normal' : 'nowrap',
              overflow: 'hidden',
              textOverflow: t > 0.05 ? 'clip' : 'ellipsis',
            }}
          >
            {secondaryText}
          </p>
        )}
      </div>

      <div style={{ opacity: t, padding: '0 16px 28px' }}>
        <div
          style={{
            height: 1,
            background: 'rgba(0,0,0,0.03)',
            marginBottom: 12,
          }}
        />

        {artwork.age !== undefined && (
          <p
            style={{
              ...FONT,
              fontSize: 13,
              color: '#555',
              marginBottom: 3,
              textAlign: 'center',
              opacity: textVisible ? 1 : 0,
              transition: textVisible
                ? 'opacity 0.2s ease'
                : 'opacity 0.1s ease',
            }}
          >
            Age {artwork.age}
            {location && <span style={{ color: '#888' }}> · {location}</span>}
          </p>
        )}
        {artwork.event && (
          <p
            style={{
              ...FONT,
              fontSize: 11,
              color: '#aaa',
              textTransform: 'capitalize',
              marginBottom: 14,
              textAlign: 'center',
              opacity: textVisible ? 1 : 0,
              transition: textVisible
                ? 'opacity 0.2s ease'
                : 'opacity 0.1s ease',
            }}
          >
            {artwork.event}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: descExpanded ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.25s ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            {artwork.description && (
              <>
                {artwork.artists?.[0] && (
                  <p
                    style={{
                      ...FONT,
                      fontSize: 13,
                      color: '#666',
                      marginBottom: 6,
                    }}
                  >
                    {artwork.artists[0]} says:
                  </p>
                )}
                <div
                  ref={descRef}
                  style={{
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    maxHeight: maxDescH,
                    marginBottom: 22,
                  }}
                >
                  <p
                    style={{
                      ...FONT,
                      fontSize: 14,
                      lineHeight: '22px',
                      color: '#333',
                      opacity: textVisible ? 1 : 0,
                      transition: textVisible
                        ? 'opacity 0.2s ease'
                        : 'opacity 0.1s ease',
                    }}
                  >
                    {artwork.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            opacity: shareVisible ? 1 : 0,
            transition: shareVisible ? 'opacity 300ms ease' : 'opacity 0ms',
          }}
        >
          <MobileShareRow shareUrl={shareUrl} />
        </div>
      </div>
    </div>
  );
};
