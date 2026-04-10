import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { IGalleryContext } from '@/types/Gallery';

export type SlotState = { artworkIdx: number; animKey: number };

const DIM_MS = 2000;
const HIDE_MS = 5000;

/**
 * Shared state for both desktop and mobile gallery slideshow variants.
 * Each component adds its own presentation logic on top (auto-advance,
 * keyboard shortcuts, touch gestures, etc.).
 */
export const useGallerySlideshowState = () => {
  const [slotA, setSlotA] = useState<SlotState>({ artworkIdx: 0, animKey: 0 });
  const [slotB, setSlotB] = useState<SlotState>({ artworkIdx: 0, animKey: 0 });
  const [topSlot, setTopSlot] = useState<'a' | 'b'>('a');
  const topSlotRef = useRef<'a' | 'b'>('a');
  const advanceCountRef = useRef(0);
  const currentIdxRef = useRef(0);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [uiState, setUiState] = useState<'full' | 'dim' | 'hidden'>('full');

  const { artworks: rawArtworks } = useOutletContext<IGalleryContext>();
  const [artworks] = useState(() =>
    [...rawArtworks].sort(() => Math.random() - 0.5),
  );
  const navigate = useNavigate();

  const dimTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const onClose = useCallback(() => void navigate('/gallery'), [navigate]);

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
      const nextIdx =
        (currentIdxRef.current + dir + artworks.length) % artworks.length;
      advanceTo(nextIdx);
    },
    [artworks.length, advanceTo],
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
  const artworkShareUrl = currentArtwork
    ? `${window.location.protocol}//${window.location.host}/gallery?id=${currentArtwork.id}`
    : '';

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
    artworkShareUrl,
    onClose,
  };
};
