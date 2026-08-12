import { Link, useParams } from 'react-router-dom';
import ListingCard from '../../components/listings/ListingCard';
import EmptyState from '../../components/ui/EmptyState';
import AdBox from '../../components/ads/AdBox';
import { useAppData } from '../../context/AppDataContext';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';

export default function NeighborhoodPage() {
  const { slug } = useParams();
  const { getListingsByNeighborhood } = useAppData();
  const neighborhood = getNeighborhoodBySlug(slug);
  const listings = neighborhood ? getListingsByNeighborhood(slug).filter((l) => l.status === 'live') : [];

  if (!neighborhood) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Neighborhood not found" actionLabel="Browse Rooms" actionTo="/browse" />
      </div>
    );
  }

  return (
    <div>
      <section className="bg-ink px-6 py-16 text-center lg:px-10">
        <h1 className="font-display mb-3 text-3xl font-extrabold text-cream lg:text-4xl">{neighborhood.name}</h1>
        <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-cream/80">{neighborhood.intro}</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <AdBox placement="browse-neighborhoods" neighborhoodSlug={slug} variant="horizontal" />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-extrabold">
            {listings.length} room{listings.length === 1 ? '' : 's'} in {neighborhood.name}
          </h2>
          <Link to="/browse" className="text-sm font-bold hover:text-amber-dark">
            Browse all rooms →
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title="No rooms here yet"
            description="Check back soon, or browse rooms in other neighborhoods."
            actionLabel="Browse Rooms"
            actionTo="/browse"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} showType showTags />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
