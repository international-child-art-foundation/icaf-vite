import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ChevronDown, Image, LoaderCircle, Play, Users, X } from 'lucide-react';
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
import {
  buildThemeFamilies,
  buildThemeMenuItems,
  ThemeFamilyCardModel,
  type VirtualThemeMenuItem,
} from './themeFamilies';
import { filterThemesForSurface, THEME_SURFACES } from './themeVisibility';
import { galleryVirtualThemeItems } from './virtualThemeItems';
import {
  fetchAllGalleryArtworks,
  fetchAllGalleryGroups,
  fetchArtworkGroupMetadata,
  fetchGroupArtworks,
  toSortOrder,
} from './galleryData';
import Pagination from './Pagination';
import { Button } from '@/shared/components/ui/button';
import { SortValue } from '@/modules/content/data/gallery/sortData';

const ARTWORKS_PER_PAGE = 24;
const GROUPS_PER_PAGE = 8;
type GalleryViewMode = 'individual' | 'group';
type FilterCategory = ReturnType<
  typeof useFilters
>['filterableOptions'][number];

function isBrowserReload() {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  return (
    navigationEntry instanceof PerformanceNavigationTiming &&
    navigationEntry.type === 'reload'
  );
}

function getInitialViewMode(): GalleryViewMode {
  if (typeof window === 'undefined') return 'individual';
  return new URLSearchParams(window.location.search).get('view') === 'group'
    ? 'group'
    : 'individual';
}

