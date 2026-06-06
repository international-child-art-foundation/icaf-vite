import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Maximize2,
  RotateCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ArtworkDraft } from '@/modules/submissions/types/artworkGroupSubmission';
import { cn } from '@/utils/utils';

export type ArtworkWithPreview = ArtworkDraft & {
  fileName?: string;
  previewDataUrl?: string;
};

export type ArtworkMuralWindowProps = {
  artworks: ArtworkWithPreview[];
  artworkDetailsMode?: 'basic' | 'full';
  errors?: Record<string, Partial<Record<keyof ArtworkDraft | 'file', string>>>;
  focusedArtworkId?: string | null;
  isOpen: boolean;
  maxCount: number;
  onArtworkChange: <Name extends keyof ArtworkDraft>(
    artworkId: string,
    name: Name,
    value: ArtworkDraft[Name],
  ) => void;
  onClose: () => void;
  onDeleteArtwork: (artworkId: string) => void;
  onFilesSelected: (files: File[]) => void;
  onOpen: () => void;
  onRotateArtwork: (artworkId: string) => void;
};

type SeamlessInputProps = {
  error?: string;
  inputMode?: 'numeric';
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

function SeamlessInput({
  error,
  inputMode,
  label,
  maxLength,
  onChange,
  placeholder,
  value,
}: SeamlessInputProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        className={cn(
          'focus:border-secondary-blue/50 focus:ring-secondary-blue/15 h-10 w-full rounded-md border border-white/40 bg-white/55 px-3 text-sm text-slate-950 shadow-inner outline-none backdrop-blur transition placeholder:text-slate-500 focus:bg-white/90 focus:ring-2',
          error && 'border-tertiary-red/60 bg-red-50/80',
        )}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span className="text-tertiary-red mt-1 block text-xs font-semibold">
          {error}
        </span>
      )}
    </label>
  );
}

function SeamlessTextarea({
  error,
  label,
  maxLength,
  onChange,
  placeholder,
  value,
}: SeamlessInputProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea
        className={cn(
          'focus:border-secondary-blue/50 focus:ring-secondary-blue/15 min-h-20 w-full resize-none rounded-md border border-white/40 bg-white/55 px-3 py-2 text-sm leading-5 text-slate-950 shadow-inner outline-none backdrop-blur transition placeholder:text-slate-500 focus:bg-white/90 focus:ring-2',
          error && 'border-tertiary-red/60 bg-red-50/80',
        )}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span className="text-tertiary-red mt-1 block text-xs font-semibold">
          {error}
        </span>
      )}
    </label>
  );
}

