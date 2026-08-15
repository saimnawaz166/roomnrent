import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import LoadingState from '../../components/ui/LoadingState';
import DatePicker from '../../components/ui/DatePicker';
import { useRole, useCurrentUser } from '../../context/RoleContext';
import { useAppData } from '../../context/AppDataContext';
import {
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  LISTING_TYPE_DESCRIPTIONS,
  PARKING_LABELS,
  PET_LABELS,
  SMOKING_LABELS,
  BATHROOM_LABELS,
  AMENITIES,
} from '../../data/listings';
import { NEIGHBORHOODS, getNeighborhoodBySlug } from '../../data/neighborhoods';

const STEPS = ['Type', 'Location', 'Home details', 'Amenities', 'Photos', 'Pricing', 'Review'];
const LISTING_TYPE_KEYS = Object.keys(LISTING_TYPE_LABELS);

function toOptions(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }));
}

// Normalizes either an ISO "YYYY-MM-DD" value or an older free-text date
// (e.g. "December 31, 2026" from earlier seed data) into the format a native
// <input type="date"> can pre-fill. Falls back to blank if unparseable.
function toISODate(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

export default function ListingWizard() {
  const { role } = useRole();
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { addListing, updateListing, getListingById, listingsLoading, uploadListingPhoto, deleteListingPhoto } = useAppData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isEditing = Boolean(id);
  const existing = isEditing ? getListingById(id) : null;

  const [listingType, setListingType] = useState(existing?.listingType ?? 'spare-room');
  const [title, setTitle] = useState(existing?.title ?? 'Sunny room near downtown');
  const [roomType, setRoomType] = useState(existing?.type ?? 'Private Room');
  const [neighborhoodSlug, setNeighborhoodSlug] = useState(existing?.neighborhood ?? NEIGHBORHOODS[0].slug);
  const [address, setAddress] = useState(existing?.address ?? '');
  const [blurb, setBlurb] = useState(existing?.blurb ?? 'Describe the room, the home, and what makes it special…');

  const [bathroomType, setBathroomType] = useState(existing?.bathroomType ?? 'shared');
  const [minStay, setMinStay] = useState(existing?.minStay ?? '');
  const [deposit, setDeposit] = useState(String(existing?.deposit ?? '950'));
  const [parking, setParking] = useState(existing?.parking ?? 'none');
  const [petPolicy, setPetPolicy] = useState(existing?.petPolicy ?? 'no-pets');
  const [smokingPolicy, setSmokingPolicy] = useState(existing?.smokingPolicy ?? 'non-smoking');
  const [roommates, setRoommates] = useState(existing?.roommates ?? '');

  const [selectedAmenities, setSelectedAmenities] = useState(existing?.amenities ?? []);

  const [price, setPrice] = useState(String(existing?.price ?? '950'));
  const [period, setPeriod] = useState(existing?.period ?? 'month');
  const [availableFrom, setAvailableFrom] = useState(toISODate(existing?.availableFrom));
  const [furnished, setFurnished] = useState(existing?.furnished ?? false);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(existing?.utilitiesIncluded ?? false);
  const [leaseEndDate, setLeaseEndDate] = useState(toISODate(existing?.leaseEndDate));
  const [transferFee, setTransferFee] = useState(String(existing?.transferFee ?? '0'));

  // Photos already uploaded (only present when editing) vs. newly selected
  // files that haven't been uploaded yet — new files upload on Publish/Save,
  // once we're guaranteed to have a real listing id to attach them to.
  const [existingPhotos, setExistingPhotos] = useState(existing?.uploadedPhotos ?? []);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [removingPhotoId, setRemovingPhotoId] = useState(null);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    // Revoke local preview URLs on unmount so they don't leak.
    return () => newPhotoFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (role !== 'landlord') return <Navigate to="/dashboard" replace />;

  if (isEditing && listingsLoading) {
    return <LoadingState label="Loading listing…" />;
  }

  if (isEditing && !existing) {
    return (
      <div className="max-w-2xl">
        <EmptyState title="Listing not found" description="This listing may have already been removed." actionLabel="Back to My Listings" actionTo="/dashboard/listings" />
      </div>
    );
  }

  const isTakeover = listingType !== 'spare-room';
  const neighborhood = getNeighborhoodBySlug(neighborhoodSlug);

  function toggleAmenity(a) {
    setSelectedAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handleAddPhotos(e) {
    const files = Array.from(e.target.files || []);
    const withPreviews = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setNewPhotoFiles((prev) => [...prev, ...withPreviews]);
    e.target.value = '';
  }

  function removeNewPhoto(index) {
    setNewPhotoFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function removeExistingPhoto(photo) {
    setPhotoError('');
    setRemovingPhotoId(photo.id);
    try {
      await deleteListingPhoto(existing.id, photo);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      setPhotoError(err.message || 'Could not remove this photo.');
    } finally {
      setRemovingPhotoId(null);
    }
  }

  async function handlePublish() {
    const data = {
      title,
      neighborhood: neighborhoodSlug,
      city: neighborhood?.city,
      address,
      type: roomType,
      listingType,
      blurb,
      bathroomType,
      minStay,
      deposit: Number(deposit) || 0,
      parking,
      petPolicy,
      smokingPolicy,
      roommates,
      amenities: selectedAmenities,
      price: Number(price) || 0,
      period,
      availableFrom: availableFrom || null,
      furnished,
      utilitiesIncluded,
      landlordId: currentUser.id,
      landlordName: currentUser.name,
      landlordEmail: currentUser.email,
      ...(isTakeover ? { leaseEndDate, transferFee: Number(transferFee) || 0 } : { leaseEndDate: undefined, transferFee: undefined }),
    };

    setSubmitError('');
    setSubmitting(true);
    try {
      let targetId = id;
      if (isEditing) {
        await updateListing(id, data);
      } else {
        const listing = await addListing(data);
        targetId = listing.id;
      }
      for (let i = 0; i < newPhotoFiles.length; i += 1) {
        await uploadListingPhoto(targetId, newPhotoFiles[i].file, '', existingPhotos.length + i);
      }
      navigate(`/listings/${targetId}`);
    } catch (err) {
      setSubmitError(err.message || 'Could not save this listing. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-7 text-2xl font-extrabold">{isEditing ? 'Edit listing' : 'Create a new listing'}</h1>

      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`mb-2 h-1.5 rounded-full ${i <= step ? 'bg-amber' : 'bg-border dark:bg-white/10'}`} />
            <div
              className={`hidden text-[11px] font-bold sm:block ${i <= step ? 'text-ink dark:text-cream' : 'text-ink/35 dark:text-cream/35'}`}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-9">
        {step === 0 && (
          <div>
            <h3 className="font-display mb-1 text-lg font-bold">What are you listing?</h3>
            <p className="mb-5 text-[13.5px] text-ink/55 dark:text-cream/55">
              This determines which fields you'll fill in next.
            </p>
            <div className="flex flex-col gap-3">
              {LISTING_TYPE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setListingType(key)}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
                    listingType === key
                      ? 'border-amber bg-amber-soft'
                      : 'border-border dark:border-white/10 hover:bg-cream dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`text-[15px] font-bold ${listingType === key ? 'text-ink' : ''}`}>
                    {LISTING_TYPE_LABELS[key]}
                  </div>
                  <div className={`mt-1 text-[13px] ${listingType === key ? 'text-ink/70' : 'text-ink/55 dark:text-cream/55'}`}>
                    {LISTING_TYPE_DESCRIPTIONS[key]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display mb-1 text-lg font-bold">Location &amp; description</h3>
            <Field label="Listing title" value={title} onChange={setTitle} />
            <div className="flex gap-3.5">
              <Select label="Room type" value={roomType} onChange={setRoomType} options={LISTING_TYPES.map((t) => ({ value: t.label, label: t.label }))} />
              <Select
                label="Neighborhood"
                value={neighborhoodSlug}
                onChange={setNeighborhoodSlug}
                options={NEIGHBORHOODS.map((n) => ({ value: n.slug, label: `${n.name} — ${n.city}` }))}
              />
            </div>
            <Field
              label="Exact address"
              value={address}
              onChange={setAddress}
              placeholder="e.g. 620 Terry A Francois Blvd, San Francisco, CA 94158"
            />
            <p className="-mt-2.5 text-[12px] text-ink/45 dark:text-cream/45">
              Only shown to renters once you approve their application.
            </p>
            <div>
              <div className="mb-1.5 text-[13px] font-bold">Description</div>
              <textarea
                rows={3}
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                className="w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] text-ink/70 dark:text-cream/70 outline-none focus:border-ink/40"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display mb-1 text-lg font-bold">Home details</h3>
            <div className="flex gap-3.5">
              <Select label="Bathroom" value={bathroomType} onChange={setBathroomType} options={toOptions(BATHROOM_LABELS)} />
              <Field label="Minimum stay" value={minStay} onChange={setMinStay} placeholder="e.g. 3 months minimum" />
            </div>
            <div className="flex gap-3.5">
              <Field label="Deposit ($)" value={deposit} onChange={setDeposit} />
              <Select label="Parking" value={parking} onChange={setParking} options={toOptions(PARKING_LABELS)} />
            </div>
            <div className="flex gap-3.5">
              <Select label="Pet policy" value={petPolicy} onChange={setPetPolicy} options={toOptions(PET_LABELS)} />
              <Select label="Smoking policy" value={smokingPolicy} onChange={setSmokingPolicy} options={toOptions(SMOKING_LABELS)} />
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-bold">Who else lives in the home</div>
              <textarea
                rows={2}
                value={roommates}
                onChange={(e) => setRoommates(e.target.value)}
                placeholder="e.g. Landlord + 1 other renter share the home"
                className="w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] text-ink/70 dark:text-cream/70 outline-none focus:border-ink/40"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-display mb-1 text-lg font-bold">Amenities</h3>
            <p className="mb-5 text-[13.5px] text-ink/55 dark:text-cream/55">Select everything that applies.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AMENITIES.map((a) => {
                const checked = selectedAmenities.includes(a);
                return (
                  <label
                    key={a}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[14px] font-semibold transition-colors ${
                      checked ? 'border-amber bg-amber-soft' : 'border-border dark:border-white/10 hover:bg-cream dark:hover:bg-white/5'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleAmenity(a)} className="h-4 w-4 accent-amber" />
                    <span className={checked ? 'text-ink' : ''}>{a}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-display mb-1 text-lg font-bold">Photos</h3>
            <p className="mb-5 text-[13.5px] text-ink/55 dark:text-cream/55">
              Add a few real photos of the room — listings with photos get more applicants.
            </p>
            <div className="grid grid-cols-3 gap-3.5">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  <ImagePlaceholder src={photo.url} className="h-32" />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo)}
                    disabled={removingPhotoId === photo.id}
                    aria-label="Remove photo"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-xs font-bold text-cream hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newPhotoFiles.map((item, i) => (
                <div key={item.previewUrl} className="relative">
                  <ImagePlaceholder src={item.previewUrl} className="h-32" />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    aria-label="Remove photo"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-xs font-bold text-cream hover:bg-ink"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border dark:border-white/10 text-center text-[12px] font-semibold text-ink/50 dark:text-cream/50 hover:border-ink/30 dark:hover:border-cream/30">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddPhotos} />
                + Add photo
              </label>
            </div>
            {photoError && (
              <div className="mt-3 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
                {photoError}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-display mb-1 text-lg font-bold">Pricing &amp; availability</h3>
            <div className="flex gap-3.5">
              <Field label={`Rent (${period === 'week' ? 'per week' : 'per month'})`} value={price} onChange={setPrice} />
              <Select
                label="Billing period"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'month', label: 'Monthly' },
                  { value: 'week', label: 'Weekly' },
                ]}
              />
            </div>
            <DatePicker label="Available from" value={availableFrom} onChange={setAvailableFrom} />
            <div className="flex flex-wrap gap-5">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                <input
                  type="checkbox"
                  checked={furnished}
                  onChange={(e) => setFurnished(e.target.checked)}
                  className="h-4 w-4 accent-amber"
                />
                Furnished
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                <input
                  type="checkbox"
                  checked={utilitiesIncluded}
                  onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                  className="h-4 w-4 accent-amber"
                />
                Utilities included
              </label>
            </div>

            {isTakeover && (
              <div className="rounded-2xl border border-lavender/40 bg-lavender-soft p-4">
                <div className="mb-3 text-[13px] font-bold text-lavender-text">
                  {LISTING_TYPE_LABELS[listingType]} details
                </div>
                <div className="flex gap-3.5">
                  <DatePicker label="Current lease ends" value={leaseEndDate} onChange={setLeaseEndDate} />
                  <Field label="Transfer fee ($)" value={transferFee} onChange={setTransferFee} />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="font-display mb-5 text-lg font-bold">Review &amp; {isEditing ? 'save' : 'publish'}</h3>
            <div className="mb-5 flex gap-4 rounded-2xl border border-border dark:border-white/10 p-4">
              <ImagePlaceholder
                src={existingPhotos[0]?.url || newPhotoFiles[0]?.previewUrl}
                className="h-24 w-36 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[15px] font-bold">{title}</div>
                <div className="mt-1 text-[13px] text-ink/55 dark:text-cream/55">
                  {neighborhood?.name} · {roomType} · {LISTING_TYPE_LABELS[listingType]}
                </div>
                <div className="mt-2 font-bold">
                  ${price}/{period === 'week' ? 'wk' : 'mo'}
                </div>
                {isTakeover && (
                  <div className="mt-1 text-[12.5px] text-ink/55 dark:text-cream/55">
                    Lease ends {leaseEndDate || '—'} · Transfer fee ${transferFee}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3.5 text-[13px] sm:grid-cols-3">
              <ReviewItem label="Bathroom" value={BATHROOM_LABELS[bathroomType]} />
              <ReviewItem label="Parking" value={PARKING_LABELS[parking]} />
              <ReviewItem label="Pets" value={PET_LABELS[petPolicy]} />
              <ReviewItem label="Smoking" value={SMOKING_LABELS[smokingPolicy]} />
              <ReviewItem label="Deposit" value={`$${deposit}`} />
              <ReviewItem label="Amenities" value={selectedAmenities.length ? `${selectedAmenities.length} selected` : 'None'} />
            </div>
            <p className="text-[13.5px] text-ink/60 dark:text-cream/60">
              {isEditing
                ? 'Changes are saved immediately and reflected on the live listing.'
                : 'Your listing will be published immediately and appear in Browse right away.'}
            </p>
          </div>
        )}
      </div>

      {submitError && (
        <div className="mt-4 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
          {submitError}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => Math.max(s - 1, 0))}>
          Back
        </Button>
        <Button
          disabled={submitting}
          onClick={() => {
            if (step === STEPS.length - 1) handlePublish();
            else setStep((s) => Math.min(s + 1, STEPS.length - 1));
          }}
        >
          {step === STEPS.length - 1
            ? submitting
              ? 'Saving…'
              : isEditing
                ? 'Save Changes'
                : 'Publish Listing'
            : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-ink/50 dark:text-cream/50">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
