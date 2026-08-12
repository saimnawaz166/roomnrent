import Badge from './Badge';

const STATUS_MAP = {
  approved: { label: 'Verified', tone: 'sage' },
  pending: { label: 'Verification pending', tone: 'amber' },
  rejected: { label: 'Verification needed', tone: 'coral' },
};

export default function VerificationBadge({ status }) {
  const cfg = STATUS_MAP[status];
  if (!cfg) return null;
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
