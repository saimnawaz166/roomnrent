import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, Heart, Building2, Users as UsersIcon, Ban, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import EmptyState from '../../components/ui/EmptyState';
import ListingCard from '../../components/listings/ListingCard';
import VerificationBadge from '../../components/ui/VerificationBadge';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { statusTone } from '../../lib/tone';
import { getAvatarUrl } from '../../lib/photos';

export default function UserDetail() {
  const { email: encodedEmail } = useParams();
  const email = decodeURIComponent(encodedEmail);
  const currentUser = useCurrentUser();
  const { listings, applications, favorites, platformUsers, getListingById, getVerification, getSignedIdFileUrl, updateUserStatus } =
    useAppData();
  const [statusUpdating, setStatusUpdating] = useState(false);

  const directoryEntry = platformUsers.find((u) => u.email === email);
  const myListings = listings.filter((l) => l.landlordEmail === email);
  const isLandlord = directoryEntry ? directoryEntry.role === 'landlord' : myListings.length > 0;

  const verification = getVerification(email);
  const name = directoryEntry?.name || applications.find((a) => a.renterEmail === email)?.renterName || email;

  if (!directoryEntry && myListings.length === 0 && !applications.some((a) => a.renterEmail === email) && verification.status === 'none') {
    return (
      <div className="max-w-2xl">
        <EmptyState title="User not found" description="We don't have any record of this account." actionLabel="Back to Users" actionTo="/admin/users" />
      </div>
    );
  }

  async function handleViewIdFile() {
    try {
      const url = await getSignedIdFileUrl(verification.fileName);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.alert(err.message || 'Could not open this file.');
    }
  }

  async function handleToggleStatus() {
    const nextStatus = directoryEntry.status === 'suspended' ? 'active' : 'suspended';
    const verb = nextStatus === 'suspended' ? 'suspend' : 'reactivate';
    if (!window.confirm(`${verb === 'suspend' ? 'Suspend' : 'Reactivate'} ${name}'s account?`)) return;
    setStatusUpdating(true);
    try {
      await updateUserStatus(email, nextStatus);
    } catch (err) {
      window.alert(err.message || `Could not ${verb} this account.`);
    } finally {
      setStatusUpdating(false);
    }
  }

  // Renter-side data
  const myApplications = applications.filter((a) => a.renterEmail === email);
  const savedListings = favorites
    .filter((f) => f.renterId === directoryEntry?.id)
    .map((f) => getListingById(f.listingId))
    .filter(Boolean);

  // Landlord-side data
  const myListingIds = new Set(myListings.map((l) => l.id));
  const receivedApplications = applications.filter((a) => myListingIds.has(a.listingId));

  return (
    <div className="max-w-3xl">
      <Link to="/admin/users" className="mb-4 inline-block text-sm font-bold text-ink/55 dark:text-cream/55 hover:text-amber-dark">
        ← Back to Users
      </Link>

      <div className="mb-7 flex flex-wrap items-center gap-4 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-6">
        <ImagePlaceholder shape="circle" src={getAvatarUrl(email)} alt={name} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-bold">{name}</div>
          <div className="truncate text-[13.5px] text-ink/55 dark:text-cream/55">{email}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isLandlord ? 'lavender' : 'amber'}>{isLandlord ? 'Landlord' : 'Renter'}</Badge>
          {directoryEntry && <Badge tone={statusTone(directoryEntry.status)}>{directoryEntry.status}</Badge>}
          <VerificationBadge status={verification.status === 'none' ? 'rejected' : verification.status} />
          {directoryEntry && directoryEntry.email !== currentUser.email && (
            <Button
              size="sm"
              variant="outline"
              disabled={statusUpdating}
              onClick={handleToggleStatus}
              className={directoryEntry.status === 'suspended' ? '' : 'border-coral-text text-coral-text hover:bg-coral-soft'}
            >
              {directoryEntry.status === 'suspended' ? (
                <>
                  <CheckCircle2 className="h-[15px] w-[15px]" strokeWidth={2.25} /> Reactivate
                </>
              ) : (
                <>
                  <Ban className="h-[15px] w-[15px]" strokeWidth={2.25} /> Suspend
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {verification.status !== 'none' && (
        <div className="mb-7 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-5">
          <div className="mb-1 text-[13px] font-bold">Identity verification</div>
          <p className="text-[13.5px] text-ink/60 dark:text-cream/60">
            File on record:{' '}
            {verification.fileName ? (
              <button type="button" onClick={handleViewIdFile} className="cursor-pointer font-bold text-ink dark:text-cream underline">
                {verification.fileName.split('/').pop()}
              </button>
            ) : (
              <strong>Not provided</strong>
            )}
            {verification.submittedAt && (
              <> · submitted {new Date(verification.submittedAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
      )}

      {isLandlord ? (
        <LandlordHistory listings={myListings} applications={receivedApplications} getListingById={getListingById} />
      ) : (
        <RenterHistory applications={myApplications} savedListings={savedListings} getListingById={getListingById} />
      )}
    </div>
  );
}

function RenterHistory({ applications, savedListings, getListingById }) {
  return (
    <div>
      <div className="mb-7 grid grid-cols-2 gap-4">
        <StatCard label="Applications" value={String(applications.length)} icon={ClipboardList} tone="amber" />
        <StatCard label="Saved listings" value={String(savedListings.length)} icon={Heart} tone="coral" />
      </div>

      <div className="font-display mb-3.5 font-bold">Application history</div>
      {applications.length === 0 ? (
        <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">No applications submitted.</p>
      ) : (
        <div className="mb-7 overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
          {applications.map((app) => {
            const listing = getListingById(app.listingId);
            const neighborhood = listing && getNeighborhoodBySlug(listing.neighborhood);
            return (
              <div
                key={app.id}
                className="flex flex-col gap-2 border-t border-border dark:border-white/10 px-6 py-4 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{listing?.title || 'Listing removed'}</div>
                  <div className="text-[12.5px] text-ink/55 dark:text-cream/55">
                    {neighborhood?.name || listing?.city} · Applied {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge tone={statusTone(app.status)}>{app.status}</Badge>
              </div>
            );
          })}
        </div>
      )}

      <div className="font-display mb-3.5 font-bold">Saved listings</div>
      {savedListings.length === 0 ? (
        <p className="text-sm text-ink/55 dark:text-cream/55">No saved listings.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {savedListings.map((l) => (
            <ListingCard key={l.id} listing={l} compact />
          ))}
        </div>
      )}
    </div>
  );
}

function LandlordHistory({ listings, applications, getListingById }) {
  return (
    <div>
      <div className="mb-7 grid grid-cols-2 gap-4">
        <StatCard label="Listings" value={String(listings.length)} icon={Building2} tone="lavender" />
        <StatCard label="Applications received" value={String(applications.length)} icon={UsersIcon} tone="sage" />
      </div>

      <div className="font-display mb-3.5 font-bold">Listings</div>
      {listings.length === 0 ? (
        <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">No listings yet.</p>
      ) : (
        <div className="mb-7 overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
          {listings.map((l) => {
            const count = applications.filter((a) => a.listingId === l.id).length;
            return (
              <Link
                key={l.id}
                to={`/listings/${l.id}`}
                className="flex items-center justify-between gap-3 border-t border-border dark:border-white/10 px-6 py-4 text-sm first:border-t-0 hover:bg-cream dark:hover:bg-white/5"
              >
                <div className="min-w-0 truncate font-semibold">{l.title}</div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-ink/55 dark:text-cream/55">{count} applicant{count === 1 ? '' : 's'}</span>
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="font-display mb-3.5 font-bold">Applications received</div>
      {applications.length === 0 ? (
        <p className="text-sm text-ink/55 dark:text-cream/55">No applications yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
          {applications.map((app) => {
            const listing = getListingById(app.listingId);
            return (
              <div
                key={app.id}
                className="flex flex-col gap-2 border-t border-border dark:border-white/10 px-6 py-4 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{app.renterName}</div>
                  <div className="text-[12.5px] text-ink/55 dark:text-cream/55">{listing?.title || 'Listing removed'}</div>
                </div>
                <Badge tone={statusTone(app.status)}>{app.status}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
