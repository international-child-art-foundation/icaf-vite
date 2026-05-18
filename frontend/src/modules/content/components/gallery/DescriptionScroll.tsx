import { useEffect, useRef, useState } from 'react';

const getCap = (vh: number) => {
  if (vh <= 768) return 96;
  if (vh <= 1024) return 150;
  return Math.min(Math.round(vh * 0.4), 300);
};

export const DescriptionScroll = ({ description }: { description: string }) => {
  const SCROLL_BASE_PX_S = 10;
  const SCROLL_START_DELAY_S = 6;
  const SCROLLBAR_W = 4;
  const SCROLLBAR_GAP = 5;

  const pRef = useRef<HTMLParagraphElement>(null);
  const rafRef = useRef<number | null>(null);

  const [cap, setCap] = useState(() =>
    typeof window !== 'undefined' ? getCap(window.innerHeight) : 96,
  );
  const [naturalH, setNaturalH] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setCap(getCap(window.innerHeight));
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pRef.current) return;
    setManualOffset(null);
    const el = pRef.current;
    const measure = () => setNaturalH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

  const descOuterH = Math.min(naturalH || cap, cap);
  const scrollDist = Math.max(0, naturalH - descOuterH);

  useEffect(() => {
    setManualOffset((prev) =>
      prev !== null ? Math.min(prev, scrollDist) : null,
    );
  }, [scrollDist]);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollDist === 0) return;
    e.preventDefault();
    e.stopPropagation();
    let current: number;
    if (manualOffset !== null) {
      current = manualOffset;
    } else if (pRef.current) {
      const t = getComputedStyle(pRef.current).transform;
      current = t === 'none' ? 0 : -new DOMMatrix(t).m42;
    } else {
      current = 0;
    }
    setManualOffset(
      Math.max(0, Math.min(scrollDist, current + e.deltaY * 0.5)),
    );
  };

  const inManual = manualOffset !== null;
  const duration = scrollDist > 0 ? scrollDist / SCROLL_BASE_PX_S : 0;
  const thumbH =
    scrollDist > 0 ? Math.max(12, (descOuterH / naturalH) * descOuterH) : 0;
  const thumbDist = descOuterH - thumbH;
  const manualThumbY =
    manualOffset !== null && scrollDist > 0
      ? (manualOffset / scrollDist) * thumbDist
      : 0;

  return (
    <div
      style={{
        display: 'flex',
        gap: scrollDist > 0 ? SCROLLBAR_GAP : 0,
        height: descOuterH,
        marginTop: 6,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onWheel={handleWheel}
    >
      <div style={{ flex: 1, overflow: 'hidden', height: descOuterH }}>
        <p
          ref={pRef}
          className="neutral-500"
          style={{
            fontSize: 14,
            lineHeight: '20px',
            fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
            userSelect: 'text',
            cursor: 'text',
            willChange: scrollDist > 0 ? 'transform' : 'auto',
            ...(scrollDist > 0
              ? inManual
                ? { transform: `translateY(-${manualOffset}px)` }
                : {
                    '--desc-dist': `-${scrollDist}px`,
                    animationName: 'desc-scroll',
                    animationDuration: `${duration}s`,
                    animationTimingFunction: 'linear',
                    animationDelay: `${SCROLL_START_DELAY_S}s`,
                    animationFillMode: 'forwards',
                    animationPlayState: paused ? 'paused' : 'running',
                  }
              : {}),
          }}
        >
          {description}
        </p>
      </div>
      {scrollDist > 0 && (
        <div
          style={{ width: SCROLLBAR_W, flexShrink: 0, position: 'relative' }}
        >
          <div
            className="bg-neutral-200"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: SCROLLBAR_W / 2,
            }}
          />
          <div
            className="bg-neutral-400"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: thumbH,
              borderRadius: SCROLLBAR_W / 2,
              willChange: 'transform',
              ...(inManual
                ? { transform: `translateY(${manualThumbY}px)` }
                : {
                    '--thumb-dist': `${thumbDist}px`,
                    animationName: 'thumb-scroll',
                    animationDuration: `${duration}s`,
                    animationTimingFunction: 'linear',
                    animationDelay: `${SCROLL_START_DELAY_S}s`,
                    animationFillMode: 'forwards',
                    animationPlayState: paused ? 'paused' : 'running',
                  }),
            }}
          />
        </div>
      )}
    </div>
  );
};
