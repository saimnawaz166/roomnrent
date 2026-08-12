import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import IdUploadField from '../../components/ui/IdUploadField';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { PERIOD_LABELS } from '../../data/listings';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { formatDate } from '../../lib/date';

const STEPS = ['Basic Info', 'Verify ID', 'Review', 'Done'];

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListingById, submitApplication } = useAppData();
  const currentUser = useCurrentUser();
  const listing = getListingById(id);
  const neighborhood = listing && getNeighborhoodBySlug(listing.neighborhood);
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [moveInDate, setMoveInDate] = useState(() => formatDate(listing?.availableFrom) ?? 'September 1, 2026');
  const [note, setNote] = useState('');
  const [idFileName, setIdFileName] = useState(null);

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Listing not found" actionLabel="Browse Rooms" actionTo="/browse" />
      </div>
    );
  }

  const isDone = step === 3;

  function handleSubmit() {
    submitApplication({
      listingId: listing.id,
      renterName: currentUser.name,
      renterEmail: currentUser.email,
      moveInDate,
      note: note || 'Looking forward to hearing back!',
      idFileName,
    });
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 lg:py-20">
      <h1 className="font-display mb-2 text-center text-2xl font-extrabold">Apply for {listing.title}</h1>
      <p className="mb-10 text-center text-[14.5px] text-ink/55 dark:text-cream/55">
        {neighborhood?.name || listing.city} · ${listing.price}
        {PERIOD_LABELS[listing.period] || PERIOD_LABELS.month}
      </p>

      {isDone ? (
        <div className="rounded-3xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-8 py-16 text-center">
          <div className="font-display mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-sage-soft text-3xl font-extrabold text-sage-text">
            ✓
          </div>
          <h2 className="font-display mb-3 text-xl font-extrabold">Application submitted</h2>
          <p className="mx-auto mb-8 max-w-sm text-[15px] leading-relaxed text-ink/60 dark:text-cream/60">
            {listing.landlordName} will review your application and respond within 2–3 days. You can track its status
            from My Applications.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/dashboard')}>View My Applications</Button>
            <Button to="/browse" variant="outline">
              Browse More Rooms
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-10 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`mb-2 h-1.5 rounded-full ${i <= step ? 'bg-amber' : 'bg-border dark:bg-white/10'}`} />
                <div className={`text-xs font-bold ${i <= step ? 'text-ink dark:text-cream' : 'text-ink/35 dark:text-cream/35'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-9">
            {step === 0 && (
              <div>
                <h3 className="font-display mb-5 text-lg font-bold">Basic information</h3>
                <div className="flex flex-col gap-4">
                  <Field label="Full name" defaultValue={currentUser.name} />
                  <div className="flex gap-3.5">
                    <Field label="Email" defaultValue={currentUser.email} />
                    <Field label="Phone" defaultValue="(555) 010-2938" />
                  </div>
                  <div>
                    <div className="mb-1.5 text-[13px] font-bold">Desired move-in date</div>
                    <input
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 text-[13px] font-bold">Note to landlord (optional)</div>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="A short intro, why you're a good fit, anything they should know…"
                      className="w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="font-display mb-2 text-lg font-bold">Verify your identity</h3>
                <p className="mb-5 text-[13.5px] text-ink/55 dark:text-cream/55">
                  Only {listing.landlordName} sees this once you apply — it&apos;s never public.
                </p>
                <IdUploadField fileName={idFileName} onChange={setIdFileName} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="font-display mb-5 text-lg font-bold">Review &amp; submit</h3>
                <div className="mb-6 flex flex-col gap-3.5">
                  <ReviewRow label="Applicant" value={currentUser.name} />
                  <ReviewRow label="Move-in date" value={moveInDate} />
                  <ReviewRow label="ID uploaded" value={idFileName || 'Not uploaded'} />
                  <ReviewRow label="Listing" value={listing.title} last />
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] accent-amber"
                  />
                  I confirm this information is accurate and agree to the{' '}
                  <Link to="/terms" className="font-semibold underline hover:text-amber-dark" onClick={(e) => e.stopPropagation()}>
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))}>
              Back
            </Button>
            <Button
              disabled={step === 2 && !agreed}
              onClick={() => (step === 2 ? handleSubmit() : setStep((s) => Math.min(s + 1, 2)))}
            >
              {step === 2 ? 'Submit Application' : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, defaultValue }) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
      />
    </div>
  );
}

function ReviewRow({ label, value, last }) {
  return (
    <div className={`flex justify-between text-sm ${last ? '' : 'border-b border-border dark:border-white/10 pb-3.5'}`}>
      <span className="text-ink/55 dark:text-cream/55">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
