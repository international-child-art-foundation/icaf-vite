import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Maximize2,
  Upload,
  X,
} from 'lucide-react';
import type { ArtworkDraft } from '@/modules/submissions/types/artworkGroupSubmission';
import { cn } from '@/utils/utils';

type ArtworkWithPreview = ArtworkDraft & {
  fileName?: string;
  previewDataUrl?: string;
};

type ArtworkMuralWindowProps = {
  artworks: ArtworkWithPreview[];
  errors?: Record<string, Partial<Record<keyof ArtworkDraft | 'file', string>>>;
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
  variant,
  onOpen,
  onSelectArtwork,
  onUnselect,
}: {
  artworks: ArtworkWithPreview[];
  className?: string;
  selectedIndex?: number | null;
  variant: 'compact' | 'workspace';
  onOpen?: () => void;
  onSelectArtwork?: (index: number) => void;
  onUnselect?: () => void;
}) {
  const visibleArtworks = artworks.filter((artwork) => artwork.previewDataUrl);
  const hasSelectedArtwork =
    selectedIndex !== null && selectedIndex !== undefined;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-slate-50',
        variant === 'compact' &&
          'aspect-square border border-slate-200 shadow-sm',
        variant === 'workspace' && 'min-h-[260px] flex-1',
        className,
      )}
      onClick={() => {
        if (variant === 'workspace' && hasSelectedArtwork) {
          onUnselect?.();
          return;
        }

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
            Tap to choose images.
          </span>
        </button>
      ) : (
        <div
          className={cn(
            'grid h-full w-full gap-2 p-2',
            visibleArtworks.length <= 2 && 'grid-cols-1',
            visibleArtworks.length > 2 &&
              visibleArtworks.length <= 6 &&
              'grid-cols-2',
            visibleArtworks.length > 6 && 'grid-cols-3',
            variant === 'workspace' && 'auto-rows-fr',
          )}
        >
          {visibleArtworks.map((artwork, index) => {
            const isSelected = selectedIndex === index;

            return (
              <button
                key={artwork.id}
                className={cn(
                  'relative min-h-0 overflow-hidden rounded-md bg-white shadow-sm transition',
                  hasSelectedArtwork && !isSelected && 'opacity-20',
                  isSelected &&
                    'ring-secondary-blue absolute inset-3 z-10 rounded-lg ring-4',
                )}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (variant === 'workspace') {
                    onSelectArtwork?.(index);
                    return;
                  }

                  onOpen?.();
                }}
              >
                <img
                  alt={artwork.title || `Artwork ${index + 1}`}
                  className={cn(
                    'h-full w-full object-contain',
                    isSelected && 'bg-white p-1',
                  )}
                  draggable={false}
                  src={artwork.previewDataUrl}
                />
              </button>
            );
          })}
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
  artworkCount,
  hasSelectedArtwork,
  onArtworkChange,
  onNext,
  onPrevious,
}: {
  activeArtwork: ArtworkWithPreview | undefined;
  activeErrors?: Partial<Record<keyof ArtworkDraft | 'file', string>>;
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
  if (!activeArtwork) return null;

  return (
    <div className="space-y-3 rounded-lg bg-white/55 p-3 shadow-inner backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Previous artwork"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm disabled:opacity-40"
          disabled={artworkCount < 2}
          type="button"
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {hasSelectedArtwork
              ? 'Selected artwork'
              : 'Click an artwork to select it'}
          </p>
          {hasSelectedArtwork && activeArtwork.fileName && (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {activeArtwork.fileName}
            </p>
          )}
        </div>
        <button
          aria-label="Next artwork"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm disabled:opacity-40"
          disabled={artworkCount < 2}
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

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_88px]">
        <SeamlessInput
          error={activeErrors?.title}
          label="Artwork title"
          maxLength={200}
          placeholder="Artwork title"
          value={activeArtwork.title}
          onChange={(value) =>
            onArtworkChange(activeArtwork.id, 'title', value)
          }
        />
        <SeamlessInput
          error={activeErrors?.f_name}
          label="Artist first name"
          maxLength={200}
          placeholder="Artist first name"
          value={activeArtwork.f_name}
          onChange={(value) =>
            onArtworkChange(activeArtwork.id, 'f_name', value)
          }
        />
        <SeamlessInput
          error={activeErrors?.age}
          inputMode="numeric"
          label="Artist age"
          placeholder="Age"
          value={activeArtwork.age}
          onChange={(value) => onArtworkChange(activeArtwork.id, 'age', value)}
        />
      </div>

      <SeamlessTextarea
        error={activeErrors?.description}
        label="Description"
        maxLength={2000}
        placeholder="Description"
        value={activeArtwork.description}
        onChange={(value) =>
          onArtworkChange(activeArtwork.id, 'description', value)
        }
      />
    </div>
  );
}

