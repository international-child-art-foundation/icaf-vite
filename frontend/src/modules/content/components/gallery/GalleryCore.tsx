import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { LoaderCircle, Play } from 'lucide-react';
import { useWindowSize } from 'usehooks-ts';
import type { GroupListItem, ThemeListItem } from '@icaf/shared';
import { listGalleryThemes } from '@/api/public';
import type {
  IGalleryContext,
  TResolvedArtwork,
} from '@/modules/content/types/Gallery';
import ArtworkCard from './ArtworkCard';
import ArtworkModal from './ArtworkModal';
import { FilterProvider, useFilters } from './FilterContext';
import { GalleryGroupCard } from './GalleryGroupCard';
import { GalleryThemeCard } from './GalleryThemeCard';
import { buildThemeFamilies } from './themeFamilies';
import {
  fetchAllGalleryArtworks,
  fetchAllGalleryGroups,
  fetchArtworkGroupMetadata,
  fetchGroupArtworks,
  toSortOrder,
} from './galleryData';
import Pagination from './Pagination';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const ARTWORKS_PER_PAGE = 24;
const GROUPS_PER_PAGE = 8;
type GalleryViewMode = 'individual' | 'group';
type FilterCategory = ReturnType<
  typeof useFilters
>['filterableOptions'][number];

function getActiveOptionNames(category: FilterCategory) {
  return category.options
    .filter((option) => option.active)
    .map((option) => option.name);
}

function filterArtworksForSlideshow(
  artworks: TResolvedArtwork[],
  filterableOptions: FilterCategory[],
) {
  const activeEvents = new Set(
    filterableOptions
      .filter((category) => category.categoryType === 'event')
      .flatMap((category) =>
        category.regionActive
          ? category.options.map((option) => option.name)
          : getActiveOptionNames(category),
      ),
  );

  const activeCountries = new Set(
    filterableOptions
      .filter((category) => category.categoryType === 'country')
      .flatMap((category) =>
        category.regionActive
          ? category.options.map((option) => option.name)
          : getActiveOptionNames(category),
      ),
  );

  if (activeEvents.size === 0 && activeCountries.size === 0) return artworks;

  return artworks.filter((artwork) => {
    const country = artwork.country ?? artwork.groupCountry;
    const matchesEvent =
      activeEvents.size === 0 || activeEvents.has(artwork.event);
    const matchesCountry =
      activeCountries.size === 0 ||
      (country ? activeCountries.has(country) : false);

    return matchesEvent && matchesCountry;
  });
}

