import { useState } from 'react';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import IdUploadField from '../../components/ui/IdUploadField';
import VerificationBadge from '../../components/ui/VerificationBadge';
import { useCurrentUser } from '../../context/RoleContext';
import { useAppData } from '../../context/AppDataContext';
import { getAvatarUrl } from '../../lib/photos';

const TABS = [
  { value: 'account', label: 'Account' },
  { value: 'verification', label: 'Verification' },
];

export default function Profile() {
  const currentUser = useCurrentUser();
  const { getVerification, submitVerification } = useAppData();
  const [tab, setTab] = useState('account');
  const [pendingFile, setPendingFile] = useState(null);
  const verification = getVerification(currentUser.email);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display mb-7 text-2xl font-extrabold">Profile settings</h1>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

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
      ) : (
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
              Your identity is verified. File on record: <strong>{verification.fileName}</strong>
            </p>
          ) : verification.status === 'pending' ? (
            <p className="text-sm text-ink/60 dark:text-cream/60">
              Your ID (<strong>{verification.fileName}</strong>) is under review. An admin will approve it shortly.
            </p>
          ) : (
            <div>
              <IdUploadField fileName={pendingFile} onChange={setPendingFile} />
              <Button
                className="mt-4"
                disabled={!pendingFile}
                onClick={() => submitVerification(currentUser.email, pendingFile)}
              >
                Submit for verification
              </Button>
            </div>
          )}
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
