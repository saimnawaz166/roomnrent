import { useEffect, useMemo, useState } from 'react';
import ListingCard from '../../components/listings/ListingCard';
import Button from '../../components/ui/Button';
import AdBox from '../../components/ads/AdBox';
import { useAppData } from '../../context/AppDataContext';
import { NEIGHBORHOODS, getNeighborhoodBySlug } from '../../data/neighborhoods';
import { LISTING_TYPE_LABELS } from '../../data/listings';

const FILTER_TYPES = ['Private Room', 'Shared Room', 'Studio', 'Entire Unit'];
const FILTER_AMENITIES = ['Furnished', 'Utilities included', 'Pet friendly', 'Parking'];
const LISTING_TYPE_KEYS = Object.keys(LISTING_TYPE_LABELS);

function matchesAmenity(listing, amenity) {
  if (amenity === 'Furnished') return !!listing.furnished;
  if (amenity === 'Utilities included') return !!listing.utilitiesIncluded;
  if (amenity === 'Pet friendly') return listing.petPolicy && listing.petPolicy !== 'no-pets';
  if (amenity === 'Parking') return listing.parking && listing.parking !== 'none';
  return true;
}
const SORT_OPTIONS = [
  'Recommended',
  'Price: Low to High',
  'Price: High to Low',
  'Top rated',
  'Most reviewed',
  'Newest listings',
];
const PRICE_MIN = 500;
const PRICE_MAX = 2000;
const PRICE_STEP = 25;
const PAGE_SIZE = 6;

