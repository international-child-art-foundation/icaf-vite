import React, { useEffect, useCallback, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useSearchParams } from 'react-router-dom';
import type { Artwork } from '@/data/gallery/artworks';
import { getArtworks } from '@/server_asset_handlers/gallery';
import { sortBy } from '@/data/gallery/sortData';
import type { SortValue } from '@/data/gallery/sortData';
import { filterableOptions as initialFilterableOptions } from '@/data/gallery/filterData';
import Checkbox from './Checkbox';
import ArtworkCard from './ArtworkCard';
import Pagination from './Pagination';
import Filter from './Filter';
import { TagList } from './TagList';
import ArtworkModal from './ArtworkModal';
import { FilterProvider, useFilters } from './FilterContext';
import MobileFilter from './MobileFilter';
import { useWindowSize } from 'usehooks-ts';
import { Menu, Play } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { IGalleryContext } from '@/types/Gallery';
import { useNavigate } from 'react-router-dom';

type ParamsObjType = Record<string, string[]>;

function eventOrder(event: string): number {
  const match = event.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function isValueInFilter(
  value: string | undefined,
  filterValues: string[] | undefined,
): boolean {
  if (!filterValues || filterValues.length === 0) return true;
  if (!value) return false;
  return filterValues.includes(value);
}

const GalleryCoreInner = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [artworksError, setArtworksError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const didInitialLoad = useRef(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    filterableOptions,
    setFilterOption,
    bulkAlterCategoryOptions,
    resetAllFilters,
    updateOptionCounts,
    setRegionActive,
    pageNumber,
    setPageNumber,
    sortValue,
    setSortValue,
    activeEntryId,
    setActiveEntryId,
  } = useFilters();
  const navigate = useNavigate();

  const [paramsObj, setParamsObj] = useState<ParamsObjType>({});
  const { width = 0, height = 0 } = useWindowSize();
  const isMobile = width < 1024;
  const isHorizontal = width > height;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getArtworks()
      .then((data) => {
        setArtworks(data);
        const counts: Record<string, number> = {};
        data.forEach((a) => {
          if (a.event) counts[a.event] = (counts[a.event] ?? 0) + 1;
          if (a.country) counts[a.country] = (counts[a.country] ?? 0) + 1;
        });
        updateOptionCounts(counts);
      })
      .catch((e: unknown) =>
        setArtworksError(
          e instanceof Error ? e.message : 'Failed to load artworks',
        ),
      )
      .finally(() => setArtworksLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const openSlideshow = () => {
    void navigate('/gallery/slideshow');
    setModalOpen(false);
  };

  const closeSlideshow = () => {
    void navigate('/gallery');
    setModalOpen(false);
  };

  const artworksPerPage = 20;
  const startIndex = (pageNumber - 1) * artworksPerPage;
  const endIndex = startIndex + artworksPerPage;

  function createParamsObj(
    opts: typeof initialFilterableOptions,
  ): ParamsObjType {
    const obj: ParamsObjType = {};
    opts.forEach((option) => {
      const entries: string[] = [];
      if (option.regionActive)
        entries.push(
          option.categoryType === 'event' ? 'All Events' : option.title,
        );
      option.options
        .filter((item) => item.active)
        .forEach((item) => entries.push(item.name));
      if (entries.length > 0) obj[option.id] = entries;
    });
    return obj;
  }

  useEffect(() => {
    setParamsObj(createParamsObj(filterableOptions));
  }, [filterableOptions]);

  const updateURLFromState = useCallback(() => {
    const currentParams = new URLSearchParams();

    filterableOptions.forEach((category) => {
      const entries: string[] = [];
      if (category.regionActive)
        entries.push(
          category.categoryType === 'event' ? 'All Events' : category.title,
        );
      category.options
        .filter((o) => o.active)
        .forEach((o) => entries.push(o.name));
      if (entries.length > 0) currentParams.set(category.id, entries.join(','));
    });

    if (pageNumber > 1) currentParams.set('page', pageNumber.toString());
    if (sortValue !== 'Newest Event') currentParams.set('sort', sortValue);
    if (isModalOpen) currentParams.set('id', activeEntryId);

    setSearchParams(currentParams, { replace: true });
  }, [
    filterableOptions,
    pageNumber,
    sortValue,
    isModalOpen,
    activeEntryId,
    setSearchParams,
  ]);

  useEffect(() => {
    updateURLFromState();
  }, [updateURLFromState]);

  // Open modal to artwork ID from URL on mount
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setActiveEntryId(idFromUrl);
      setModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getShareUrl = () => {
    const base = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const url = new URL(base);
    url.searchParams.set('id', activeEntryId);
    return url.toString();
  };

  const openModal = (id: string) => {
    if (!isFilterOpen) {
      setModalOpen(true);
      setActiveEntryId(id);
    }
  };

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

  const updateFilterOption = (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => {
    setFilterOption(optionName, updates);
    setPageNumber(1);
  };

  const alterFiltersByCategory = (
    categoryId: string,
    activeStatus: boolean,
  ) => {
    bulkAlterCategoryOptions(categoryId, activeStatus);
    setPageNumber(1);
  };

  const clearAllFilters = () => {
    resetAllFilters();
    setPageNumber(1);
  };

  const removeFilterTag = (categoryId: string, value: string) => {
    const category = filterableOptions.find((c) => c.id === categoryId);
    const regionLabel =
      category?.categoryType === 'event' ? 'All Events' : category?.title;
    if (category && value === regionLabel) {
      setRegionActive(categoryId, false);
    } else {
      updateFilterOption(value, { active: false });
    }
    setPageNumber(1);
  };

  // Collect individually selected countries
  const selectedCountries = filterableOptions
    .filter((cat) => cat.categoryType === 'country')
    .flatMap((cat) => cat.options.filter((o) => o.active).map((o) => o.name));

  // Collect all country names belonging to active regions
  const activeRegionCountries = new Set(
    filterableOptions
      .filter((cat) => cat.categoryType === 'country' && cat.regionActive)
      .flatMap((cat) => cat.options.map((o) => o.name)),
  );

  const eventCategory = filterableOptions.find((cat) => cat.id === 'event');
  const eventRegionActive = eventCategory?.regionActive ?? false;
  const selectedEvents = eventRegionActive
    ? []
    : (eventCategory?.options.filter((o) => o.active).map((o) => o.name) ?? []);

  const hasCountryFilter =
    selectedCountries.length > 0 || activeRegionCountries.size > 0;

  let filteredArts = artworks.filter((artwork) => {
    const countryMatch =
      !hasCountryFilter ||
      (artwork.country
        ? selectedCountries.includes(artwork.country) ||
          activeRegionCountries.has(artwork.country)
        : false);
    const eventMatch = isValueInFilter(
      artwork.event,
      selectedEvents.length > 0 ? selectedEvents : undefined,
    );
    return countryMatch && eventMatch;
  });

  filteredArts = [...filteredArts].sort((a, b) => {
    const aOrder = eventOrder(a.event);
    const bOrder = eventOrder(b.event);
    if (aOrder !== bOrder) {
      return sortValue === 'Newest Event' ? bOrder - aOrder : aOrder - bOrder;
    }
    return (a.artists[0] ?? '').localeCompare(b.artists[0] ?? '');
  });

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('background-area') && isFilterOpen) {
      setIsFilterOpen(false);
    }
  };

  const pageData = filteredArts.slice(startIndex, endIndex);

  return (
    <div className="transition-all duration-300">
      {filteredArts.length > 0 && (
        <Outlet context={{ artworks } satisfies IGalleryContext} />
      )}
      <ArtworkModal
        id={activeEntryId}
        artworks={artworks}
        closeModal={closeSlideshow}
        isHorizontal={isHorizontal}
        modalState={isModalOpen}
        getShareUrl={getShareUrl}
      />
      {isMobile && (
        <MobileFilter
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          updateFilterOption={updateFilterOption}
          updateSortValue={(v: SortValue) => setSortValue(v)}
          alterFiltersByCategory={alterFiltersByCategory}
          resetAllFilters={resetAllFilters}
        />
      )}
      <div className="breakout-w m-pad relative z-0 m-auto flex flex-col gap-8">
        {/* Filter toggle + sort */}
        <button
          type="button"
          onClick={() => openSlideshow()}
          className="pointer-events-none mx-auto hidden h-[50px] items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 md:pointer-events-auto md:inline-flex"
        >
          <Play size={16} />
          <span className="">Play Slideshow</span>
        </button>

        <div className="relative z-[100] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex h-[50px] w-[200px] max-w-[40%] items-center justify-between rounded-md border border-gray-600 px-5 py-2 text-base font-medium md:max-w-[40%]"
          >
            {isFilterOpen ? 'Hide Filter' : 'Filter'}
            <span className="ml-6">
              <Menu size={18} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => openSlideshow()}
            className="mx-auto ml-auto inline-flex h-[50px] items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 md:pointer-events-none md:hidden"
          >
            <Play size={16} />
            <span className="">Play Slideshow</span>
          </button>
          {!isMobile && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <Pagination
                totalItems={filteredArts.length}
                currentPage={pageNumber}
                itemsPerPage={artworksPerPage}
                updatePageNumber={(_current, next) => {
                  const target = document.getElementById('gallery-section');
                  if (target) {
                    const top =
                      target.getBoundingClientRect().top + window.scrollY - 8;
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
                }}
              />
            </div>
          )}
          {!isMobile && (
            <div className="absolute right-0 w-[200px] max-w-[40%] rounded-lg bg-white">
              <Checkbox
                category="sort"
                title="Sort"
                options={sortBy}
                type="radio"
                updateFilterOption={updateFilterOption}
                updateSortValue={(v: SortValue) => setSortValue(v)}
                alterFiltersByCategory={alterFiltersByCategory}
              />
            </div>
          )}
        </div>

        <div
          className="relative z-[60] mt-10 grid"
          style={{
            gridTemplateRows: 'auto 1fr',
            gridTemplateColumns: 'repeat(20, 1fr)',
          }}
        >
          {/* Artwork grid */}
          <section
            className={`background-area pointer-events-auto relative row-start-2 justify-center transition-all duration-300 ease-in-out ${isFilterOpen ? 'pointer-events-none select-none opacity-40 blur-lg' : ''}`}
            onClick={handleGridClick}
            style={{ gridColumn: '1 / 21' }}
          >
            <hr className="my-10 w-full border-t border-black" />
            {artworksLoading ? (
              <p className="py-20 text-center text-gray-600">
                Loading artworks…
              </p>
            ) : artworksError ? (
              <p className="py-20 text-center text-red-500">{artworksError}</p>
            ) : filteredArts.length === 0 ? (
              <p className="py-20 text-center text-gray-600">
                No artworks match your filters.
              </p>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-2 gap-x-2 gap-y-6 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10"
              >
                {pageData.map((artwork) => (
                  <div className="flex h-full" key={artwork.id}>
                    <ArtworkCard artwork={artwork} openModal={openModal} />
                  </div>
                ))}
              </div>
            )}
            <div className="mb-4 mt-10">
              <Pagination
                totalItems={filteredArts.length}
                currentPage={pageNumber}
                itemsPerPage={artworksPerPage}
                updatePageNumber={(_current, next) => {
                  const target = document.getElementById('gallery-section');
                  if (target) {
                    const top =
                      target.getBoundingClientRect().top + window.scrollY - 12;
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
                }}
              />
            </div>
          </section>

          {/* Filter panel */}
          <section
            className={`relative z-50 col-start-1 row-span-2 row-start-1 lg:col-span-5 lg:col-start-1 xl:col-span-4 xl:col-start-1 ${
              isFilterOpen
                ? 'pointer-events-auto visible duration-300 ease-in-out'
                : 'pointer-events-none invisible select-none duration-300 ease-in-out'
            }`}
          >
            <div className="relative z-50 w-full flex-wrap">
              <section className="relative m-auto max-w-screen-2xl">
                {!isMobile && (
                  <Filter
                    isFilterOpen={isFilterOpen}
                    updateFilterOption={updateFilterOption}
                    updateSortValue={(v: SortValue) => setSortValue(v)}
                    alterFiltersByCategory={alterFiltersByCategory}
                  />
                )}
              </section>
            </div>
          </section>

          {/* Active filter tags */}
          <TagList
            paramsObj={paramsObj}
            removeFilterTag={removeFilterTag}
            clearAllFilters={clearAllFilters}
            dropdownActive={isFilterOpen && !isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export const GalleryCore = () => (
  <FilterProvider>
    <GalleryCoreInner />
  </FilterProvider>
);
