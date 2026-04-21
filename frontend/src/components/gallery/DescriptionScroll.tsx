import { useEffect, useRef, useState } from 'react';

export const DescriptionScroll = ({ description }: { description: string }) => {
  const SCROLL_BASE_PX_S = 12;
  const SCROLL_START_DELAY_S = 4;
  const DESC_OUTER_H = 96;
  const SCROLLBAR_W = 4;
  const SCROLLBAR_GAP = 5;

  const pRef = useRef<HTMLParagraphElement>(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!pRef.current) return;
    setManualOffset(null);
    const el = pRef.current;
    const measure = () => {
      const dist = Math.max(0, el.scrollHeight - DESC_OUTER_H);
      setScrollDist(dist);
      setManualOffset((prev) => (prev !== null ? Math.min(prev, dist) : null));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

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
  const totalTextH = DESC_OUTER_H + scrollDist;
  const thumbH =
    scrollDist > 0
      ? Math.max(12, (DESC_OUTER_H / totalTextH) * DESC_OUTER_H)
      : 0;
  const thumbDist = DESC_OUTER_H - thumbH;
  const manualThumbY =
    manualOffset !== null && scrollDist > 0
      ? (manualOffset / scrollDist) * thumbDist
      : 0;

  return (
    <div
      style={{
        display: 'flex',
        gap: scrollDist > 0 ? SCROLLBAR_GAP : 0,
        height: DESC_OUTER_H,
        marginTop: 6,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onWheel={handleWheel}
    >
      <div style={{ flex: 1, overflow: 'hidden', height: DESC_OUTER_H }}>
        <p
          ref={pRef}
          className="neutral-500"
          style={
            {
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
            } as React.CSSProperties
          }
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
            style={
              {
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
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </div>
  );
};
