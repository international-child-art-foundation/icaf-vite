import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import type {
  IGalleryContext,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';

export type SlotState = { artworkIdx: number; animKey: number };

const DIM_MS = 2000;
const HIDE_MS = 5000;

function getInitialPausedState() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('paused') === 'true';
}

/**
 * Shared state for both desktop and mobile gallery slideshow variants.
 * Each component adds its own presentation logic on top (auto-advance,
 * keyboard shortcuts, touch gestures, etc.).
 */
function arrangeArtworks(
  artworks: TResolvedArtwork[],
  _preserveOrder: boolean,
  initialArtworkId?: string,
) {
  const arranged = [...artworks];
  if (!initialArtworkId) return arranged;

  const initialIdx = arranged.findIndex(
    (artwork) => artwork.id === initialArtworkId,
  );
  if (initialIdx <= 0) return arranged;
  const [initialArtwork] = arranged.splice(initialIdx, 1);
  arranged.unshift(initialArtwork);
  return arranged;
}

export const useGallerySlideshowState = (
  context?: IGalleryContext,
  closeOverride?: () => void,
) => {
  const [slotA, setSlotA] = useState<SlotState>({ artworkIdx: 0, animKey: 0 });
  const [slotB, setSlotB] = useState<SlotState>({ artworkIdx: 0, animKey: 0 });
  const [topSlot, setTopSlot] = useState<'a' | 'b'>('a');
  const topSlotRef = useRef<'a' | 'b'>('a');
  const advanceCountRef = useRef(0);
  const currentIdxRef = useRef(0);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(getInitialPausedState);
  const [uiState, setUiState] = useState<'full' | 'dim' | 'hidden'>('full');

  const outletContext = useOutletContext<IGalleryContext | null>();
  const {
    artworks: rawArtworks,
    loadArtwork,
    onArtworkKudos,
    preserveOrder = false,
    initialArtworkId,
  } = context ?? outletContext!;
  const [artworks, setArtworks] = useState<TResolvedArtwork[]>(() =>
    arrangeArtworks(rawArtworks, preserveOrder, initialArtworkId),
  );
  const slideshowArtworkIds = useMemo(
    () =>
      arrangeArtworks(rawArtworks, preserveOrder, initialArtworkId).map(
        (artwork) => artwork.id,
      ),
    [initialArtworkId, preserveOrder, rawArtworks],
  );
  const rawArtworksSignatureRef = useRef(
    `${preserveOrder}:${initialArtworkId ?? ''}:${rawArtworks.map((artwork) => artwork.id).join('|')}`,
  );
  const navigate = useNavigate();
  const location = useLocation();

  const dimTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!loadArtwork || slideshowArtworkIds.length === 0) return;
    let cancelled = false;
    const indexes = [
      currentIdx,
      (currentIdx + 1) % slideshowArtworkIds.length,
      (currentIdx - 1 + slideshowArtworkIds.length) %
        slideshowArtworkIds.length,
    ];

    void (async () => {
      for (const index of new Set(indexes)) {
        const artworkId = slideshowArtworkIds[index];
        if (!artworkId) continue;
        try {
          const resolved = await loadArtwork(artworkId);
          if (cancelled || !resolved) continue;
          setArtworks((current) =>
            current.map((artwork) =>
              artwork.id === artworkId ? resolved : artwork,
            ),
          );
        } catch {
          // Keep the asset-backed placeholder and retry if it becomes adjacent
          // again. A metadata failure must not take down the slideshow.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentIdx, loadArtwork, slideshowArtworkIds]);

  const onClose = useCallback(() => {
    if (closeOverride) {
      closeOverride();
      return;
    }

    const galleryParams = new URLSearchParams(location.search);
    galleryParams.delete('id');
    galleryParams.delete('scope');
    galleryParams.delete('group');
    galleryParams.delete('paused');
    const query = galleryParams.toString();
    void navigate(`/gallery${query ? `?${query}` : ''}`);
  }, [closeOverride, location.search, navigate]);

  useEffect(() => {
    const nextSignature = `${preserveOrder}:${initialArtworkId ?? ''}:${rawArtworks
      .map((artwork) => artwork.id)
      .join('|')}`;

    if (rawArtworksSignatureRef.current === nextSignature) {
      const nextById = new Map(rawArtworks.map((artwork) => [artwork.id, artwork]));
      setArtworks((current) =>
        current.map((artwork) => ({
          ...artwork,
          kudos_count:
            nextById.get(artwork.id)?.kudos_count ?? artwork.kudos_count,
        })),
      );
      return;
    }

    rawArtworksSignatureRef.current = nextSignature;
    const nextArtworks = arrangeArtworks(
      rawArtworks,
      preserveOrder,
      initialArtworkId,
    );
    setArtworks(nextArtworks);
    setSlotA({ artworkIdx: 0, animKey: 0 });
    setSlotB({ artworkIdx: 0, animKey: 0 });
    topSlotRef.current = 'a';
    setTopSlot('a');
    advanceCountRef.current = 0;
    currentIdxRef.current = 0;
    setCurrentIdx(0);
  }, [initialArtworkId, preserveOrder, rawArtworks]);

  const advanceTo = useCallback((nextIdx: number) => {
    advanceCountRef.current++;
    const newTop = topSlotRef.current === 'a' ? 'b' : 'a';
    const animKey = advanceCountRef.current;

    if (newTop === 'a') {
      setSlotA({ artworkIdx: nextIdx, animKey });
    } else {
      setSlotB({ artworkIdx: nextIdx, animKey });
    }

    topSlotRef.current = newTop;
    setTopSlot(newTop);
    setCurrentIdx(nextIdx);
    currentIdxRef.current = nextIdx;
  }, []);

  const advance = useCallback(
    (dir: 1 | -1 = 1) => {
      if (artworks.length <= 1) return;

      // A spotlight/share link pauses only the artwork it opened on. Once the
      // visitor navigates in either direction, resume the slideshow and make
      // the live URL reflect that it is no longer pinned to the initial art.
      setIsPaused(false);
      const url = new URL(window.location.href);
      if (url.searchParams.has('paused')) {
        url.searchParams.delete('paused');
        window.history.replaceState(window.history.state, '', url);
      }

      const nextIdx =
        (currentIdxRef.current + dir + artworks.length) % artworks.length;
      advanceTo(nextIdx);
    },
    [artworks.length, advanceTo],
  );

  const applyArtworkKudos = useCallback(
    (artId: string, amount: number) => {
      setArtworks((current) =>
        current.map((artwork) =>
          artwork.art_id === artId
            ? {
                ...artwork,
                kudos_count: Math.max(
                  0,
                  (artwork.kudos_count ?? 0) + amount,
                ),
              }
            : artwork,
        ),
      );
      onArtworkKudos?.(artId, amount);
    },
    [onArtworkKudos],
  );

  const resetUiTimer = useCallback(() => {
    setUiState('full');
    if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    dimTimerRef.current = setTimeout(() => setUiState('dim'), DIM_MS);
    hideTimerRef.current = setTimeout(() => setUiState('hidden'), HIDE_MS);
  }, []);

  useEffect(() => {
    resetUiTimer();
    return () => {
      if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetUiTimer]);

  // Lock body scroll while slideshow is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentArtwork = artworks[currentIdx] ?? null;
  const artworkShareUrl = (() => {
    if (!currentArtwork) return '';
    const url = new URL(window.location.href);
    url.pathname = '/gallery/slideshow';
    url.searchParams.set('id', currentArtwork.id);
    url.searchParams.set('paused', 'true');
    return url.toString();
  })();

  useEffect(() => {
    if (!currentArtwork || location.pathname !== '/gallery/slideshow') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('id') === currentArtwork.id) return;
    url.searchParams.set('id', currentArtwork.id);
    window.history.replaceState(window.history.state, '', url);
  }, [currentArtwork, location.pathname]);

  return {
    artworks,
    currentIdx,
    currentArtwork,
    slotA,
    slotB,
    topSlot,
    topSlotRef,
    advanceCountRef,
    advance,
    advanceTo,
    currentIdxRef,
    isPaused,
    setIsPaused,
    uiState,
    setUiState,
    resetUiTimer,
    applyArtworkKudos,
    artworkShareUrl,
    onClose,
  };
};
