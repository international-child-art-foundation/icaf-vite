import { useEffect, useRef, useState } from 'react';

const SCROLL_BASE_PX_S = 10;
const SCROLL_START_DELAY_MS = 6000;

const getCap = (vh: number) => {
  if (vh <= 768) return 96;
  if (vh <= 1024) return 150;
  return Math.min(Math.round(vh * 0.4), 300);
};

export const DescriptionScroll = ({ description }: { description: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const resizeRafRef = useRef<number | null>(null);
  const animationRafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const [cap, setCap] = useState(() =>
    typeof window !== 'undefined' ? getCap(window.innerHeight) : 96,
  );
  const [naturalH, setNaturalH] = useState(0);

  useEffect(() => {
    const onResize = () => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        setCap((current) => {
          const next = getCap(window.innerHeight);
          return current === next ? current : next;
        });
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pRef.current) return;
    const el = pRef.current;
    const measure = () => {
      setNaturalH((current) => {
        const next = el.scrollHeight;
        return current === next ? current : next;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

  const containerH = Math.min(naturalH || cap, cap);
  const scrollDist = Math.max(0, naturalH - containerH);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || scrollDist === 0) return;

    container.scrollTop = 0;
    let previousTime: number | null = null;
    let delayRemaining = SCROLL_START_DELAY_MS;

    const animate = (time: number) => {
      if (previousTime === null) previousTime = time;
      const elapsed = time - previousTime;
      previousTime = time;

      if (!pausedRef.current) {
        if (delayRemaining > 0) {
          delayRemaining = Math.max(0, delayRemaining - elapsed);
        } else if (container.scrollTop < scrollDist) {
          container.scrollTop = Math.min(
            scrollDist,
            container.scrollTop + (elapsed * SCROLL_BASE_PX_S) / 1000,
          );
        }
      }

      animationRafRef.current = requestAnimationFrame(animate);
    };

    animationRafRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRafRef.current !== null) {
        cancelAnimationFrame(animationRafRef.current);
        animationRafRef.current = null;
      }
    };
  }, [description, scrollDist]);

  return (
    <div
      ref={containerRef}
      className="description-scrollbar"
      style={{
        height: containerH,
        marginTop: 6,
        overflowX: 'hidden',
        overflowY: scrollDist > 0 ? 'auto' : 'hidden',
        scrollbarColor: '#a3a3a3 #e5e5e5',
        scrollbarWidth: 'thin',
      }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onWheel={(event) => event.stopPropagation()}
    >
      <p
        ref={pRef}
        className="pr-1 text-neutral-500"
        style={{
          fontSize: 14,
          lineHeight: '20px',
          fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
          userSelect: 'text',
          cursor: 'text',
        }}
      >
        {description}
      </p>
    </div>
  );
};