const GalleryCoreInner = () => {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [selectedThemeFamily, setSelectedThemeFamily] = useState<string | null>(
    null,
  );
  const [selectedThemeInstance, setSelectedThemeInstance] = useState<
    string | null
  >(null);
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
  const [showNoArtworksTooltip, setShowNoArtworksTooltip] = useState(false);
  const noArtworksTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const didInitialLoad = useRef(false);
  const wasInSlideshowRef = useRef(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    pageNumber,
    setPageNumber,
    sortValue,
    activeEntryId,
    setActiveEntryId,
    filterableOptions,
  } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const { width = 0, height = 0 } = useWindowSize();
  const isMobile = width < 1024;
  const isHorizontal = width > height;
  const [searchParams, setSearchParams] = useSearchParams();

  const themeFamilies = useMemo(() => buildThemeFamilies(themes), [themes]);
  const slideshowAvailableArtworks = useMemo(
    () => filterArtworksForSlideshow(artworks, filterableOptions),
    [artworks, filterableOptions],
  );

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

    fetchAllGalleryArtworks(
      selectedThemeFamily,
      selectedThemeInstance,
      toSortOrder(sortValue),
    )
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
  }, [
    selectedThemeFamily,
    selectedThemeInstance,
    setPageNumber,
    sortValue,
    themesLoading,
  ]);

  useEffect(() => {
    if (themesLoading) return;

    let cancelled = false;
    setGroupsLoading(true);
    setGroupsError(null);

    fetchAllGalleryGroups(
      selectedThemeFamily,
      selectedThemeInstance,
      toSortOrder(sortValue),
    )
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
  }, [
    selectedThemeFamily,
    selectedThemeInstance,
    setPageNumber,
    sortValue,
    themesLoading,
  ]);

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
    const isInSlideshow = location.pathname.includes('/slideshow');
    if (!isInSlideshow && wasInSlideshowRef.current) {
      setSlideshowArtworks([]);
    }
    wasInSlideshowRef.current = isInSlideshow;
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes('/slideshow')) return;
    const currentParams = new URLSearchParams();
    if (selectedThemeFamily) currentParams.set('theme', selectedThemeFamily);
    if (selectedThemeInstance) {
      currentParams.set('instance', selectedThemeInstance);
    }
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
    selectedThemeInstance,
    setSearchParams,
    sortValue,
    viewMode,
  ]);

  useEffect(() => {
    const themeFromUrl = searchParams.get('theme');
    const instanceFromUrl = searchParams.get('instance');
    const idFromUrl = searchParams.get('id');
    const viewFromUrl = searchParams.get('view');
    if (themeFromUrl) setSelectedThemeFamily(themeFromUrl);
    if (instanceFromUrl) setSelectedThemeInstance(instanceFromUrl);
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

  useEffect(() => {
    return () => {
      if (noArtworksTooltipTimer.current) {
        clearTimeout(noArtworksTooltipTimer.current);
      }
    };
  }, []);

  const hideNoArtworksTooltip = () => {
    if (noArtworksTooltipTimer.current) {
      clearTimeout(noArtworksTooltipTimer.current);
      noArtworksTooltipTimer.current = null;
    }
    setShowNoArtworksTooltip(false);
  };

  const showNoArtworksUnavailableTooltip = () => {
    if (noArtworksTooltipTimer.current) {
      clearTimeout(noArtworksTooltipTimer.current);
    }
    setShowNoArtworksTooltip(true);
    noArtworksTooltipTimer.current = setTimeout(() => {
      setShowNoArtworksTooltip(false);
      noArtworksTooltipTimer.current = null;
    }, 3000);
  };

  const openSlideshow = () => {
    if (artworksLoading || slideshowAvailableArtworks.length === 0) {
      setSlideshowArtworks([]);
      setGroupSlideshowError(null);
      showNoArtworksUnavailableTooltip();
      return;
    }

    setGroupSlideshowLoading(true);
    setGroupSlideshowError(null);
    hideNoArtworksTooltip();

    fetchArtworkGroupMetadata(slideshowAvailableArtworks)
      .then((enrichedArtworks) => {
        if (enrichedArtworks.length === 0) {
          showNoArtworksUnavailableTooltip();
          return;
        }
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
    if (selectedThemeInstance) {
      url.searchParams.set('instance', selectedThemeInstance);
    }
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
      {(slideshowArtworks.length > 0 ||
        slideshowAvailableArtworks.length > 0) && (
        <Outlet
          context={
            {
              artworks:
                slideshowArtworks.length > 0
                  ? slideshowArtworks
                  : slideshowAvailableArtworks,
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

      <div className="breakout-w m-pad relative z-0 m-auto flex flex-col gap-10">
        <div className="relative z-[100] flex items-center justify-between gap-3">
          <div className="grid w-full grid-cols-1 grid-rows-1">
            <button
              type="button"
              onClick={() => openSlideshow()}
              className="col-start-1 row-start-1 mx-auto inline-flex items-center gap-2 rounded-md border border-gray-600 p-4 text-sm font-medium transition-colors hover:bg-gray-100"
            >
              <Play size={16} />
              <span>Play Slideshow</span>
            </button>
            <div className="relative col-start-1 row-start-1 ml-auto inline-block flex items-center">
              <select
                value={viewMode}
                onChange={(event) => {
                  setViewMode(event.target.value as GalleryViewMode);
                  setPageNumber(1);
                }}
                className="appearance-none rounded-md border border-gray-600 bg-white p-4 pr-12 text-sm font-medium"
                aria-label="Gallery view"
              >
                <option value="group">Group View</option>
                <option value="individual">Artwork View</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700"
                aria-hidden="true"
              />
            </div>{' '}
            {showNoArtworksTooltip && (
              <button
                type="button"
                onClick={hideNoArtworksTooltip}
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
              >
                No artworks available
              </button>
            )}
          </div>
          {!isMobile && (
            <Pagination
              totalItems={activeItems.length}
              currentPage={pageNumber}
              itemsPerPage={activeItemsPerPage}
              updatePageNumber={updatePageNumber}
            />
          )}
          {/* <div>
            <select
              value={sortValue}
              onChange={(event) =>
                setSortValue(event.target.value as SortValue)
              }
              className="h-[50px] appearance-none rounded-md border border-gray-600 bg-white px-4 pr-12 text-sm font-medium"
              aria-label="Sort artworks"
            >
              <option value="Newest Event">Newest</option>
              <option value="Oldest Event">Oldest</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700"
              aria-hidden="true"
            />
          </div> */}
        </div>

        <section className="relative">
          <div className="">
            {/* <div className="flex flex-row justify-between">
            <div className="mb-3 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  if (selectedThemeFamily === null) return;
                  setSelectedThemeFamily(null);
                  setSelectedThemeInstance(null);
                  setPageNumber(1);
                }}
                className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:border-black/90 disabled:font-bold disabled:opacity-100"
                disabled={selectedThemeFamily === null}
              >
                All Themes
              </button>
            </div>
          </div> */}
            {themesLoading ? (
              <p className="text-center text-gray-600">Loading themes...</p>
            ) : themesError ? (
              <p className="text-center text-red-500">{themesError}</p>
            ) : (
              <div className="overflow-x-auto px-1 py-2">
                <div className="flex w-max gap-3">
                  {themeFamilies.map((family) => (
                    <GalleryThemeCard
                      key={family.theme_family}
                      family={family}
                      active={family.theme_family === selectedThemeFamily}
                      selectedThemeInstance={selectedThemeInstance}
                      onSelectFamily={() => {
                        if (family.theme_family === selectedThemeFamily) return;
                        setSelectedThemeFamily(family.theme_family);
                        setSelectedThemeInstance(null);
                        setPageNumber(1);
                      }}
                      onSelectInstance={(theme) => {
                        setSelectedThemeFamily(theme.theme_family);
                        setSelectedThemeInstance(theme.theme_instance);
                        setPageNumber(1);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

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
            <div className="flex flex-col items-center gap-2 py-20 text-lg">
              <p className="mb-2 text-center">
                <p>
                  No {viewMode === 'group' ? 'groups' : 'artworks'} are
                  available
                  {selectedThemeFamily ? ' for this theme' : ''} yet.
                </p>
                <p>You can be the first to contribute!</p>
              </p>
              <Link to="/submit-artwork">
                <Button className="text-base">Submit Artwork</Button>
              </Link>
            </div>
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
