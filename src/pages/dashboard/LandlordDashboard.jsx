import { Link, useParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { LISTING_STATUS_LABELS, PERIOD_LABELS, ACTIVE_LISTING_STATUSES } from '../../data/listings';
import { CHART_BARS } from '../../data/admin';
import { statusTone } from '../../lib/tone';
import { getAvatarUrl } from '../../lib/photos';

const VALID_TABS = ['overview', 'listings', 'applicants'];

export default function LandlordDashboard() {
  const { tab: tabParam } = useParams();
  const tab = VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const currentUser = useCurrentUser();
  const { listings, applications, updateListingStatus, deleteListing, updateApplicationStatus } = useAppData();
  const maxBar = Math.max(...CHART_BARS);

  function handleDelete(listing) {
    if (window.confirm(`Remove "${listing.title}"? This can't be undone.`)) {
      deleteListing(listing.id);
    }
  }

  const myListings = listings.filter((l) => l.landlordEmail === currentUser.email);
  const myListingIds = new Set(myListings.map((l) => l.id));
  const myApplicants = applications.filter((a) => myListingIds.has(a.listingId));
  const pendingApplicants = myApplicants.filter((a) => a.status === 'submitted');

  return (
    <div>
      <div className="mb-7 flex items-start justify-between gap-4">
        {tab === 'overview' ? (
          <div className="flex items-center gap-3.5">
            <ImagePlaceholder
              shape="circle"
              src={getAvatarUrl(currentUser.email)}
              alt={currentUser.name}
              className="h-12 w-12 shrink-0"
            />
            <div>
              <h2 className="font-display text-xl font-extrabold">Welcome back, {currentUser.name.split(' ')[0]}</h2>
              <p className="text-[14.5px] text-ink/55 dark:text-cream/55">Manage your listings and applications.</p>
            </div>
          </div>
        ) : (
          <div />
        )}
        <Button to="/listings/new" className="whitespace-nowrap">
          + Create Listing
        </Button>
      </div>

      {tab === 'overview' && (
        <div>
          <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Active listings"
              value={String(myListings.filter((l) => ACTIVE_LISTING_STATUSES.includes(l.status)).length)}
            />
            <StatCard label="New applications" value={String(pendingApplicants.length)} />
            <StatCard label="Monthly revenue" value="$3,850" />
            <StatCard label="Total views (30d)" value="2,140" />
          </div>

          <div className="mb-7 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-7">
            <div className="font-display mb-5 font-bold">Views this month</div>
            <div className="flex h-36 items-end gap-3">
              {CHART_BARS.map((v, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-amber" style={{ height: `${(v / maxBar) * 100}%` }} />
              ))}
            </div>
          </div>

          <div className="font-display mb-3.5 font-bold">Recent applications</div>
          {myApplicants.length === 0 ? (
            <p className="text-sm text-ink/55 dark:text-cream/55">No applications yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
              {myApplicants.slice(0, 3).map((app) => (
                <ApplicantRow key={app.id} app={app} listing={listings.find((l) => l.id === app.listingId)} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'listings' &&
        (myListings.length === 0 ? (
          <EmptyState title="No listings yet" description="Create your first listing to see it here." actionLabel="Create Listing" actionTo="/listings/new" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-3 bg-cream dark:bg-[#141414] px-6 py-4 text-[12.5px] font-bold text-ink/55 dark:text-cream/55">
                <div>Listing</div>
                <div>Price</div>
                <div>Status</div>
                <div>Applications</div>
                <div className="text-right">Actions</div>
              </div>
              {myListings.map((l) => {
                const count = applications.filter((a) => a.listingId === l.id).length;
                return (
                  <div
                    key={l.id}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] items-center gap-3 border-t border-border dark:border-white/10 px-6 py-4 text-sm"
                  >
                    <div className="truncate font-semibold">{l.title}</div>
                    <div>
                      ${l.price}
                      {PERIOD_LABELS[l.period] || PERIOD_LABELS.month}
                    </div>
                    <div>
                      <select
                        value={l.status}
                        onChange={(e) => updateListingStatus(l.id, e.target.value)}
                        className="cursor-pointer rounded-lg border border-border dark:border-white/10 px-2.5 py-1.5 text-xs font-bold outline-none"
                      >
                        {Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-ink/60 dark:text-cream/60">{count}</div>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/listings/${l.id}`}
                        aria-label={`View ${l.title}`}
                        title="View"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors hover:bg-cream dark:hover:bg-white/10 hover:text-ink dark:hover:text-cream"
                      >
                        <Eye className="h-[17px] w-[17px]" strokeWidth={2.25} />
                      </Link>
                      <Link
                        to={`/listings/${l.id}/edit`}
                        aria-label={`Edit ${l.title}`}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors hover:bg-amber-soft hover:text-amber-text"
                      >
                        <Pencil className="h-[16px] w-[16px]" strokeWidth={2.25} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(l)}
                        aria-label={`Remove ${l.title}`}
                        title="Remove"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors hover:bg-coral-soft hover:text-coral-text"
                      >
                        <Trash2 className="h-[16px] w-[16px]" strokeWidth={2.25} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {tab === 'applicants' &&
        (myApplicants.length === 0 ? (
          <p className="text-sm text-ink/55 dark:text-cream/55">No applicants yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
            {myApplicants.map((app) => (
              <ApplicantRow
                key={app.id}
                app={app}
                listing={listings.find((l) => l.id === app.listingId)}
                onApprove={() => updateApplicationStatus(app.id, 'approved')}
                onDecline={() => updateApplicationStatus(app.id, 'declined')}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

function ApplicantRow({ app, listing, onApprove, onDecline }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border dark:border-white/10 px-6 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <ImagePlaceholder
          shape="circle"
          src={getAvatarUrl(app.renterEmail)}
          alt={app.renterName}
          className="h-10 w-10 shrink-0"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{app.renterName}</div>
          <div className="truncate text-[12.5px] text-ink/55 dark:text-cream/55">{listing?.title || 'Listing removed'}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(app.status)}>{app.status}</Badge>
        {app.status === 'submitted' && onApprove && onDecline ? (
          <>
            <Button size="sm" onClick={onApprove}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={onDecline}>
              Decline
            </Button>
          </>
        ) : (
          <Button to={`/applications/${app.id}`} variant="outline" size="sm">
            View
          </Button>
        )}
      </div>
    </div>
  );
}
