import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import { giveArtworkKudos } from '@/api/public';
import { cn } from '@/utils/utils';
import {
  consumeDailyKudos,
  getKudosStatus,
  KUDOS_AMOUNT,
  KUDOS_STORAGE_EVENT,
  restoreDailyKudos,
} from './kudosStorage';
import { GALLERY_OUTLINE_ROTATING_GRADIENT } from './galleryOutline';

type KudosControlsProps = {
  artwork: TResolvedArtwork;
  className?: string;
  compact?: boolean;
  counterClassName?: string;
  layout?: 'modal' | 'nametag';
  onKudosApplied?: (artId: string, amount: number) => void;
  showButton?: boolean;
  showCounter?: boolean;
};

const KUDOS_STYLE_ID = 'icaf-kudos-styles';
const KUDOS_COUNT_EVENT = 'icaf:kudos-count';
const KUDOS_FAILURE_COOLDOWN_MS = 30_000;

const createControlId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

const ensureKudosStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KUDOS_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = KUDOS_STYLE_ID;
  style.textContent = `
    @keyframes icaf-kudos-roll {
      0% { transform: rotateX(0deg) scale(1); }
      42% { transform: rotateX(170deg) scale(1.2); }
      74% { transform: rotateX(330deg) scale(0.98); }
      100% { transform: rotateX(360deg) scale(1); }
    }
    @keyframes icaf-kudos-pop {
      0% { opacity: 0; transform: translate(-50%, 8px) scale(0.6) rotate(-8deg); }
      25% { opacity: 1; transform: translate(-50%, -8px) scale(1.05) rotate(5deg); }
      100% { opacity: 0; transform: translate(-50%, -34px) scale(0.85) rotate(14deg); }
    }
    @keyframes icaf-kudos-spark {
      0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
      35% { opacity: 1; transform: scale(1.08) rotate(12deg); }
      100% { opacity: 0; transform: scale(1.45) rotate(42deg); }
    }
  `;
  document.head.appendChild(style);
};

const formatCount = (count: number) => count.toLocaleString('en-US');

const formatCompactCount = (count: number) => {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1)}M`;
  }

  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1)}K`;
  }

  return count.toString();
};

const readKudosCount = (response: unknown): number | undefined => {
  if (typeof response !== 'object' || response === null) return undefined;
  if (!('kudos_count' in response)) return undefined;

  const value = response.kudos_count;
  return typeof value === 'number' ? value : undefined;
};