function ArtworkMural({
  artworks,
  className,
  selectedIndex,
  touchStart,
  variant,
  onOpen,
  onRotateArtwork,
  onSelectArtwork,
  onSwipe,
  onTouchStart,
  onUnselect,
}: {
  artworks: ArtworkWithPreview[];
  className?: string;
  selectedIndex?: number | null;
  touchStart?: { x: number; y: number } | null;
  variant: 'compact' | 'workspace';
  onOpen?: () => void;
  onRotateArtwork?: (artworkId: string) => void;
  onSelectArtwork?: (index: number) => void;
  onSwipe?: (direction: 1 | -1) => void;
  onTouchStart?: (touch: { x: number; y: number } | null) => void;
  onUnselect?: () => void;
}) {
  const visibleArtworks = artworks
    .map((artwork, index) => ({ artwork, index }))
    .filter(({ artwork }) => artwork.previewDataUrl);
  const hasSelectedArtwork =
    selectedIndex !== null && selectedIndex !== undefined;
  const canUnselect = Boolean(onUnselect);
  const selectedArtwork =
    selectedIndex !== null && selectedIndex !== undefined
      ? artworks[selectedIndex]
      : undefined;
  const selectVerb = variant === 'compact' ? 'Tap' : 'Click';
  const fitColumns =
    visibleArtworks.length <= 1
      ? 1
      : visibleArtworks.length <= 4
        ? 2
        : visibleArtworks.length <= 9
          ? 3
          : visibleArtworks.length <= 16
            ? 4
            : visibleArtworks.length <= 25
              ? 5
              : visibleArtworks.length <= 36
                ? 6
                : 8;
  const fitRows = Math.max(1, Math.ceil(visibleArtworks.length / fitColumns));
  const fitArtworkStyle = {
    flexBasis: `calc(${100 / fitColumns}% - 0.5rem)`,
    maxHeight: `calc(${100 / fitRows}% - 0.5rem)`,
  };

  function getArtworkMeta(artwork: ArtworkWithPreview) {
    return (
      artwork.title || artwork.f_name || artwork.description || artwork.age
    );
  }

  return (
    <div
      className={cn(
        'relative min-w-0 overflow-hidden rounded-lg bg-slate-50',
        variant === 'compact' &&
          'aspect-square border border-slate-200 shadow-sm',
        variant === 'workspace' && 'min-h-[260px] flex-1 touch-pan-y',
        className,
      )}
      onTouchEnd={(event) => {
        if (variant !== 'workspace' || !touchStart) return;
        const touch = event.changedTouches[0];
        const deltaX = (touch?.clientX ?? touchStart.x) - touchStart.x;
        const deltaY = (touch?.clientY ?? touchStart.y) - touchStart.y;
        if (
          Math.abs(deltaX) > 60 &&
          Math.abs(deltaX) > Math.abs(deltaY) * 1.5
        ) {
          onSwipe?.(deltaX < 0 ? 1 : -1);
        }
        onTouchStart?.(null);
      }}
      onTouchStart={(event) => {
        const touch = event.changedTouches[0];
        onTouchStart?.(touch ? { x: touch.clientX, y: touch.clientY } : null);
      }}
      onClick={() => {
        if (variant === 'workspace' && hasSelectedArtwork && canUnselect) {
          onUnselect?.();
          return;
        }

        if (variant === 'workspace' && hasSelectedArtwork) return;

        onOpen?.();
      }}
    >
      {visibleArtworks.length === 0 ? (
        <button
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.();
          }}
        >
          <span className="text-secondary-blue flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <ImagePlus aria-hidden="true" className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            Upload artwork
          </span>
          <span className="text-xs leading-5 text-slate-500">
            {selectVerb} to choose images.
          </span>
        </button>
      ) : (
        <div
          className={cn(
            'h-full w-full p-2',
            hasSelectedArtwork
              ? 'relative'
              : 'flex flex-wrap content-center items-center justify-center gap-2 overflow-hidden',
          )}
        >
          {visibleArtworks.map(({ artwork, index }, visibleIndex) => {
            const isSelected = selectedIndex === index;
            const artworkMeta = getArtworkMeta(artwork);

            return (
              <button
                key={artwork.id}
                className={cn(
                  'relative min-h-0 min-w-0 overflow-hidden rounded-md transition',
                  !hasSelectedArtwork &&
                    'flex items-center justify-center hover:opacity-90',
                  hasSelectedArtwork && !isSelected && 'hidden',
                  isSelected &&
                    'ring-secondary-blue absolute inset-3 z-10 m-0 flex items-center justify-center rounded-lg ring-4',
                )}
                style={!hasSelectedArtwork ? fitArtworkStyle : undefined}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (variant === 'workspace') {
                    onSelectArtwork?.(index);
                    return;
                  }

                  onSelectArtwork?.(index);
                  onOpen?.();
                }}
              >
                <img
                  alt={artwork.title || `Artwork ${visibleIndex + 1}`}
                  className={cn(
                    'block max-h-full max-w-full',
                    isSelected ? 'h-full object-contain' : 'h-auto w-auto',
                  )}
                  draggable={false}
                  src={artwork.previewDataUrl}
                />
                {artworkMeta && selectedIndex == null && (
                  <span className="absolute bottom-0 truncate rounded-t-lg bg-slate-50/95 px-2 py-1 text-left text-[12px] font-semibold text-slate-700 shadow-sm">
                    {artworkMeta}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {variant === 'workspace' && hasSelectedArtwork && canUnselect && (
        <button
          className="absolute left-4 top-4 z-20 hidden h-10 items-center gap-1.5 rounded-full bg-slate-100/90 px-3 text-xs font-bold text-slate-700 shadow-md transition-colors duration-300 hover:bg-white md:inline-flex"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUnselect?.();
          }}
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Grid view
        </button>
      )}
      {variant === 'workspace' && selectedArtwork?.previewDataUrl && (
        <div
          className="absolute bottom-4 right-4 z-20 flex cursor-pointer flex-row items-center justify-center gap-4 rounded-full bg-slate-100/90 p-4 text-slate-700 shadow-md transition-colors duration-300 hover:bg-white"
          onClick={(event) => {
            event.stopPropagation();
            onRotateArtwork?.(selectedArtwork.id);
          }}
        >
          <p className="shadow- select-none text-xs font-bold text-slate-700">
            Rotate Artwork
          </p>
          <button
            className="h-4 w-4"
            aria-label="Rotate artwork 90 degrees"
            type="button"
          >
            <RotateCw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}
      {visibleArtworks.length > 0 && variant === 'compact' && (
        <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm">
          <Maximize2 aria-hidden="true" className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

function ArtworkDetailsPane({
  activeArtwork,
  activeErrors,
  artworkDetailsMode,
  artworkCount,
  hasSelectedArtwork,
  onArtworkChange,
  onNext,
  onPrevious,
}: {
  activeArtwork: ArtworkWithPreview | undefined;
  activeErrors?: Partial<Record<keyof ArtworkDraft | 'file', string>>;
  artworkDetailsMode: 'basic' | 'full';
  artworkCount: number;
  hasSelectedArtwork: boolean;
  onArtworkChange: <Name extends keyof ArtworkDraft>(
    artworkId: string,
    name: Name,
    value: ArtworkDraft[Name],
  ) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const canEdit = Boolean(activeArtwork && hasSelectedArtwork);

  return (
    <div className="relative space-y-3 rounded-lg bg-white/55 p-3 shadow-inner backdrop-blur">
      {!canEdit && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-slate-50/90 px-4 text-center backdrop-blur-[2px]">
          <p className="text-sm font-bold text-slate-600">
            Select an artwork to add details
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Previous artwork"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm disabled:opacity-40"
          disabled={!canEdit || artworkCount < 2}
          type="button"
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <div className="min-w-0 text-center">
          <p className="select-none text-xs font-bold uppercase tracking-widest text-slate-500">
            Artwork details
          </p>
          {hasSelectedArtwork && activeArtwork?.fileName && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {activeArtwork.fileName}
            </p>
          )}
        </div>
        <button
          aria-label="Next artwork"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm disabled:opacity-40"
          disabled={!canEdit || artworkCount < 2}
          type="button"
          onClick={onNext}
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {activeErrors?.file && (
        <p className="text-tertiary-red text-xs font-semibold">
          {activeErrors.file}
        </p>
      )}

      <div
        className={cn(
          'grid gap-2',
          artworkDetailsMode === 'full' && 'sm:grid-cols-[1fr_1fr_88px]',
        )}
      >
        <SeamlessInput
          error={activeErrors?.title}
          label="Artwork title"
          maxLength={200}
          placeholder="Artwork title"
          value={activeArtwork?.title ?? ''}
          onChange={(value) =>
            activeArtwork && onArtworkChange(activeArtwork.id, 'title', value)
          }
        />
        {artworkDetailsMode === 'full' && (
          <>
            <SeamlessInput
              error={activeErrors?.f_name}
              label="Artist first name"
              maxLength={200}
              placeholder="Artist first name"
              value={activeArtwork?.f_name ?? ''}
              onChange={(value) =>
                activeArtwork &&
                onArtworkChange(activeArtwork.id, 'f_name', value)
              }
            />
            <SeamlessInput
              error={activeErrors?.age}
              inputMode="numeric"
              label="Artist age"
              placeholder="Age"
              value={activeArtwork?.age ?? ''}
              onChange={(value) =>
                activeArtwork && onArtworkChange(activeArtwork.id, 'age', value)
              }
            />
          </>
        )}
      </div>

      <SeamlessTextarea
        error={activeErrors?.description}
        label="Description"
        maxLength={2000}
        placeholder="Description"
        value={activeArtwork?.description ?? ''}
        onChange={(value) =>
          activeArtwork &&
          onArtworkChange(activeArtwork.id, 'description', value)
        }
      />
    </div>
  );
}

export function ArtworkMuralWindow({
  artworks,
  artworkDetailsMode = 'full',
  errors,
  focusedArtworkId,
  isOpen,
  maxCount,
  onArtworkChange,
  onClose,
  onDeleteArtwork,
  onFilesSelected,
  onOpen,
  onRotateArtwork,
}: ArtworkMuralWindowProps) {
  const isSingleArtwork = maxCount === 1;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() =>
    isSingleArtwork ? 0 : null,
  );
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const uploadedArtworkIndexes = artworks
    .map((artwork, index) => (artwork.previewDataUrl ? index : -1))
    .filter((index) => index >= 0);
  const uploadedArtworkCount = uploadedArtworkIndexes.length;
  const activeArtwork =
    selectedIndex === null ? undefined : artworks[selectedIndex];
  const activeErrors =
    activeArtwork && errors ? errors[activeArtwork.id] : undefined;
  const hasImages = uploadedArtworkCount > 0;
  const hasSelectedArtwork = selectedIndex !== null;

  useEffect(() => {
    if (!focusedArtworkId) return;

    const nextIndex = artworks.findIndex(
      (artwork) => artwork.id === focusedArtworkId,
    );
    if (nextIndex >= 0) setSelectedIndex(nextIndex);
  }, [artworks, focusedArtworkId]);

  useEffect(() => {
    if (isSingleArtwork) {
      setSelectedIndex(artworks[0] ? 0 : null);
      return;
    }

    setSelectedIndex((current) =>
      current === null || !artworks[current]?.previewDataUrl ? null : current,
    );
  }, [artworks, isSingleArtwork]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        step(-1);
      } else if (event.key === 'ArrowRight') {
        step(1);
      } else if (event.key === 'Escape') {
        if (isSingleArtwork) return;
        setSelectedIndex(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function chooseFiles() {
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    );
    if (imageFiles.length > 0) onFilesSelected(imageFiles);
  }

  function step(direction: 1 | -1) {
    if (selectedIndex === null || uploadedArtworkIndexes.length < 2) return;

    const currentPosition = Math.max(
      0,
      uploadedArtworkIndexes.indexOf(selectedIndex),
    );
    const nextPosition =
      (currentPosition + direction + uploadedArtworkIndexes.length) %
      uploadedArtworkIndexes.length;
    const nextIndex = uploadedArtworkIndexes[nextPosition] ?? selectedIndex;
    setSelectedIndex(nextIndex);
  }

  const artworkSurface = (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-100/80 p-3 shadow-sm">
      <div className="hidden items-center justify-between gap-3 md:flex">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {isSingleArtwork ? 'Artwork' : 'Artworks'}
          </p>
          <p className="text-xs leading-5 text-slate-500">
            {uploadedArtworkCount}/{maxCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasSelectedArtwork && activeArtwork?.previewDataUrl && (
            <button
              className="text-tertiary-red inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-sm font-bold shadow-sm"
              type="button"
              onClick={() => {
                onDeleteArtwork(activeArtwork.id);
                setSelectedIndex(isSingleArtwork ? 0 : null);
              }}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Delete
            </button>
          )}
          {hasImages && (!isSingleArtwork || !hasSelectedArtwork) && (
            <button
              className="text-tertiary-red inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-sm font-bold shadow-sm"
              type="button"
              onClick={() => setIsDeleteAllOpen(true)}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              {isSingleArtwork ? 'Delete' : 'Delete all'}
            </button>
          )}
          <button
            className="text-secondary-blue inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-sm font-bold shadow-sm disabled:opacity-40"
            disabled={uploadedArtworkCount >= maxCount}
            type="button"
            onClick={chooseFiles}
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      <ArtworkMural
        artworks={artworks}
        selectedIndex={selectedIndex}
        touchStart={touchStart}
        variant="workspace"
        onOpen={chooseFiles}
        onRotateArtwork={onRotateArtwork}
        onSelectArtwork={(index) => {
          setSelectedIndex(index);
        }}
        onSwipe={(direction) => step(direction)}
        onTouchStart={setTouchStart}
        onUnselect={
          isSingleArtwork ? undefined : () => setSelectedIndex(null)
        }
      />

      <ArtworkDetailsPane
        activeArtwork={activeArtwork}
        activeErrors={activeErrors}
        artworkDetailsMode={artworkDetailsMode}
        artworkCount={uploadedArtworkCount}
        hasSelectedArtwork={hasSelectedArtwork}
        onArtworkChange={onArtworkChange}
        onNext={() => step(1)}
        onPrevious={() => step(-1)}
      />
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <ArtworkMural
          artworks={artworks}
          variant="compact"
          onSelectArtwork={(index) => setSelectedIndex(index)}
          onOpen={() => {
            onOpen();
            if (!hasImages) window.setTimeout(chooseFiles, 0);
          }}
        />
      </div>

      <div className="hidden h-[clamp(520px,65vh,720px)] md:block">
        {artworkSurface}
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
        multiple={!isSingleArtwork}
        type="file"
        onChange={(event) => {
          handleFiles(event.target.files ?? []);
          event.target.value = '';
        }}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[120] w-screen overflow-x-hidden bg-white md:hidden">
          <section className="relative flex h-full w-full min-w-0 flex-col overflow-hidden">
            <div className="pointer-events-none absolute left-0 right-0 top-2 z-10 flex h-12 items-center justify-center px-4">
              {hasSelectedArtwork && activeArtwork?.previewDataUrl && (
                <button
                  className="bg-tertiary-red pointer-events-auto inline-flex h-10 items-center rounded-full px-4 text-sm font-bold text-white shadow-sm"
                  type="button"
                  onClick={() => {
                    onDeleteArtwork(activeArtwork.id);
                    setSelectedIndex(isSingleArtwork ? 0 : null);
                  }}
                >
                  Delete selected artwork
                </button>
              )}
              {!hasSelectedArtwork &&
                artworks.some((artwork) => artwork.previewDataUrl) && (
                  <button
                    className="bg-tertiary-red pointer-events-auto inline-flex h-10 items-center rounded-full px-4 text-sm font-bold text-white shadow-sm"
                    type="button"
                    onClick={() => setIsDeleteAllOpen(true)}
                  >
                    {isSingleArtwork ? 'Delete artwork' : 'Delete all artworks'}
                  </button>
                )}
              <button
                aria-label="Close artwork window"
                className="pointer-events-auto absolute right-4 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                type="button"
                onClick={onClose}
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {isDeleteAllOpen && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/45 px-4">
                <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                  <p className="text-base font-semibold text-slate-950">
                    {isSingleArtwork
                      ? 'Really delete your artwork on this page?'
                      : 'Really delete all of your artworks on this page?'}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      className="h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700"
                      type="button"
                      onClick={() => setIsDeleteAllOpen(false)}
                    >
                      Go back
                    </button>
                    <button
                      className="bg-tertiary-red h-11 rounded-full px-4 text-sm font-bold text-white"
                      type="button"
                      onClick={() => {
                        artworks.forEach((artwork) => {
                          onDeleteArtwork(artwork.id);
                        });
                        setSelectedIndex(null);
                        setIsDeleteAllOpen(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="min-h-0 min-w-0 flex-1 p-2 pb-20 pt-[60px]">
              {artworkSurface}
            </div>
            <div className="absolute bottom-0 left-0 right-0 grid min-w-0 grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_18px_rgba(15,23,42,0.08)]">
              <button
                className="bg-secondary-blue h-12 min-w-0 rounded-full px-3 text-sm font-bold leading-tight text-white shadow-sm disabled:opacity-40"
                disabled={uploadedArtworkCount >= maxCount}
                type="button"
                onClick={chooseFiles}
              >
                {isSingleArtwork ? 'Upload artwork' : 'Upload more artworks'}
              </button>
              <button
                className="bg-secondary-green h-12 min-w-0 rounded-full px-3 text-sm font-bold leading-tight text-white shadow-sm"
                type="button"
                onClick={onClose}
              >
                Save and continue
              </button>
            </div>
          </section>
        </div>
      )}
      {isDeleteAllOpen && !isOpen && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <p className="text-base font-semibold text-slate-950">
              {isSingleArtwork
                ? 'Really delete your artwork on this page?'
                : 'Really delete all of your artworks on this page?'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700"
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
              >
                Go back
              </button>
              <button
                className="bg-tertiary-red h-11 rounded-full px-4 text-sm font-bold text-white"
                type="button"
                onClick={() => {
                  artworks.forEach((artwork) => {
                    onDeleteArtwork(artwork.id);
                  });
                  setSelectedIndex(null);
                  setIsDeleteAllOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
