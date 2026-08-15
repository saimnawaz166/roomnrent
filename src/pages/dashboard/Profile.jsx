import { useState } from 'react';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import IdUploadField from '../../components/ui/IdUploadField';
import VerificationBadge from '../../components/ui/VerificationBadge';
import { useCurrentUser } from '../../context/RoleContext';
import { useAppData } from '../../context/AppDataContext';
import { getAvatarUrl } from '../../lib/photos';
import { ROOMER_TAGS } from '../../data/roomers';
import { NEIGHBORHOODS } from '../../data/neighborhoods';

// Storage paths look like "userId/1699999999-my-id.jpg" — just the filename
// is friendlier to show than the full path.
function fileNameFromPath(path) {
  return path ? path.split('/').pop() : path;
}

export default function Profile() {
  const currentUser = useCurrentUser();
  const { getVerification, submitVerification, uploadIdFile, getSignedIdFileUrl } = useAppData();
  const [tab, setTab] = useState('account');
  const [pendingFile, setPendingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const verification = getVerification(currentUser.email);

  async function handleSubmitVerification() {
    setUploadError('');
    setSubmitting(true);
    try {
      const path = await uploadIdFile(pendingFile);
      await submitVerification(currentUser.email, path);
    } catch (err) {
      setUploadError(err.message || 'Could not upload your ID. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewFile() {
    try {
      const url = await getSignedIdFileUrl(verification.fileName);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setUploadError(err.message || 'Could not open this file.');
    }
  }

  const tabs = [
    { value: 'account', label: 'Account' },
    { value: 'verification', label: 'Verification' },
    ...(currentUser.role === 'renter' ? [{ value: 'roomer', label: 'Roomer Profile' }] : []),
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display mb-7 text-2xl font-extrabold">Profile settings</h1>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'account' ? (
        <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-8">
          <div className="mb-7 flex items-center gap-5">
            <ImagePlaceholder
              shape="circle"
              src={getAvatarUrl(currentUser.email)}
              alt={currentUser.name}
              className="h-20 w-20 shrink-0"
            />
            <Button variant="outline" size="sm">
              Change photo
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3.5">
              <Field label="Full name" defaultValue={currentUser.name} />
              <Field label="Email" defaultValue={currentUser.email} />
            </div>
            <Field label="Phone" defaultValue="(555) 010-2938" />
            <div>
              <div className="mb-1.5 text-[13px] font-bold">Bio</div>
              <textarea
                rows={3}
                placeholder="Tell others a bit about yourself…"
                className="w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
              />
            </div>
          </div>
          <Button className="mt-6">Save Changes</Button>
        </div>
      ) : tab === 'verification' ? (
        <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-8">
          <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-cream dark:bg-[#141414] px-4 py-4">
            <VerificationBadge status={verification.status === 'none' ? 'rejected' : verification.status} />
            {verification.status === 'approved' && verification.submittedAt && (
              <span className="text-[12.5px] text-ink/55 dark:text-cream/55">
                Approved · submitted {new Date(verification.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {verification.status === 'approved' ? (
            <p className="text-sm text-ink/60 dark:text-cream/60">
              Your identity is verified. File on record:{' '}
              <button type="button" onClick={handleViewFile} className="cursor-pointer font-semibold text-ink dark:text-cream underline">
                {fileNameFromPath(verification.fileName)}
              </button>
            </p>
          ) : verification.status === 'pending' ? (
            <p className="text-sm text-ink/60 dark:text-cream/60">
              Your ID (
              <button type="button" onClick={handleViewFile} className="cursor-pointer font-semibold text-ink dark:text-cream underline">
                {fileNameFromPath(verification.fileName)}
              </button>
              ) is under review. An admin will approve it shortly.
            </p>
          ) : (
            <div>
              <IdUploadField file={pendingFile} onChange={setPendingFile} />
              {uploadError && (
                <div className="mt-3 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
                  {uploadError}
                </div>
              )}
              <Button className="mt-4" disabled={!pendingFile || submitting} onClick={handleSubmitVerification}>
                {submitting ? 'Uploading…' : 'Submit for verification'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <RoomerProfileTab />
      )}
    </div>
  );
}

function RoomerProfileTab() {
  const { getMyRoomerProfile, upsertRoomerProfile, deleteRoomerProfile } = useAppData();
  const existing = getMyRoomerProfile();

  const [enabled, setEnabled] = useState(!!existing);
  const [age, setAge] = useState(existing?.age ?? '');
  const [occupation, setOccupation] = useState(existing?.occupation ?? '');
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [budgetMin, setBudgetMin] = useState(existing?.budgetMin ?? '');
  const [budgetMax, setBudgetMax] = useState(existing?.budgetMax ?? '');
  const [moveInDate, setMoveInDate] = useState(existing?.moveInDate ?? '');
  const [neighborhoods, setNeighborhoods] = useState(existing?.neighborhoods ?? []);
  const [tags, setTags] = useState(existing?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function toggleNeighborhood(slug) {
    setNeighborhoods((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }
  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSave() {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      if (!enabled) {
        if (existing) await deleteRoomerProfile();
      } else {
        await upsertRoomerProfile({
          age: age ? Number(age) : null,
          occupation,
          bio,
          budgetMin: budgetMin ? Number(budgetMin) : null,
          budgetMax: budgetMax ? Number(budgetMax) : null,
          moveInDate,
          neighborhoods,
          tags,
        });
      }
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save your Roomer profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-8">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-cream dark:bg-[#141414] px-5 py-4">
        <div>
          <div className="font-display font-bold">List me in Find a Roomer</div>
          <p className="mt-0.5 text-[12.5px] text-ink/55 dark:text-cream/55">
            Hosts with an active listing (and Pro subscribers) will be able to browse your profile and message you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          aria-pressed={enabled}
          className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${enabled ? 'bg-amber' : 'bg-border dark:bg-white/10'}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3.5">
            <Field label="Age" type="number" value={age} onChange={setAge} />
            <Field label="Occupation" value={occupation} onChange={setOccupation} placeholder="e.g. Grad student" />
          </div>
          <div>
            <div className="mb-1.5 text-[13px] font-bold">Bio</div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A couple sentences a host would want to know…"
              className="w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
            />
          </div>
          <div className="flex gap-3.5">
            <Field label="Budget min ($)" type="number" value={budgetMin} onChange={setBudgetMin} />
            <Field label="Budget max ($)" type="number" value={budgetMax} onChange={setBudgetMax} />
            <Field label="Move-in date" value={moveInDate} onChange={setMoveInDate} placeholder="e.g. September 1, 2026" />
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-bold">Preferred neighborhoods</div>
            <div className="flex flex-wrap gap-2">
              {NEIGHBORHOODS.map((n) => (
                <button
                  key={n.slug}
                  type="button"
                  onClick={() => toggleNeighborhood(n.slug)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    neighborhoods.includes(n.slug)
                      ? 'border-amber bg-amber text-ink'
                      : 'border-border dark:border-white/10 text-ink/60 dark:text-cream/60'
                  }`}
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-bold">Tags</div>
            <div className="flex flex-wrap gap-2">
              {ROOMER_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    tags.includes(tag)
                      ? 'border-amber bg-amber-soft text-amber-text'
                      : 'border-border dark:border-white/10 text-ink/60 dark:text-cream/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="mt-4 rounded-xl border border-sage/40 bg-sage-soft px-4 py-3 text-[13.5px] font-semibold text-sage-text">
          Saved.
        </div>
      )}

      <Button className="mt-6" disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  );
}

function Field({ label, defaultValue, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <input
        type={type}
        defaultValue={defaultValue}
        value={onChange ? value : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
      />
    </div>
  );
}
