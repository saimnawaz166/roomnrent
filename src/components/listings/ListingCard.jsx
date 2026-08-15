import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import VerificationBadge from '../ui/VerificationBadge';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { PERIOD_LABELS, LISTING_TYPE_LABELS } from '../../data/listings';
import { getListingPhoto, getAvatarUrl } from '../../lib/photos';

export default function ListingCard({ listing, showType = false, showTags = false, compact = false }) {
  const neighborhood = getNeighborhoodBySlug(listing.neighborhood);
  const currentUser = useCurrentUser();
  const { isFavorited, toggleFavorite, getVerification } = useAppData();
  const saved = currentUser.role === 'renter' && isFavorited(currentUser.id, listing.id);
  const landlordVerification = getVerification(listing.landlordEmail);

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        <ImagePlaceholder
          label="Room photo"
          src={listing.uploadedPhotos?.[0]?.url || getListingPhoto(listing.id, 0)}
          alt={listing.title}
          className={compact ? 'h-32' : 'h-44'}
        />
        {showType && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">
            {listing.type}
          </span>
        )}
        {listing.listingType && listing.listingType !== 'spare-room' && (
          <span className="absolute left-3 bottom-3 rounded-full bg-lavender/90 px-2.5 py-1 text-[11px] font-bold text-ink">
            {LISTING_TYPE_LABELS[listing.listingType]}
          </span>
        )}
        {currentUser.role === 'renter' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(currentUser.id, listing.id);
            }}
            aria-label={saved ? 'Remove from saved' : 'Save this room'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-ink cursor-pointer"
          >
            {saved ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className={compact ? 'p-3.5' : 'p-4'}>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="font-display text-[15px] font-bold">
            ${listing.price}
            {PERIOD_LABELS[listing.period] || PERIOD_LABELS.month}
          </span>
          <span className="text-[12.5px] text-ink/55 dark:text-cream/55">★ {listing.rating}</span>
        </div>
        <div className="mb-0.5 line-clamp-1 text-sm font-semibold">{listing.title}</div>
        <div className="mb-2 text-[12.5px] text-ink/50 dark:text-cream/50">
          {neighborhood?.name || listing.city}
        </div>

        {listing.landlordName && (
          <div className="mb-2 flex items-center gap-1.5">
            <ImagePlaceholder
              shape="circle"
              src={getAvatarUrl(listing.landlordEmail)}
              alt={listing.landlordName}
              className="h-6 w-6 shrink-0"
            />
            <span className="truncate text-[12.5px] font-semibold text-ink/70 dark:text-cream/70">
              {listing.landlordName}
            </span>
            {landlordVerification.status === 'approved' && (
              <VerificationBadge status="approved" />
            )}
          </div>
        )}

        {showTags && listing.tags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border dark:border-white/10 bg-cream dark:bg-[#141414] px-2.5 py-1 text-[11px] font-semibold">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
