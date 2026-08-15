import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import VerificationBadge from '../../components/ui/VerificationBadge';
import ReviewForm from '../../components/ui/ReviewForm';
import ReviewCard from '../../components/ui/ReviewCard';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { statusTone } from '../../lib/tone';
import { getAvatarUrl } from '../../lib/photos';

export default function ApplicationDetail() {
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { applications, getListingById, updateApplicationStatus, getVerification, reviews, addReview, getSignedIdFileUrl } =
    useAppData();
  const app = applications.find((a) => a.id === id);

  if (!app) {
    return (
      <div className="max-w-2xl">
        <EmptyState title="Application not found" actionLabel="Back to dashboard" actionTo="/dashboard" />
      </div>
    );
  }

  const listing = getListingById(app.listingId);
  const verification = getVerification(app.renterEmail);
  const existingReview = reviews.find((r) => r.fromRole === 'landlord' && r.toName === app.renterName && r.listingId === app.listingId);

  async function handleViewIdFile() {
    try {
      const url = await getSignedIdFileUrl(app.idFileName);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.alert(err.message || 'Could not open this file.');
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/dashboard" className="mb-4 inline-block text-sm font-bold text-ink/55 dark:text-cream/55 hover:text-amber-dark">
        ← Back to dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Application from {app.renterName}</h1>
        <Badge tone={statusTone(app.status)}>{app.status}</Badge>
      </div>

      <div className="mb-6 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-7">
        <div className="mb-5 flex items-center gap-4">
          <ImagePlaceholder
            shape="circle"
            src={getAvatarUrl(app.renterEmail)}
            alt={app.renterName}
            className="h-14 w-14 shrink-0"
          />
          <div>
            <div className="font-bold">{app.renterName}</div>
            <VerificationBadge status={verification.status} />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 border-y border-border dark:border-white/10 py-5">
          <Detail label="Listing" value={listing?.title || 'Listing removed'} />
          <Detail label="Move-in date" value={app.moveInDate} />
          {app.idFileName ? (
            <div>
              <div className="text-xs text-ink/50 dark:text-cream/50">ID uploaded</div>
              <button type="button" onClick={handleViewIdFile} className="mt-1 cursor-pointer text-sm font-bold underline">
                View file
              </button>
            </div>
          ) : (
            <Detail label="ID uploaded" value="Not provided" />
          )}
          <Detail label="Applied" value={new Date(app.createdAt).toLocaleDateString()} />
        </div>

        <div className="mb-1.5 text-[13px] font-bold">Note from applicant</div>
        <p className="text-sm leading-relaxed text-ink/70 dark:text-cream/70">{app.note}</p>
      </div>

      {app.status === 'submitted' && (
        <div className="mb-6 flex gap-3">
          <Button onClick={() => updateApplicationStatus(app.id, 'approved')}>Approve</Button>
          <Button variant="outline" onClick={() => updateApplicationStatus(app.id, 'declined')}>
            Decline
          </Button>
        </div>
      )}

      {app.status === 'approved' && (
        <div className="mb-6">
          <h2 className="font-display mb-3 text-lg font-bold">Rate this renter</h2>
          {existingReview ? (
            <ReviewCard review={existingReview} />
          ) : (
            <ReviewForm
              label={`How was renting to ${app.renterName}?`}
              onSubmit={({ rating, text }) =>
                addReview({
                  listingId: app.listingId,
                  fromId: currentUser.id,
                  fromName: currentUser.name,
                  fromRole: 'landlord',
                  toId: app.renterId,
                  toName: app.renterName,
                  toRole: 'renter',
                  rating,
                  text,
                })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink/50 dark:text-cream/50">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}
