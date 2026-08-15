import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Wifi, WashingMachine, Thermometer, Car, Sofa, UtensilsCrossed, BadgeCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ReviewCard from '../../components/ui/ReviewCard';
import ReviewForm from '../../components/ui/ReviewForm';
import AdBox from '../../components/ads/AdBox';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import {
  AMENITIES,
  HOUSE_RULES,
  PARKING_LABELS,
  PET_LABELS,
  SMOKING_LABELS,
  BATHROOM_LABELS,
  PERIOD_LABELS,
  LISTING_TYPE_LABELS,
} from '../../data/listings';
import { SEED_HOUSEHOLD_MEMBERS } from '../../data/reviews';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { formatDate } from '../../lib/date';
import { getListingPhotos, getAvatarUrl } from '../../lib/photos';

const GALLERY_PHOTO_COUNT = 6;

const AMENITY_ICONS = {
  'WiFi included': Wifi,
  'In-unit laundry': WashingMachine,
  'Central heating/AC': Thermometer,
  'Street parking': Car,
  'Furnished room': Sofa,
  Dishwasher: UtensilsCrossed,
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getListingById,
    listingsLoading,
    isFavorited,
    toggleFavorite,
    getReviewsForListing,
    addReview,
    hasApprovedApplication,
    getOrCreateConversation,
  } = useAppData();
  const currentUser = useCurrentUser();
  const listing = getListingById(id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [messagingError, setMessagingError] = useState('');

  if (listingsLoading) {
    return <LoadingState label="Loading listing…" />;
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Listing not found" description="This listing may have been rented or removed." actionLabel="Browse Rooms" actionTo="/browse" />
      </div>
    );
  }

  async function handleMessageLandlord() {
    if (!currentUser.id) {
      navigate('/login', { state: { from: { pathname: `/listings/${listing.id}` } } });
      return;
    }
    setMessagingError('');
    try {
      const conversationId = await getOrCreateConversation(listing.landlordId, listing.id);
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      setMessagingError(err.message || 'Could not start a conversation. Please try again.');
    }
  }

  const neighborhood = getNeighborhoodBySlug(listing.neighborhood);
  const amenities = listing.amenities?.length ? listing.amenities : AMENITIES;
  const householdMembers = SEED_HOUSEHOLD_MEMBERS[listing.id] || [];
  const reviews = getReviewsForListing(listing.id);
  // Real uploads (from ListingWizard) win once at least one exists; the
  // deterministic stock-photo pool is just a stand-in for listings nobody
  // has added real photos to yet.
  let photos;
  if (listing.uploadedPhotos?.length > 0) {
    photos = listing.uploadedPhotos.map((p) => ({ url: p.url, caption: p.caption || listing.title }));
  } else {
    const captions = listing.photos?.length ? listing.photos.map((p) => p.caption) : ['Photo coming soon'];
    const photoUrls = getListingPhotos(listing.id, GALLERY_PHOTO_COUNT);
    photos = photoUrls.map((url, i) => ({ url, caption: captions[i % captions.length] }));
  }
  const saved = currentUser.role === 'renter' && isFavorited(currentUser.id, listing.id);
  const addressRevealed =
    currentUser.role === 'landlord' || (currentUser.role === 'renter' && hasApprovedApplication(currentUser.email, listing.id));
  const canReview = currentUser.role === 'renter' && hasApprovedApplication(currentUser.email, listing.id);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pb-2 pt-7 lg:px-10">
        <Link to="/browse" className="mb-4 inline-block text-sm font-bold text-ink/55 dark:text-cream/55 hover:text-amber-dark">
          ← Back to Browse
        </Link>

        <div className="relative h-[380px] overflow-hidden rounded-3xl">
          <ImagePlaceholder
            label={photos[photoIndex].caption}
            src={photos[photoIndex].url}
            alt={photos[photoIndex].caption}
            className="h-full rounded-none"
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-ink cursor-pointer"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-ink cursor-pointer"
                aria-label="Next photo"
              >
                ›
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3.5 py-2 text-xs font-bold text-cream">
                {photoIndex + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2">
            {photos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPhotoIndex(i)}
                aria-label={`View photo ${i + 1}: ${p.caption}`}
                className={`h-14 w-20 shrink-0 rounded-lg border-2 ${i === photoIndex ? 'border-amber' : 'border-transparent'}`}
              >
                <ImagePlaceholder src={p.url} alt={p.caption} className="h-full w-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-24 pt-10 lg:flex-row lg:px-10">
        <div className="flex-[1.6]">
          <div className="mb-1.5 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display mb-2 text-2xl font-extrabold lg:text-[28px]">{listing.title}</h1>
              <div className="text-[14.5px] text-ink/55 dark:text-cream/55">
                {neighborhood ? (
                  <Link to={`/neighborhoods/${neighborhood.slug}`} className="font-semibold hover:text-amber-dark">
                    {neighborhood.name}
                  </Link>
                ) : (
                  listing.city
                )}
                {' · '}
                {listing.type} · ★ {listing.rating} ({listing.reviews} reviews)
              </div>
              {listing.listingType && listing.listingType !== 'spare-room' && (
                <span className="mt-2 inline-block rounded-full bg-lavender-soft px-3 py-1 text-[12px] font-bold text-lavender-text">
                  {LISTING_TYPE_LABELS[listing.listingType]}
                </span>
              )}
            </div>
            <div className="flex shrink-0 gap-2.5">
              {currentUser.role === 'renter' && (
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(currentUser.id, listing.id)}>
                  {saved ? '♥ Saved' : '♡ Save'}
                </Button>
              )}
              <Button onClick={handleMessageLandlord} variant="outline" size="sm" className="border-ink">
                Message
              </Button>
            </div>
          </div>

          <div className="my-6 flex flex-wrap gap-7 border-y border-border dark:border-white/10 py-6">
            <Detail label="Room type" value={listing.type.replace(' Room', '')} />
            <Detail label="Bathroom" value={BATHROOM_LABELS[listing.bathroomType]} />
            <Detail label="Minimum stay" value={listing.minStay} />
            <Detail label="Deposit" value={`$${listing.deposit}`} />
          </div>

          <Section title="About this room">
            <p className="text-[14.5px] leading-[1.7] text-ink/70 dark:text-cream/70">{listing.blurb}</p>
          </Section>

          <Section title="Listing details">
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              <Detail label="Roommates" value={listing.roommates} />
              <Detail label="Parking" value={PARKING_LABELS[listing.parking]} />
              <Detail label="Pet policy" value={PET_LABELS[listing.petPolicy]} />
              <Detail label="Smoking policy" value={SMOKING_LABELS[listing.smokingPolicy]} />
              <Detail label="Furnished" value={listing.furnished ? 'Yes' : 'No'} />
              <Detail label="Utilities included" value={listing.utilitiesIncluded ? 'Yes' : 'No'} />
              <Detail label="Pets currently in home" value={listing.currentPetsPresent ? 'Yes' : 'No'} />
            </div>
            {listing.listingType && listing.listingType !== 'spare-room' && (
              <div className="mt-4 rounded-2xl border border-lavender/40 bg-lavender-soft px-5 py-4">
                <div className="mb-2 text-[13px] font-bold text-lavender-text">
                  {LISTING_TYPE_LABELS[listing.listingType]} — lease transfer details
                </div>
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                  <Detail label="Current lease ends" value={listing.leaseEndDate} />
                  <Detail label="Transfer fee" value={listing.transferFee ? `$${listing.transferFee}` : 'None'} />
                </div>
              </div>
            )}
          </Section>

          <Section title="Amenities">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {amenities.map((a) => {
                const Icon = AMENITY_ICONS[a] || BadgeCheck;
                return (
                  <div
                    key={a}
                    className="flex items-center gap-3 rounded-xl border border-border dark:border-white/10 bg-cream/50 px-3.5 py-3 text-sm font-semibold"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-text">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </span>
                    {a}
                  </div>
                );
              })}
            </div>
          </Section>

          {householdMembers.length > 0 && (
            <Section title="Current roommates">
              <div className="flex flex-wrap gap-4">
                {householdMembers.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border dark:border-white/10 px-4 py-3.5">
                    <ImagePlaceholder
                      shape="circle"
                      src={getAvatarUrl(r.id)}
                      alt={r.name}
                      className="h-11 w-11 shrink-0"
                    />
                    <div>
                      <div className="text-sm font-bold">{r.name}</div>
                      <div className="text-[12.5px] text-ink/55 dark:text-cream/55">{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="House rules">
            <div className="flex flex-col gap-2.5">
              {HOUSE_RULES.map((rule) => (
                <div key={rule} className="text-sm text-ink/70 dark:text-cream/70">
                  • {rule}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Location">
            <div className="flex items-center justify-center rounded-2xl border border-border dark:border-white/10 bg-cream dark:bg-[#141414] py-10 text-center">
              {addressRevealed ? (
                <div>
                  <div className="mb-1 text-lg">📍</div>
                  <div className="text-sm font-bold">{listing.address}</div>
                  <div className="mt-1 text-xs font-semibold text-sage-text">Shown because your application was approved</div>
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-lg">📍</div>
                  <div className="text-sm font-bold">{neighborhood?.name || listing.city} area</div>
                  <p className="mx-auto mt-2 max-w-sm text-[12.5px] text-ink/55 dark:text-cream/55">
                    The exact address is only shared once the landlord approves your application.
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Reviews">
            {reviews.length === 0 ? (
              <p className="text-sm text-ink/55 dark:text-cream/55">No reviews yet.</p>
            ) : (
              <div className="mb-4 flex flex-col gap-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
            {canReview && (
              <ReviewForm
                label="Rate your host"
                onSubmit={({ rating, text }) =>
                  addReview({
                    listingId: listing.id,
                    fromId: currentUser.id,
                    fromName: currentUser.name,
                    fromRole: 'renter',
                    toId: listing.landlordId,
                    toName: listing.landlordName,
                    toRole: 'landlord',
                    rating,
                    text,
                  })
                }
              />
            )}
          </Section>
        </div>

        <div className="w-full shrink-0 lg:w-[340px]">
          <div className="lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-6">
            <div className="rounded-3xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-7 shadow-sm">
              <div className="mb-5 flex items-baseline justify-between">
                <div className="font-display text-2xl font-extrabold">
                  ${listing.price}
                  <span className="text-sm font-semibold text-ink/50 dark:text-cream/50">
                    {PERIOD_LABELS[listing.period] || PERIOD_LABELS.month}
                  </span>
                </div>
                <div className="text-[13px] text-ink/55 dark:text-cream/55">
                  ★ {listing.rating} ({listing.reviews})
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-2.5">
                <InfoRow label="Move-in date" value={formatDate(listing.availableFrom) || 'September 1, 2026'} />
                <InfoRow label="Lease length" value={listing.minStay} />
              </div>

              <Row label={listing.period === 'week' ? 'Weekly rent' : 'Monthly rent'} value={`$${listing.price}`} />
              <Row label="Security deposit" value={`$${listing.deposit}`} last />

              <Button to={`/apply/${listing.id}`} size="lg" className="mt-5 mb-3 w-full">
                Apply Now
              </Button>
              <Button onClick={handleMessageLandlord} variant="outline" size="lg" className="w-full border-ink">
                Message Landlord
              </Button>
              {messagingError && <p className="mt-2 text-[12.5px] font-semibold text-coral-text">{messagingError}</p>}
            </div>

            <div className="mt-6 lg:mt-0">
              <AdBox placement="listing-detail" neighborhoodSlug={listing.neighborhood} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-display mb-3.5 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink/50 dark:text-cream/50">{label}</div>
      <div className="mt-1 text-[14.5px] font-bold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-border dark:border-white/10 px-3.5 py-3">
      <div className="text-[11px] font-bold text-ink/50 dark:text-cream/50">{label.toUpperCase()}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between text-[13.5px] text-ink/60 dark:text-cream/60 ${last ? 'mb-0' : 'mb-2'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