export default function Browse() {
  const { listings: allListings } = useAppData();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeType, setActiveType] = useState(null);
  const [activeListingType, setActiveListingType] = useState('All');
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [activeNeighborhood, setActiveNeighborhood] = useState('All');
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [sortBy, setSortBy] = useState('Recommended');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const listings = useMemo(() => {
    let result = allListings.filter((l) => {
      const matchesLive = l.status === 'live';
      const matchesType = !activeType || l.type === activeType;
      const matchesListingType = activeListingType === 'All' || l.listingType === activeListingType;
      const matchesNeighborhood = activeNeighborhood === 'All' || l.neighborhood === activeNeighborhood;
      const matchesPrice = l.price >= priceRange[0] && l.price <= priceRange[1];
      const matchesAmenities = activeAmenities.every((a) => matchesAmenity(l, a));
      const neighborhoodName = getNeighborhoodBySlug(l.neighborhood)?.name || '';
      const matchesSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        neighborhoodName.toLowerCase().includes(search.toLowerCase());
      return (
        matchesLive &&
        matchesType &&
        matchesListingType &&
        matchesNeighborhood &&
        matchesPrice &&
        matchesAmenities &&
        matchesSearch
      );
    });
    if (sortBy === 'Price: Low to High') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'Top rated') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'Most reviewed') result = [...result].sort((a, b) => b.reviews - a.reviews);
    if (sortBy === 'Newest listings') result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [allListings, activeType, activeListingType, activeAmenities, activeNeighborhood, priceRange, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const pagedListings = useMemo(
    () => listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [listings, page],
  );

  // Any change to filters/sort can shrink the result set or shift it entirely —
  // snap back to a page that still exists instead of showing blank.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3.5 px-6 pt-8 pb-3 sm:flex-row sm:items-center lg:px-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city, neighborhood, or ZIP…"
          className="flex-1 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-3.5 text-[14.5px] outline-none focus:border-ink/40"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="rounded-2xl border border-ink px-5 py-3.5 text-sm font-bold cursor-pointer hover:bg-white dark:border-cream/30 dark:hover:bg-white/10"
        >
          Filters
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-24 pt-4 lg:flex-row lg:px-10">
        {filtersOpen && (
          <aside className="w-full shrink-0 self-start rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-6 lg:w-64">
            <div className="font-display mb-5 font-bold">Filters</div>

            <div className="mb-6">
              <div className="mb-2.5 text-[13px] font-bold">Price range</div>
              <div className="relative flex h-5 items-center">
                <div className="h-1 w-full rounded-full bg-border">
                  <div
                    className="h-1 rounded-full bg-amber"
                    style={{
                      marginLeft: `${((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange(([, max]) => [Math.min(Number(e.target.value), max - PRICE_STEP), max])
                  }
                  aria-label="Minimum price"
                  className="range-thumb absolute inset-x-0 top-0 h-5 w-full cursor-pointer"
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange(([min]) => [min, Math.max(Number(e.target.value), min + PRICE_STEP)])
                  }
                  aria-label="Maximum price"
                  className="range-thumb absolute inset-x-0 top-0 h-5 w-full cursor-pointer"
                />
              </div>
              <div className="mt-3 flex justify-between text-[12.5px] text-ink/55 dark:text-cream/55">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}{priceRange[1] === PRICE_MAX ? '+' : ''}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2.5 text-[13px] font-bold">Neighborhood</div>
              <select
                value={activeNeighborhood}
                onChange={(e) => setActiveNeighborhood(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border dark:border-white/10 px-3.5 py-2.5 text-[13.5px] outline-none"
              >
                <option value="All">All neighborhoods</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="mb-2.5 text-[13px] font-bold">Room type</div>
              {FILTER_TYPES.map((type) => (
                <label key={type} className="mb-2 flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                  <input
                    type="checkbox"
                    checked={activeType === type}
                    onChange={() => setActiveType(activeType === type ? null : type)}
                    className="h-4 w-4 accent-amber"
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="mb-6">
              <div className="mb-2.5 text-[13px] font-bold">Listing category</div>
              <label className="mb-2 flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                <input
                  type="radio"
                  name="listingCategory"
                  checked={activeListingType === 'All'}
                  onChange={() => setActiveListingType('All')}
                  className="h-4 w-4 accent-amber"
                />
                All listing types
              </label>
              {LISTING_TYPE_KEYS.map((key) => (
                <label key={key} className="mb-2 flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                  <input
                    type="radio"
                    name="listingCategory"
                    checked={activeListingType === key}
                    onChange={() => setActiveListingType(key)}
                    className="h-4 w-4 accent-amber"
                  />
                  {LISTING_TYPE_LABELS[key]}
                </label>
              ))}
            </div>

            <div className="mb-6">
              <div className="mb-2.5 text-[13px] font-bold">Amenities</div>
              {FILTER_AMENITIES.map((a) => (
                <label key={a} className="mb-2 flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                  <input
                    type="checkbox"
                    checked={activeAmenities.includes(a)}
                    onChange={() =>
                      setActiveAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
                    }
                    className="h-4 w-4 accent-amber"
                  />
                  {a}
                </label>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setActiveType(null);
                setActiveListingType('All');
                setActiveAmenities([]);
                setActiveNeighborhood('All');
                setPriceRange([PRICE_MIN, PRICE_MAX]);
                setSearch('');
              }}
            >
              Clear all
            </Button>
          </aside>
        )}

        <div className="flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[14.5px] text-ink/60 dark:text-cream/60">{listings.length} rooms available</div>
            <div className="flex items-center gap-2.5 text-[13.5px]">
              <span className="text-ink/50 dark:text-cream/50">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-3.5 py-2 font-bold outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {pagedListings.length === 0 ? (
            <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] py-20 text-center text-sm text-ink/55 dark:text-cream/55">
              No listings match your filters. Try clearing them.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pagedListings.flatMap((l, i) => [
                <ListingCard key={l.id} listing={l} showType showTags />,
                i === 2 && (
                  <div key="ad" className="sm:col-span-2 xl:col-span-1">
                    <AdBox placement="browse-neighborhoods" />
                  </div>
                ),
              ])}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-11 flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-[13.5px] font-bold cursor-pointer ${
                    page === p ? 'bg-amber text-ink' : 'text-ink/60 dark:text-cream/60 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
