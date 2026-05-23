import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Images, LoaderCircle, Play } from 'lucide-react';
import { useWindowSize } from 'usehooks-ts';
import type { GroupListItem, ThemeListItem } from '@icaf/shared';
import { listGalleryThemes } from '@/api/public';
import type {
  IGalleryContext,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';
import type { SortValue } from '@/modules/content/data/gallery/sortData';
import ArtworkCard from './ArtworkCard';
import ArtworkModal from './ArtworkModal';
import { FilterProvider, useFilters } from './FilterContext';
import { GalleryGroupCard } from './GalleryGroupCard';
import { GalleryThemeCard } from './GalleryThemeCard';
import {
  fetchAllGalleryArtworks,
  fetchAllGalleryGroups,
  fetchArtworkGroupMetadata,
  fetchGroupArtworks,
  toSortOrder,
} from './galleryData';
import Pagination from './Pagination';

const ARTWORKS_PER_PAGE = 20;
const GROUPS_PER_PAGE = 8;
type GalleryViewMode = 'individual' | 'group';

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
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<GalleryViewMode>('group');
  const [slideshowArtworks, setSlideshowArtworks] = useState<
    TResolvedArtwork[]
  >([]);
  const [groupSlideshowLoading, setGroupSlideshowLoading] = useState(false);
  const [groupSlideshowError, setGroupSlideshowError] = useState<string | null>(
    null,
  );
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
  const location = useLocation();
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
    if (themesLoading) return;

    let cancelled = false;
    setGroupsLoading(true);
    setGroupsError(null);

    fetchAllGalleryGroups(selectedThemeFamily, toSortOrder(sortValue))
      .then((data) => {
        if (cancelled) return;
        setGroups(data);
        setPageNumber(1);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setGroups([]);
        setGroupsError(
          error instanceof Error ? error.message : 'Failed to load groups',
        );
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedThemeFamily, setPageNumber, sortValue, themesLoading]);

  useEffect(() => {
    if (!artworksLoading && !groupsLoading && gridRef.current) {
      gsap.fromTo(
        gridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power1.out' },
      );
      didInitialLoad.current = true;
    }
  }, [artworksLoading, groupsLoading]);

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
    if (location.pathname.includes('/slideshow')) return;
    const currentParams = new URLSearchParams();
    if (selectedThemeFamily) currentParams.set('theme', selectedThemeFamily);
    if (viewMode === 'individual') currentParams.set('view', viewMode);
    if (pageNumber > 1) currentParams.set('page', pageNumber.toString());
    if (sortValue !== 'Newest Event') currentParams.set('sort', sortValue);
    if (isModalOpen) currentParams.set('id', activeEntryId);

    setSearchParams(currentParams, { replace: true });
  }, [
    activeEntryId,
    isModalOpen,
    location.pathname,
    pageNumber,
    selectedThemeFamily,
    setSearchParams,
    sortValue,
    viewMode,
  ]);

  useEffect(() => {
    const themeFromUrl = searchParams.get('theme');
    const idFromUrl = searchParams.get('id');
    const viewFromUrl = searchParams.get('view');
    if (themeFromUrl) setSelectedThemeFamily(themeFromUrl);
    if (viewFromUrl === 'individual') setViewMode('individual');
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
    setGroupSlideshowLoading(true);
    setGroupSlideshowError(null);

    fetchArtworkGroupMetadata(artworks)
      .then((enrichedArtworks) => {
        setSlideshowArtworks(enrichedArtworks);
        void navigate('/gallery/slideshow');
        setModalOpen(false);
      })
      .catch((error: unknown) => {
        setGroupSlideshowError(
          error instanceof Error
            ? error.message
            : 'Failed to load slideshow details',
        );
      })
      .finally(() => setGroupSlideshowLoading(false));
  };

  const openGroupSlideshow = (group: GroupListItem) => {
    setGroupSlideshowLoading(true);
    setGroupSlideshowError(null);
    fetchGroupArtworks(group)
      .then((data) => {
        if (data.length === 0) {
          setGroupSlideshowError('This group has no approved artworks yet.');
          return;
        }
        setSlideshowArtworks(data);
        void navigate(`/gallery/slideshow?group=${group.group_id}`);
      })
      .catch((error: unknown) => {
        setGroupSlideshowError(
          error instanceof Error
            ? error.message
            : 'Failed to load group slideshow',
        );
      })
      .finally(() => setGroupSlideshowLoading(false));
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
  const groupStartIndex = (pageNumber - 1) * GROUPS_PER_PAGE;
  const pageData = artworks.slice(startIndex, startIndex + ARTWORKS_PER_PAGE);
  const groupPageData = groups.slice(
    groupStartIndex,
    groupStartIndex + GROUPS_PER_PAGE,
  );
  const activeItems = viewMode === 'group' ? groups : artworks;
  const activeItemsPerPage =
    viewMode === 'group' ? GROUPS_PER_PAGE : ARTWORKS_PER_PAGE;
  const activeError = viewMode === 'group' ? groupsError : artworksError;
  const showInitialArtworkLoading = artworksLoading && artworks.length === 0;
  const showArtworkLoadingOverlay = artworksLoading && artworks.length > 0;
  const showInitialGroupLoading = groupsLoading && groups.length === 0;
  const showGroupLoadingOverlay = groupsLoading && groups.length > 0;
  const showInitialLoading =
    viewMode === 'group' ? showInitialGroupLoading : showInitialArtworkLoading;
  const showLoadingOverlay =
    groupSlideshowLoading ||
    (viewMode === 'group'
      ? showGroupLoadingOverlay
      : showArtworkLoadingOverlay);

  return (
    <div className="transition-all duration-300">
      {(slideshowArtworks.length > 0 || artworks.length > 0) && (
        <Outlet
          context={
            {
              artworks:
                slideshowArtworks.length > 0 ? slideshowArtworks : artworks,
            } satisfies IGalleryContext
          }
        />
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
        <div className="relative z-[100] flex items-center justify-between gap-3">
          <select
            value={viewMode}
            onChange={(event) => {
              setViewMode(event.target.value as GalleryViewMode);
              setPageNumber(1);
            }}
            className="h-[50px] rounded-md border border-gray-600 bg-white px-4 text-sm font-medium"
            aria-label="Gallery view"
          >
            <option value="group">Group</option>
            <option value="individual">Individual</option>
          </select>
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <button
              type="button"
              onClick={() => openSlideshow()}
              className="inline-flex h-[50px] items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
            >
              <Play size={16} />
              <span>Play Slideshow</span>
            </button>
          </div>
          {!isMobile && (
            <Pagination
              totalItems={activeItems.length}
              currentPage={pageNumber}
              itemsPerPage={activeItemsPerPage}
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
        <section className="-mx-4 overflow-x-auto px-4 pb-0">
          {themesLoading ? (
            <p className="text-center text-gray-600">Loading themes...</p>
          ) : themesError ? (
            <p className="text-center text-red-500">{themesError}</p>
          ) : (
            <div className="flex w-max">
              <button
                type="button"
                onClick={() => {
                  if (selectedThemeFamily === null) return;
                  setSelectedThemeFamily(null);
                  setPageNumber(1);
                }}
                className={`group relative h-[80px] w-[230px] flex-none overflow-hidden bg-white p-3 text-left text-gray-950 shadow-sm ring-inset transition duration-200 sm:w-[250px] ${
                  selectedThemeFamily === null
                    ? 'ring-4 ring-black/20'
                    : 'ring-1 ring-gray-300 hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,134,195,0.12),rgba(246,192,38,0.18))]" />
                <span className="absolute bottom-0 left-0 h-1 w-full bg-[#0286C3] opacity-90 transition group-hover:bg-[#F6C026]" />
                <span className="relative z-10 flex h-full items-center justify-between gap-3">
                  <span>
                    <span className="font-montserrat block text-lg font-bold leading-tight">
                      All Themes
                    </span>
                    <span className="mt-1 block text-xs leading-tight text-gray-600">
                      Show every gallery entry
                    </span>
                  </span>
                  <Images size={24} aria-hidden="true" />
                </span>
              </button>
              {themes.map((theme) => (
                <GalleryThemeCard
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

        <section className="relative">
          <hr className="mb-10 w-full border-t border-black" />
          {groupSlideshowError && (
            <p className="-mt-4 mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {groupSlideshowError}
            </p>
          )}

          {showInitialLoading ? (
            <p className="py-20 text-center text-gray-600">
              Loading {viewMode === 'group' ? 'groups' : 'artworks'}...
            </p>
          ) : activeError ? (
            <p className="py-20 text-center text-red-500">{activeError}</p>
          ) : activeItems.length === 0 ? (
            <p className="py-20 text-center text-gray-600">
              No {viewMode === 'group' ? 'groups' : 'artworks'} are available
              {selectedThemeFamily ? ' for this theme' : ''} yet.
            </p>
          ) : viewMode === 'group' ? (
            <div
              ref={gridRef}
              className={`flex flex-col gap-5 transition-opacity duration-200 ${
                showLoadingOverlay ? 'pointer-events-none opacity-55' : ''
              }`}
            >
              {groupPageData.map((group) => (
                <GalleryGroupCard
                  key={group.group_id}
                  group={group}
                  onOpen={openGroupSlideshow}
                />
              ))}
            </div>
          ) : (
            <div
              ref={gridRef}
              className={`grid grid-cols-2 gap-x-2 gap-y-6 transition-opacity duration-200 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10 ${
                showArtworkLoadingOverlay
                  ? 'pointer-events-none opacity-55'
                  : ''
              }`}
            >
              {pageData.map((artwork) => (
                <div className="flex h-full" key={artwork.id}>
                  <ArtworkCard artwork={artwork} openModal={openModal} />
                </div>
              ))}
            </div>
          )}
          {showLoadingOverlay && (
            <div className="absolute inset-0 flex items-start justify-center pt-20">
              <div className="inline-flex items-center gap-2 rounded-md bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow-md">
                <LoaderCircle size={18} className="animate-spin" />
                {groupSlideshowLoading
                  ? 'Loading slideshow details...'
                  : `Loading ${selectedThemeFamily ? 'theme ' : ''}${
                      viewMode === 'group' ? 'groups' : 'artworks'
                    }...`}
              </div>
            </div>
          )}
          <div className="mb-4 mt-10">
            <Pagination
              totalItems={activeItems.length}
              currentPage={pageNumber}
              itemsPerPage={activeItemsPerPage}
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
