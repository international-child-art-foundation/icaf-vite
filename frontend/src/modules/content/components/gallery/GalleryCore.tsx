import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle, Play } from 'lucide-react';
import { useWindowSize } from 'usehooks-ts';
import type {
  GalleryQueryParams,
  SortOrder,
  ThemeColors,
  ThemeListItem,
} from '@icaf/shared';
import {
  listGalleryArtworks,
  listGalleryArtworksByFamily,
  listGalleryThemes,
} from '@/api/public';
import type {
  IGalleryContext,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';
import type { SortValue } from '@/modules/content/data/gallery/sortData';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import ArtworkCard from './ArtworkCard';
import ArtworkModal from './ArtworkModal';
import { FilterProvider, useFilters } from './FilterContext';
import Pagination from './Pagination';

const ARTWORKS_PER_PAGE = 20;
const API_PAGE_LIMIT = 100;

function toSortOrder(sortValue: string): SortOrder {
  return sortValue === 'Oldest Event' ? 'oldest' : 'newest';
}

async function fetchAllGalleryArtworks(
  themeFamily: string | null,
  sort: SortOrder,
): Promise<TResolvedArtwork[]> {
  const artworks: TResolvedArtwork[] = [];
  let lastKey: string | undefined;

  do {
    const query: GalleryQueryParams = {
      sort,
      limit: API_PAGE_LIMIT,
      ...(lastKey ? { last_key: lastKey } : {}),
    };
    const response = themeFamily
      ? await listGalleryArtworksByFamily(themeFamily, query)
      : await listGalleryArtworks(query);

    artworks.push(...response.artworks.map(resolveApiArtwork));
    lastKey = response.last_key;
  } while (lastKey);

  return artworks;
}

function themeCardBackground(theme: ThemeListItem): string {
  const color = theme.colors?.primary ?? theme.colors?.background ?? '#0286C3';
  const secondary = theme.colors?.secondary ?? '#202020';
  const imageUrl = theme.card_image_url ?? theme.image_url;
  const image = imageUrl ? `url("${imageUrl}")` : '';
  return image
    ? `linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.42)), ${image}`
    : `linear-gradient(135deg, ${color}, ${secondary})`;
}

function themeTextColor(colors: ThemeColors | undefined): string {
  return colors?.text ?? '#ffffff';
}

function ThemeCard({
  active,
  onSelect,
  theme,
}: {
  active: boolean;
  onSelect: () => void;
  theme: ThemeListItem;
}) {
  const accent = theme.colors?.accent ?? theme.colors?.secondary ?? '#ffffff';
  const textColor = themeTextColor(theme.colors);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative h-[150px] w-[280px] flex-none overflow-hidden rounded-lg p-5 text-left shadow-md transition duration-200 sm:w-[320px] ${
        active
          ? 'scale-[1.02] ring-4 ring-black/20'
          : 'hover:-translate-y-0.5 hover:shadow-lg'
      }`}
      style={{
        backgroundImage: themeCardBackground(theme),
        backgroundColor: theme.colors?.primary ?? theme.colors?.background,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        color: textColor,
      }}
    >
      <span className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
      <span
        className="absolute inset-x-0 bottom-0 h-1 opacity-90 transition"
        style={{ backgroundColor: accent }}
      />
      <span className="relative z-10 flex h-full flex-col justify-between gap-6">
        <span>
          <span className="block font-montserrat text-2xl font-bold leading-tight">
            {theme.display_name}
          </span>
          {theme.description && (
            <span className="mt-2 block max-h-[2.6rem] overflow-hidden text-sm leading-relaxed opacity-90">
              {theme.description}
            </span>
          )}
        </span>
        {theme.theme_instance && (
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {theme.theme_instance}
          </span>
        )}
      </span>
    </button>
  );
}

const GalleryCoreInner = () => {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [selectedThemeFamily, setSelectedThemeFamily] = useState<string | null>(
    null,
  );
  const [artworks, setArtworks] = useState<TResolvedArtwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [artworksError, setArtworksError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const didInitialLoad = useRef(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    pageNumber,
    setPageNumber,
    sortValue,
    setSortValue,
    activeEntryId,
    setActiveEntryId,
  } = useFilters();
  const navigate = useNavigate();
  const { width = 0, height = 0 } = useWindowSize();
  const isMobile = width < 1024;
  const isHorizontal = width > height;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    setThemesLoading(true);
    setThemesError(null);

    listGalleryThemes()
      .then((response) => {
        if (cancelled) return;
        setThemes(response.themes);
        setSelectedThemeFamily((current) =>
          current ?? response.themes[0]?.theme_family ?? null,
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setThemesError(
          error instanceof Error ? error.message : 'Failed to load themes',
        );
      })
      .finally(() => {
        if (!cancelled) setThemesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (themesLoading) return;
    if (!selectedThemeFamily) {
      setArtworks([]);
      setArtworksLoading(false);
      return;
    }

    let cancelled = false;
    setArtworksLoading(true);
    setArtworksError(null);

    fetchAllGalleryArtworks(selectedThemeFamily, toSortOrder(sortValue))
      .then((data) => {
        if (cancelled) return;
        setArtworks(data);
        setPageNumber(1);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setArtworks([]);
        setArtworksError(
          error instanceof Error ? error.message : 'Failed to load artworks',
        );
      })
      .finally(() => {
        if (!cancelled) setArtworksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedThemeFamily, setPageNumber, sortValue, themesLoading]);

  useEffect(() => {
    if (!artworksLoading && gridRef.current) {
      gsap.fromTo(
        gridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power1.out' },
      );
      didInitialLoad.current = true;
    }
  }, [artworksLoading]);

  useEffect(() => {
    if (didInitialLoad.current && gridRef.current) {
      gsap.fromTo(
        gridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power1.out' },
      );
    }
  }, [pageNumber]);

  const closeSlideshow = useCallback(() => {
    void navigate('/gallery');
    setModalOpen(false);
  }, [navigate]);

  useEffect(() => {
    const currentParams = new URLSearchParams();
    if (selectedThemeFamily) currentParams.set('theme', selectedThemeFamily);
    if (pageNumber > 1) currentParams.set('page', pageNumber.toString());
    if (sortValue !== 'Newest Event') currentParams.set('sort', sortValue);
    if (isModalOpen) currentParams.set('id', activeEntryId);

    setSearchParams(currentParams, { replace: true });
  }, [
    activeEntryId,
    isModalOpen,
    pageNumber,
    selectedThemeFamily,
    setSearchParams,
    sortValue,
  ]);

  useEffect(() => {
    const themeFromUrl = searchParams.get('theme');
    const idFromUrl = searchParams.get('id');
    if (themeFromUrl) setSelectedThemeFamily(themeFromUrl);
    if (idFromUrl) {
      setActiveEntryId(idFromUrl);
      setModalOpen(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSlideshow();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSlideshow]);

  const openSlideshow = () => {
    void navigate('/gallery/slideshow');
    setModalOpen(false);
  };

  const openModal = (id: string) => {
    setModalOpen(true);
    setActiveEntryId(id);
  };

  const getShareUrl = () => {
    const base = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const url = new URL(base);
    if (selectedThemeFamily) url.searchParams.set('theme', selectedThemeFamily);
    url.searchParams.set('id', activeEntryId);
    return url.toString();
  };

  const updatePageNumber = (_current: number, next: number) => {
    const target = document.getElementById('gallery-section');
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => setPageNumber(next),
      });
    } else {
      setPageNumber(next);
    }
  };

  const startIndex = (pageNumber - 1) * ARTWORKS_PER_PAGE;
  const pageData = artworks.slice(startIndex, startIndex + ARTWORKS_PER_PAGE);
  const showInitialArtworkLoading = artworksLoading && artworks.length === 0;
  const showArtworkLoadingOverlay = artworksLoading && artworks.length > 0;

  return (
    <div className="transition-all duration-300">
      {artworks.length > 0 && (
        <Outlet context={{ artworks } satisfies IGalleryContext} />
      )}
      <ArtworkModal
        id={activeEntryId}
        artworks={artworks}
        navigationList={artworks}
        onNavigate={setActiveEntryId}
        closeModal={closeSlideshow}
        isHorizontal={isHorizontal}
        modalState={isModalOpen}
        getShareUrl={getShareUrl}
      />

      <div className="breakout-w m-pad relative z-0 m-auto flex flex-col gap-8">
        <section className="-mx-4 overflow-x-auto px-4 pb-2">
          {themesLoading ? (
            <p className="py-8 text-center text-gray-600">
              Loading themes...
            </p>
          ) : themesError ? (
            <p className="py-8 text-center text-red-500">{themesError}</p>
          ) : themes.length === 0 ? (
            <p className="py-8 text-center text-gray-600">
              No gallery themes are available yet.
            </p>
          ) : (
            <div className="flex w-max gap-4">
              {themes.map((theme) => (
                <ThemeCard
                  key={`${theme.theme_family}-${theme.theme_instance}`}
                  theme={theme}
                  active={theme.theme_family === selectedThemeFamily}
                  onSelect={() => {
                    if (theme.theme_family === selectedThemeFamily) return;
                    setSelectedThemeFamily(theme.theme_family);
                    setPageNumber(1);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="relative z-[100] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => openSlideshow()}
            className="inline-flex h-[50px] items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
          >
            <Play size={16} />
            <span>Play Slideshow</span>
          </button>
          {!isMobile && (
            <Pagination
              totalItems={artworks.length}
              currentPage={pageNumber}
              itemsPerPage={ARTWORKS_PER_PAGE}
              updatePageNumber={updatePageNumber}
            />
          )}
          <select
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value as SortValue)}
            className="h-[50px] rounded-md border border-gray-600 bg-white px-4 text-sm font-medium"
            aria-label="Sort artworks"
          >
            <option value="Newest Event">Newest</option>
            <option value="Oldest Event">Oldest</option>
          </select>
        </div>

        <section className="relative">
          <hr className="my-10 w-full border-t border-black" />
          {showInitialArtworkLoading ? (
            <p className="py-20 text-center text-gray-600">
              Loading artworks...
            </p>
          ) : artworksError ? (
            <p className="py-20 text-center text-red-500">{artworksError}</p>
          ) : artworks.length === 0 ? (
            <p className="py-20 text-center text-gray-600">
              No artworks are available for this theme yet.
            </p>
          ) : (
            <div
              ref={gridRef}
              className={`grid grid-cols-2 gap-x-2 gap-y-6 transition-opacity duration-200 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10 ${
                showArtworkLoadingOverlay ? 'pointer-events-none opacity-55' : ''
              }`}
            >
              {pageData.map((artwork) => (
                <div className="flex h-full" key={artwork.id}>
                  <ArtworkCard artwork={artwork} openModal={openModal} />
                </div>
              ))}
            </div>
          )}
          {showArtworkLoadingOverlay && (
            <div className="absolute inset-0 flex items-start justify-center pt-20">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow-md">
                <LoaderCircle size={18} className="animate-spin" />
                Loading theme artworks...
              </div>
            </div>
          )}
          <div className="mb-4 mt-10">
            <Pagination
              totalItems={artworks.length}
              currentPage={pageNumber}
              itemsPerPage={ARTWORKS_PER_PAGE}
              updatePageNumber={updatePageNumber}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export const GalleryCore = () => (
  <FilterProvider>
    <GalleryCoreInner />
  </FilterProvider>
);