export const KudosControls = ({
  artwork,
  className,
  compact = false,
  counterClassName,
  layout = 'modal',
  onKudosApplied,
  showButton = true,
  showCounter = true,
}: KudosControlsProps) => {
  const artId = artwork.art_id;
  const baseCount = artwork.kudos_count ?? 0;
  const [displayCount, setDisplayCount] = useState(baseCount);
  const [animationKey, setAnimationKey] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [failureCooldownUntil, setFailureCooldownUntil] = useState(0);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);
  const [status, setStatus] = useState(() => getKudosStatus(artId));
  const [tooltipState, setTooltipState] = useState<{
    anchor: DOMRect;
    message: string;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const controlIdRef = useRef(createControlId());

  useEffect(() => {
    ensureKudosStyles();
  }, []);

  useEffect(() => {
    setDisplayCount(baseCount);
  }, [baseCount, artId]);

  useEffect(() => {
    setFailureCooldownUntil(0);
    setCooldownRemainingSeconds(0);
  }, [artId]);

  useEffect(() => {
    if (failureCooldownUntil <= 0) return;

    const updateRemaining = () => {
      const remainingMs = failureCooldownUntil - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setCooldownRemainingSeconds(remainingSeconds);

      if (remainingMs <= 0) {
        setFailureCooldownUntil(0);
      }
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [failureCooldownUntil]);

  useEffect(() => {
    const updateStatus = () => setStatus(getKudosStatus(artId));
    updateStatus();
    window.addEventListener(KUDOS_STORAGE_EVENT, updateStatus);
    window.addEventListener('storage', updateStatus);
    return () => {
      window.removeEventListener(KUDOS_STORAGE_EVENT, updateStatus);
      window.removeEventListener('storage', updateStatus);
    };
  }, [artId]);

  useEffect(() => {
    const handleCountEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { amount?: number; artId?: string; source?: string }
        | undefined;

      if (
        !detail ||
        detail.artId !== artId ||
        detail.source === controlIdRef.current ||
        typeof detail.amount !== 'number'
      ) {
        return;
      }

      setDisplayCount((current) => Math.max(0, current + (detail.amount || 0)));
      setAnimationKey((key) => key + 1);
    };

    window.addEventListener(KUDOS_COUNT_EVENT, handleCountEvent);
    return () =>
      window.removeEventListener(KUDOS_COUNT_EVENT, handleCountEvent);
  }, [artId]);

  const disabledReason = useMemo(() => {
    if (!artId) return 'Kudos are only available for submitted artworks';
    if (failureCooldownUntil > Date.now()) {
      return `Try again in ${cooldownRemainingSeconds || 30}s`;
    }
    if (status.alreadyGiven) return 'Kudos sent today';
    if (status.remaining < KUDOS_AMOUNT) return 'Daily kudos spent';
    return null;
  }, [
    artId,
    cooldownRemainingSeconds,
    failureCooldownUntil,
    status.alreadyGiven,
    status.remaining,
  ]);

  const disabled = Boolean(disabledReason) || isSending;
  const usedDisabled = disabled && Boolean(artId);
  const unavailableDisabled = disabled && !artId;

  const updateCount = (nextCount: number) => {
    setDisplayCount(nextCount);
    setAnimationKey((key) => key + 1);
  };

  const showTooltip = (message: string) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setTooltipState({ anchor: rect, message });
  };

  useEffect(() => {
    if (!tooltipState) return;
    const timer = window.setTimeout(() => setTooltipState(null), 3000);
    return () => window.clearTimeout(timer);
  }, [tooltipState]);

  const handleGiveKudos = async () => {
    if (!artId || disabled) {
      if (artId && status.remaining < KUDOS_AMOUNT) {
        showTooltip('More kudos tomorrow.');
      }
      return;
    }

    const consumeResult = consumeDailyKudos(artId);
    setStatus({
      alreadyGiven: consumeResult.alreadyGiven,
      remaining: consumeResult.remaining,
    });

    if (!consumeResult.ok) {
      if (consumeResult.remaining < KUDOS_AMOUNT) {
        showTooltip('More kudos tomorrow.');
      }
      return;
    }

    setTooltipState(null);
    setIsSending(true);
    updateCount(displayCount + KUDOS_AMOUNT);
    window.dispatchEvent(
      new CustomEvent(KUDOS_COUNT_EVENT, {
        detail: {
          amount: KUDOS_AMOUNT,
          artId,
          source: controlIdRef.current,
        },
      }),
    );
    onKudosApplied?.(artId, KUDOS_AMOUNT);

    try {
      const response: unknown = await giveArtworkKudos(artId);
      const nextKudosCount = readKudosCount(response);
      if (nextKudosCount !== undefined) {
        updateCount(nextKudosCount);
      }
    } catch {
      restoreDailyKudos(artId);
      setStatus(getKudosStatus(artId));
      setFailureCooldownUntil(Date.now() + KUDOS_FAILURE_COOLDOWN_MS);
      showTooltip('Kudos could not be sent. Try again in a moment.');
      updateCount(Math.max(0, displayCount));
      onKudosApplied?.(artId, -KUDOS_AMOUNT);
    } finally {
      setIsSending(false);
    }
  };

  const counter = showCounter ? (
    <div
      className={cn(
        'relative isolate inline-flex min-w-[74px] items-center justify-center overflow-hidden rounded-full border border-white/45 bg-white/90 px-3 py-2 text-sm font-black text-neutral-900 shadow-lg backdrop-blur',
        layout === 'nametag' &&
          'min-w-[70px] border-neutral-200 bg-white text-neutral-800 shadow-sm',
        compact && 'min-w-[62px] px-2.5 py-1.5 text-xs',
        counterClassName,
      )}
      aria-label={`${formatCount(displayCount)} kudos`}
    >
      <span
        key={animationKey}
        className="tabular-nums"
        style={{
          animation:
            animationKey > 0 ? 'icaf-kudos-roll 620ms ease-out both' : '',
          transformOrigin: '50% 55%',
        }}
      >
        {formatCompactCount(displayCount)}
      </span>
      {animationKey > 0 && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-[#FBB22E] px-2 py-0.5 text-[11px] font-black text-neutral-950"
            style={{ animation: 'icaf-kudos-pop 900ms ease-out both' }}
          >
            +{KUDOS_AMOUNT}
          </span>
          <Star
            aria-hidden="true"
            className="pointer-events-none absolute right-1 top-0 h-4 w-4 text-[#FBB22E]"
            style={{ animation: 'icaf-kudos-spark 760ms ease-out both' }}
          />
        </>
      )}
    </div>
  ) : null;

  const buttonCounter = (
    <span
      className={cn(
        'relative flex min-w-0 items-center justify-center self-stretch overflow-hidden border-l border-neutral-200/80 bg-white px-2 font-black text-neutral-900 transition-colors group-hover:bg-white',
        layout === 'nametag' &&
          'border-neutral-200 bg-white text-neutral-800 group-hover:bg-white',
        compact && 'px-1.5 text-[11px]',
        disabled &&
          'border-neutral-200/80 bg-white text-neutral-800 group-hover:bg-white',
        counterClassName,
      )}
      aria-label={`${formatCount(displayCount)} kudos`}
    >
      <span
        key={animationKey}
        className="tabular-nums"
        style={{
          animation:
            animationKey > 0 ? 'icaf-kudos-roll 620ms ease-out both' : '',
          transformOrigin: '50% 55%',
        }}
      >
        {formatCompactCount(displayCount)}
      </span>
      {animationKey > 0 && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-[#FBB22E] px-1.5 py-0.5 text-[10px] font-black text-neutral-950"
            style={{ animation: 'icaf-kudos-pop 900ms ease-out both' }}
          >
            +{KUDOS_AMOUNT}
          </span>
          <Star
            aria-hidden="true"
            className="pointer-events-none absolute right-1 top-1 h-3.5 w-3.5 text-[#FBB22E]"
            style={{ animation: 'icaf-kudos-spark 760ms ease-out both' }}
          />
        </>
      )}
    </span>
  );

  const button = showButton ? (
    <button
      ref={buttonRef}
      type="button"
      aria-disabled={disabled}
      title={disabledReason ?? `${status.remaining} kudos left today`}
      onClick={(e) => {
        e.stopPropagation();
        void handleGiveKudos();
      }}
      className={cn(
        'icaf-kudos-outline-surface group relative isolate inline-flex min-h-11 w-full items-stretch justify-center overflow-hidden rounded-md p-[3px] text-center text-sm font-bold text-black shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]',
        layout === 'nametag' &&
          'border border-neutral-200 bg-white p-0 text-neutral-900 shadow-sm hover:shadow-lg',
        usedDisabled &&
          'cursor-default text-neutral-600 shadow-sm duration-700 hover:translate-y-0 hover:shadow-sm active:scale-100',
        layout === 'nametag' &&
          usedDisabled &&
          'border-neutral-200/60 bg-white/90 shadow-sm hover:shadow-sm',
        unavailableDisabled &&
          'cursor-not-allowed text-neutral-500 shadow-none hover:translate-y-0 hover:shadow-none',
        compact && 'min-h-9 text-xs',
      )}
    >
      {layout !== 'nametag' && (
        <span
          aria-hidden="true"
          className={cn(
            'icaf-kudos-outline-gradient absolute -inset-16 opacity-100 transition-opacity duration-700',
            usedDisabled && 'opacity-35',
            unavailableDisabled && 'opacity-20',
          )}
          style={{ background: GALLERY_OUTLINE_ROTATING_GRADIENT }}
        />
      )}
      <span
        className={cn(
          'font-open-sans relative grid min-h-[calc(2.75rem-6px)] w-full grid-cols-[3fr_1fr] overflow-hidden rounded-[5px] bg-white text-neutral-950 transition-colors duration-700',
          layout === 'nametag' &&
            'min-h-[calc(2.75rem-2px)] rounded-[5px] bg-white text-neutral-900 group-hover:bg-neutral-50',
          compact && 'min-h-[calc(2.25rem-6px)]',
          layout === 'nametag' && compact && 'min-h-[calc(2.25rem-2px)]',
        )}
      >
        <span
          className={cn(
            'flex min-w-0 items-center justify-center gap-1.5 bg-white px-3 py-2 transition-colors duration-300 group-hover:bg-white/90',
            usedDisabled &&
              'bg-neutral-100/80 text-neutral-500 duration-700 group-hover:bg-neutral-100/80',
            unavailableDisabled &&
              'bg-neutral-200/80 text-neutral-500 group-hover:bg-neutral-200/80',
            compact && 'gap-1 px-2 py-1',
          )}
        >
          <Star
            className={cn(
              'h-4 w-4 shrink-0 transition-opacity duration-700',
              usedDisabled && 'opacity-55',
            )}
          />
          <span className="min-w-0 truncate">
            {status.alreadyGiven
              ? 'Kudos sent!'
              : failureCooldownUntil > Date.now()
                ? 'Try again soon'
                : status.remaining < KUDOS_AMOUNT
                  ? 'Out of kudos'
                  : 'Give kudos!'}
          </span>
        </span>
        {buttonCounter}
      </span>
    </button>
  ) : null;

  const tooltip =
    tooltipState && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[10000] max-w-[260px] rounded-md bg-neutral-950 px-3 py-2 text-center text-xs font-semibold text-white shadow-xl"
            style={{
              left: tooltipState.anchor.left + tooltipState.anchor.width / 2,
              top: tooltipState.anchor.bottom + 8,
              transform: 'translateX(-50%)',
            }}
            role="status"
          >
            {tooltipState.message}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={className}>
      {button}
      {!showButton && counter}
      {tooltip}
    </div>
  );
};
