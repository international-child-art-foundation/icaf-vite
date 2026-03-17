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
import { Menu } from 'lucide-react';

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

const GalleryCoreInner: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [artworksError, setArtworksError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    filterableOptions,
    setFilterOption,
    bulkAlterCategoryOptions,
    resetAllFilters,
    pageNumber,
    setPageNumber,
    sortValue,
    setSortValue,
    activeEntryId,
    setActiveEntryId,
  } = useFilters();

  const [paramsObj, setParamsObj] = useState<ParamsObjType>({});
  const { width = 0, height = 0 } = useWindowSize();
  const isMobile = width < 1024;
  const isHorizontal = width > height;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getArtworks()
      .then(setArtworks)
      .catch((e: unknown) =>
        setArtworksError(
          e instanceof Error ? e.message : 'Failed to load artworks',
        ),
      )
      .finally(() => setArtworksLoading(false));
  }, []);

  useEffect(() => {
    if (!artworksLoading && gridRef.current) {
      gsap.fromTo(
        gridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power1.out' },
      );
    }
  }, [artworksLoading]);

  const artworksPerPage = 20;
  const startIndex = (pageNumber - 1) * artworksPerPage;
  const endIndex = startIndex + artworksPerPage;

  function createParamsObj(
    opts: typeof initialFilterableOptions,
  ): ParamsObjType {
    const obj: ParamsObjType = {};
    opts.forEach((option) => {
      const activeOptions = option.options
        .filter((item) => item.active)
        .map((item) => item.name);
      if (activeOptions.length > 0) {
        obj[option.id] = activeOptions;
      }
    });
    return obj;
  }

  useEffect(() => {
    setParamsObj(createParamsObj(filterableOptions));
  }, [filterableOptions]);

  const updateURLFromState = useCallback(() => {
    const currentParams = new URLSearchParams();

    filterableOptions.forEach((category) => {
      const active = category.options
        .filter((o) => o.active)
        .map((o) => o.name);
      if (active.length > 0) currentParams.set(category.id, active.join(','));
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

  const closeModal = useCallback(() => setModalOpen(false), []);

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
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  const updateFilterOption = (
    optionName: string,
    updates: Partial<{ number: number; active: boolean }>,
  ) => setFilterOption(optionName, updates);

  const alterFiltersByCategory = (categoryId: string, activeStatus: boolean) =>
    bulkAlterCategoryOptions(categoryId, activeStatus);

  const clearAllFilters = () => resetAllFilters();

  // Collect all selected countries from all country-category filters
  const selectedCountries = filterableOptions
    .filter((cat) => cat.categoryType === 'country')
    .flatMap((cat) => cat.options.filter((o) => o.active).map((o) => o.name));

  const selectedEvents =
    filterableOptions
      .find((cat) => cat.id === 'event')
      ?.options.filter((o) => o.active)
      .map((o) => o.name) ?? [];

  let filteredArts = artworks.filter((artwork) => {
    const countryMatch = isValueInFilter(
      artwork.country,
      selectedCountries.length > 0 ? selectedCountries : undefined,
    );
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
      <ArtworkModal
        id={activeEntryId}
        artworks={artworks}
        closeModal={closeModal}
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
      <div className="relative z-0 m-auto w-screen max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Filter toggle + sort */}
        <div className="relative z-[100] flex justify-between">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex h-[50px] w-[200px] max-w-[40%] items-center justify-between rounded-md border border-gray-600 px-5 py-2 text-base font-medium"
          >
            {isFilterOpen ? 'Hide Filter' : 'Filter'}
            <span className="ml-6">
              <Menu size={18} />
            </span>
          </button>
          {!isMobile && (
            <div className="absolute right-0 w-[200px] max-w-[40%] rounded-lg bg-[#f9faf6]">
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
          className="relative z-[60] mt-4 grid"
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
                className="grid grid-cols-2 gap-x-2 gap-y-6 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10"
              >
                {pageData.map((artwork) => (
                  <div className="flex h-full" key={artwork.id}>
                    <ArtworkCard artwork={artwork} openModal={openModal} />
                  </div>
                ))}
              </div>
            )}
            <Pagination
              totalItems={filteredArts.length}
              currentPage={pageNumber}
              itemsPerPage={artworksPerPage}
              updatePageNumber={(_current, next) => setPageNumber(next)}
            />
          </section>

          {/* Filter panel */}
          <section
            className={`relative z-50 col-start-1 row-span-2 row-start-1 lg:col-span-5 lg:col-start-1 xl:col-span-4 xl:col-start-1 ${
              isFilterOpen
                ? 'pointer-events-auto visible duration-500 ease-in-out'
                : 'pointer-events-none invisible select-none duration-500 ease-in-out'
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
            updateFilterOption={updateFilterOption}
            clearAllFilters={clearAllFilters}
            dropdownActive={isFilterOpen}
          />
        </div>
      </div>
    </div>
  );
};

export const GalleryCore: React.FC = () => (
  <FilterProvider>
    <GalleryCoreInner />
  </FilterProvider>
);