function useMediaQuery(query: string, fallback = false) {
  const getMatches = useCallback(() => {
    if (typeof window === 'undefined') return fallback;
    return window.matchMedia(query).matches;
  }, [fallback, query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQueryList.matches);

    updateMatches();
    mediaQueryList.addEventListener('change', updateMatches);
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

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

function formatThemeFamilyLabel(themeFamily: string) {
  const smallWords = new Set(['and', 'for', 'in', 'of', 'the', 'to']);

  return themeFamily
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && smallWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

type GalleryViewToggleProps = {
  viewMode: GalleryViewMode;
  onToggle: () => void;
};

function GalleryViewToggle({ viewMode, onToggle }: GalleryViewToggleProps) {
  const isGroup = viewMode === 'group';

  return (
    <button
      type="button"
      onClick={onToggle}
      data-gallery-control
      aria-label={`Switch to ${isGroup ? 'individual' : 'group'} view`}
      className={`group relative h-[80px] w-[188px] flex-none overflow-hidden rounded-md p-3 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
        isGroup ? 'text-neutral-950' : 'text-white'
      }`}
    >
      <span
        className={`absolute inset-0 transition-opacity duration-500 ${
          isGroup ? 'opacity-0' : 'opacity-100'
        } from-secondary-blue/80 to-primary/100 bg-gradient-to-br`}
      />
      <span
        className={`absolute inset-0 transition-opacity duration-500 ${
          isGroup ? 'opacity-100' : 'opacity-0'
        } from-secondary-yellow via-tertiary-yellow to-primary-alt bg-gradient-to-br`}
      />
      <span className="relative z-10 flex h-full items-center gap-3">
        <span
          className={`relative h-10 w-10 flex-none overflow-hidden rounded-full shadow-sm transition-colors duration-300 ${
            isGroup ? 'bg-white/60 text-neutral-950' : 'bg-white/20 text-white'
          }`}
        >
          <Image
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 transition duration-300 ${
              isGroup
                ? 'translate-y-[115%] opacity-0'
                : '-translate-y-1/2 opacity-100'
            }`}
          />
          <Users
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 transition duration-300 ${
              isGroup
                ? '-translate-y-1/2 opacity-100'
                : '-translate-y-[165%] opacity-0'
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
            View
          </span>
          <span className="font-montserrat block text-lg font-bold leading-tight">
            {isGroup ? 'Group' : 'Artwork'}
          </span>
        </span>
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
  const [selectedThemeInstance, setSelectedThemeInstance] = useState<
    string | null
  >(null);
  const [artworks, setArtworks] = useState<TResolvedArtwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [artworksError, setArtworksError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<GalleryViewMode>(getInitialViewMode);
  const [slideshowArtworks, setSlideshowArtworks] = useState<
    TResolvedArtwork[]
  >([]);
  const [slideshowPreserveOrder, setSlideshowPreserveOrder] = useState(false);
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
  const [didReadInitialUrlState, setDidReadInitialUrlState] = useState(false);
  const wasInSlideshowRef = useRef(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    pageNumber,
    setPageNumber,
    sortValue,
    setSortValue,
    activeEntryId,
    setActiveEntryId,
    filterableOptions,
  } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const isHorizontal = useMediaQuery('(orientation: landscape)', true);
  const [searchParams, setSearchParams] = useSearchParams();

  const themeFamilies = useMemo(() => buildThemeFamilies(themes), [themes]);
  const themeMenuItems = useMemo(
    () => buildThemeMenuItems(themes, galleryVirtualThemeItems),
    [themes],
  );
  const selectedThemeLabel = useMemo(() => {
    if (!selectedThemeFamily) return null;

    if (selectedThemeInstance) {
      const selectedTheme = themes.find(
        (theme) =>
          theme.theme_family === selectedThemeFamily &&
          theme.theme_instance === selectedThemeInstance,
      );

      if (selectedTheme?.display_name) return selectedTheme.display_name;
    }

    const selectedFamily = themeFamilies.find(
      (family) => family.theme_family === selectedThemeFamily,
    );

    return (
      selectedFamily?.display_name ??
      formatThemeFamilyLabel(selectedThemeFamily)
    );
  }, [selectedThemeFamily, selectedThemeInstance, themeFamilies, themes]);
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
        setThemes(
          filterThemesForSurface(response.themes, THEME_SURFACES.gallery),
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
      setSlideshowPreserveOrder(false);
    }
    wasInSlideshowRef.current = isInSlideshow;
  }, [location.pathname]);

  useEffect(() => {
    if (!didReadInitialUrlState) return;
    if (location.pathname.includes('/slideshow')) return;
    const currentParams = new URLSearchParams();
    if (selectedThemeFamily) currentParams.set('theme', selectedThemeFamily);
    if (selectedThemeInstance) {
      currentParams.set('instance', selectedThemeInstance);
    }
    if (viewMode === 'group') currentParams.set('view', viewMode);
    if (pageNumber > 1) currentParams.set('page', pageNumber.toString());
    if (sortValue !== 'Newest Event') currentParams.set('sort', sortValue);
    if (isModalOpen) currentParams.set('id', activeEntryId);

    setSearchParams(currentParams, { replace: true });
  }, [
    activeEntryId,
    didReadInitialUrlState,
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
    const isReload = isBrowserReload();
    const themeFromUrl = searchParams.get('theme');
    const instanceFromUrl = searchParams.get('instance');
    const idFromUrl = searchParams.get('id');
    const viewFromUrl = searchParams.get('view');
    if (!isReload) {
      if (themeFromUrl) setSelectedThemeFamily(themeFromUrl);
      if (instanceFromUrl) setSelectedThemeInstance(instanceFromUrl);
    }
    setViewMode(viewFromUrl === 'group' ? 'group' : 'individual');
    if (idFromUrl) {
      setActiveEntryId(idFromUrl);
      setModalOpen(true);
    }
    setDidReadInitialUrlState(true);
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

  const fetchGroupsForSlideshow = async (
    groupsForSlideshow: GroupListItem[],
  ) => {
    const groupedArtworks: TResolvedArtwork[] = [];

    for (const group of groupsForSlideshow) {
      const groupArtworks = await fetchGroupArtworks(group);
      groupedArtworks.push(...groupArtworks);
    }

    return groupedArtworks;
  };

  const openSlideshow = () => {
    if (viewMode === 'group') {
      if (groupsLoading || groups.length === 0) {
        setSlideshowArtworks([]);
        setGroupSlideshowError(null);
        showNoArtworksUnavailableTooltip();
        return;
      }

      setGroupSlideshowLoading(true);
      setGroupSlideshowError(null);
      hideNoArtworksTooltip();

      fetchGroupsForSlideshow(groups)
        .then((data) => {
          if (data.length === 0) {
            showNoArtworksUnavailableTooltip();
            return;
          }

          setSlideshowPreserveOrder(true);
          setSlideshowArtworks(data);
          void navigate('/gallery/slideshow?view=group');
          setModalOpen(false);
        })
        .catch((error: unknown) => {
          setGroupSlideshowError(
            error instanceof Error
              ? error.message
              : 'Failed to load group slideshow',
          );
        })
        .finally(() => setGroupSlideshowLoading(false));
      return;
    }

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
        setSlideshowPreserveOrder(false);
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
        setSlideshowPreserveOrder(true);
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

  const openModal = useCallback(
    (id: string) => {
      setModalOpen(true);
      setActiveEntryId(id);
    },
    [setActiveEntryId],
  );

  const applyArtworkKudos = useCallback((artId: string, amount: number) => {
    const updateArtwork = (artwork: TResolvedArtwork) =>
      artwork.art_id === artId
        ? {
            ...artwork,
            kudos_count: Math.max(0, (artwork.kudos_count ?? 0) + amount),
          }
        : artwork;

    setArtworks((current) => current.map(updateArtwork));
    setSlideshowArtworks((current) => current.map(updateArtwork));
  }, []);

  const deselectTheme = () => {
    if (selectedThemeFamily === null && selectedThemeInstance === null) return;
    setSelectedThemeFamily(null);
    setSelectedThemeInstance(null);
    setPageNumber(1);
  };

  const selectVirtualThemeItem = (item: VirtualThemeMenuItem) => {
    if (item.to) {
      void navigate(item.to);
      return;
    }

    if (item.href) {
      window.location.href = item.href;
    }
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
              onArtworkKudos: applyArtworkKudos,
              preserveOrder: slideshowPreserveOrder,
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
        onKudosApplied={applyArtworkKudos}
      />

      <div className="breakout-w m-pad relative z-0 m-auto flex flex-col gap-2 sm:gap-4">
        <div className="relative flex flex-col gap-6 sm:gap-8">
          <div className="hidden items-center justify-between gap-3 sm:flex">
            <div className="hidden w-full sm:flex">
              <button
                type="button"
                onClick={() => openSlideshow()}
                data-gallery-control
                className="mr-auto inline-flex items-center gap-2 rounded-md border border-gray-600 p-4 text-sm font-medium transition-colors hover:bg-gray-100"
              >
                <Play size={16} />
                Slideshow
              </button>
              {showNoArtworksTooltip && (
                <button
                  type="button"
                  onClick={hideNoArtworksTooltip}
                  className="absolute left-32 mt-2 whitespace-nowrap rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
                >
                  No artworks available
                </button>
              )}
              <div className="relative ml-auto">
                <select
                  id="gallery-sort"
                  name="gallery-sort"
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
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <Pagination
                totalItems={activeItems.length}
                currentPage={pageNumber}
                itemsPerPage={activeItemsPerPage}
                updatePageNumber={updatePageNumber}
              />
            </div>
          </div>
          <div className="relative">
            {selectedThemeFamily !== null && (
              <button
                type="button"
                onClick={deselectTheme}
                className="absolute -top-7 left-1 z-30 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Clear filter</span>
              </button>
            )}
            {themesLoading ? (
              <p className="text-center text-gray-600">Loading themes...</p>
            ) : themesError ? (
              <p className="text-center text-red-500">{themesError}</p>
            ) : (
              <div className="overflow-x-auto px-1 py-2">
                <div className="flex w-max items-stretch gap-3">
                  <GalleryViewToggle
                    viewMode={viewMode}
                    onToggle={() => {
                      setViewMode((current) =>
                        current === 'group' ? 'individual' : 'group',
                      );
                      setPageNumber(1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => openSlideshow()}
                    data-gallery-control
                    aria-label="Open slideshow"
                    className="border-neutral/50 flex h-[80px] w-[80px] flex-none items-center justify-center rounded-md border text-neutral-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-md active:translate-y-0 active:scale-[0.98] sm:hidden"
                  >
                    <Play aria-hidden="true" className="h-6 w-6" />
                  </button>
                  {showNoArtworksTooltip && (
                    <button
                      type="button"
                      onClick={hideNoArtworksTooltip}
                      className="absolute left-[212px] top-full z-30 mt-1 whitespace-nowrap rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg sm:hidden"
                    >
                      No artworks available
                    </button>
                  )}
                  {themeMenuItems.map((item) => (
                    <GalleryThemeCard
                      key={item.kind === 'theme' ? item.theme_family : item.id}
                      item={item}
                      active={
                        item.kind === 'theme' &&
                        item.theme_family === selectedThemeFamily
                      }
                      selectedThemeInstance={selectedThemeInstance}
                      onSelectThemeFamily={(family: ThemeFamilyCardModel) => {
                        if (family.theme_family === selectedThemeFamily) return;
                        setSelectedThemeFamily(family.theme_family);
                        setSelectedThemeInstance(null);
                        setPageNumber(1);
                      }}
                      onSelectVirtualItem={selectVirtualThemeItem}
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
        </div>

        <section className="relative">
          <hr className="from-border-black/20 via-border-black/30 to-border-black/40 mb-10 w-full border-2 border-t bg-gradient-to-r" />
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
              <div className="mb-2 text-center">
                <p>
                  <span>
                    No {viewMode === 'group' ? 'groups' : 'artworks'} are
                    available
                    {selectedThemeLabel
                      ? ` for ${selectedThemeLabel}`
                      : ''}{' '}
                    yet.
                  </span>
                  <br className="hidden sm:block" />
                  <span> You can be the first to contribute!</span>
                </p>
              </div>
              <Link to="/submit-artwork">
                <Button className="text-base">Submit Artwork</Button>
              </Link>
              {selectedThemeFamily !== null && (
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={deselectTheme}
                  className="mt-2"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Go back</span>
                </Button>
              )}
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