export function ArtworkMuralWindow({
  artworks,
  errors,
  isOpen,
  maxCount,
  onArtworkChange,
  onClose,
  onDeleteArtwork,
  onFilesSelected,
  onOpen,
}: ArtworkMuralWindowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const activeArtwork = artworks[Math.min(activeIndex, artworks.length - 1)];
  const activeErrors =
    activeArtwork && errors ? errors[activeArtwork.id] : undefined;
  const hasImages = artworks.some((artwork) => artwork.previewDataUrl);
  const hasSelectedArtwork = selectedIndex !== null;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, artworks.length - 1));
    setSelectedIndex((current) =>
      current === null ? null : Math.min(current, artworks.length - 1),
    );
  }, [artworks.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        step(-1);
      } else if (event.key === 'ArrowRight') {
        step(1);
      } else if (event.key === 'Escape') {
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
    if (artworks.length < 2) return;
    setActiveIndex((current) => {
      const next = (current + direction + artworks.length) % artworks.length;
      setSelectedIndex((selected) => (selected === null ? selected : next));
      return next;
    });
  }

  const artworkSurface = (
    <div
      className="flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-slate-100/80 p-3 shadow-sm"
      onTouchStart={(event) =>
        setTouchStart(event.changedTouches[0]?.clientX ?? null)
      }
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const end = event.changedTouches[0]?.clientX ?? touchStart;
        const delta = end - touchStart;
        if (Math.abs(delta) > 45) step(delta < 0 ? 1 : -1);
        setTouchStart(null);
      }}
    >
      <div className="hidden items-center justify-between gap-3 md:flex">
        <div>
          <p className="text-sm font-semibold text-slate-950">Artworks</p>
          <p className="text-xs leading-5 text-slate-500">
            {artworks.length}/{maxCount}
          </p>
        </div>
        <button
          className="text-secondary-blue inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2 text-sm font-bold shadow-sm"
          disabled={artworks.length >= maxCount}
          type="button"
          onClick={chooseFiles}
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          Upload
        </button>
      </div>

      <ArtworkMural
        artworks={artworks}
        selectedIndex={selectedIndex}
        variant="workspace"
        onSelectArtwork={(index) => {
          setActiveIndex(index);
          setSelectedIndex(index);
        }}
        onUnselect={() => setSelectedIndex(null)}
      />

      <ArtworkDetailsPane
        activeArtwork={activeArtwork}
        activeErrors={activeErrors}
        artworkCount={artworks.length}
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
          onOpen={() => {
            onOpen();
            if (!hasImages) window.setTimeout(chooseFiles, 0);
          }}
        />
      </div>

      <div className="hidden md:block">{artworkSurface}</div>

      <input
        ref={inputRef}
        className="sr-only"
        accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
        multiple
        type="file"
        onChange={(event) => {
          handleFiles(event.target.files ?? []);
          event.target.value = '';
        }}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[120] bg-white md:hidden">
          <section className="relative flex h-full w-full flex-col overflow-hidden">
            <div className="pointer-events-none absolute left-0 right-0 top-2 z-10 flex h-12 items-center justify-center px-4">
              {hasSelectedArtwork && activeArtwork && (
                <button
                  className="bg-tertiary-red pointer-events-auto inline-flex h-10 items-center rounded-full px-4 text-sm font-bold text-white shadow-sm"
                  type="button"
                  onClick={() => {
                    onDeleteArtwork(activeArtwork.id);
                    setSelectedIndex(null);
                    setActiveIndex((current) =>
                      Math.max(0, Math.min(current, artworks.length - 2)),
                    );
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
                    Delete all artworks
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
                    Really delete all of your artworks on this page?
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
                        setActiveIndex(0);
                        setIsDeleteAllOpen(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 p-2 pb-20 pt-[60px]">
              {artworkSurface}
            </div>
            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_18px_rgba(15,23,42,0.08)]">
              <button
                className="bg-secondary-blue h-12 rounded-full px-3 text-sm font-bold text-white shadow-sm"
                disabled={artworks.length >= maxCount}
                type="button"
                onClick={chooseFiles}
              >
                Upload more artworks
              </button>
              <button
                className="bg-secondary-green h-12 rounded-full px-3 text-sm font-bold text-white shadow-sm"
                type="button"
                onClick={onClose}
              >
                Save and continue
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
