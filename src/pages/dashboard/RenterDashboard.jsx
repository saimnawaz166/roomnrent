import { useParams } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import ListingCard from '../../components/listings/ListingCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { statusTone } from '../../lib/tone';
import { getAvatarUrl } from '../../lib/photos';

const VALID_TABS = ['overview', 'saved', 'applications'];

export default function RenterDashboard() {
  const { tab: tabParam } = useParams();
  const tab = VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const currentUser = useCurrentUser();
  const { listings, applications, favorites, getListingById, totalUnreadMessages } = useAppData();

  const myApplications = applications.filter((a) => a.renterEmail === currentUser.email);
  const savedListings = favorites
    .filter((f) => f.renterId === currentUser.id)
    .map((f) => getListingById(f.listingId))
    .filter(Boolean);
  const recommended = listings.filter((l) => l.status === 'live').slice(0, 3);

  return (
    <div>
      {tab === 'overview' && (
        <div>
          <div className="mb-8 flex items-center gap-3.5">
            <ImagePlaceholder
              shape="circle"
              src={getAvatarUrl(currentUser.email)}
              alt={currentUser.name}
              className="h-12 w-12 shrink-0"
            />
            <div>
              <h2 className="font-display text-xl font-extrabold">Welcome back, {currentUser.name.split(' ')[0]}</h2>
              <p className="text-[14.5px] text-ink/55 dark:text-cream/55">Here is what&apos;s happening with your search.</p>
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              label="Active applications"
              value={String(myApplications.filter((a) => a.status !== 'declined').length)}
            />
            <StatCard label="Saved listings" value={String(savedListings.length)} />
            <StatCard label="Unread messages" value={String(totalUnreadMessages)} />
          </div>
          <div className="font-display mb-4 text-[17px] font-bold">Recommended for you</div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {recommended.map((l) => (
              <ListingCard key={l.id} listing={l} compact />
            ))}
          </div>
        </div>
      )}

      {tab === 'saved' &&
        (savedListings.length === 0 ? (
          <EmptyState title="No saved listings yet" description="Rooms you save while browsing show up here." actionLabel="Browse Rooms" actionTo="/browse" />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {savedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ))}

      {tab === 'applications' &&
        (myApplications.length === 0 ? (
          <EmptyState title="No applications yet" description="Apply to a listing to see it here." actionLabel="Browse Rooms" actionTo="/browse" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-4 bg-cream dark:bg-[#141414] px-6 py-4 text-[12.5px] font-bold text-ink/55 dark:text-cream/55">
                <div>Listing</div>
                <div>Neighborhood</div>
                <div>Status</div>
                <div>Date applied</div>
              </div>
              {myApplications.map((app) => {
                const listing = getListingById(app.listingId);
                const neighborhood = listing && getNeighborhoodBySlug(listing.neighborhood);
                return (
                  <div key={app.id} className="grid grid-cols-4 items-center border-t border-border dark:border-white/10 px-6 py-4 text-sm">
                    <div className="font-semibold">{listing?.title || 'Listing removed'}</div>
                    <div className="text-ink/60 dark:text-cream/60">{neighborhood?.name || listing?.city}</div>
                    <div>
                      <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                    </div>
                    <div className="text-ink/60 dark:text-cream/60">{new Date(app.createdAt).toLocaleDateString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
