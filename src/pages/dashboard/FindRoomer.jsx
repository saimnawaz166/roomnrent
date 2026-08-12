import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import RoomerCard from '../../components/roomers/RoomerCard';
import Button from '../../components/ui/Button';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { SEED_ROOMERS } from '../../data/roomers';
import { NEIGHBORHOODS } from '../../data/neighborhoods';

// Reverse of Browse: hosts browse Roomers (renters looking for a room) here
// instead of the other way around. Access is gated in three tiers — see
// AppDataContext's getHostAccessTier for the rules:
//   0 — no active listing: page is visible but every profile is locked/blurred.
//   1 — active listing (live or coming_soon): full profiles, but can only
//       message a roomer who already applied to one of this host's listings.
//   2 — active listing + subscription: can message anyone.
const TIER_PREVIEW_OPTIONS = [
  { tier: 0, label: 'Tier 0 · Locked' },
  { tier: 1, label: 'Tier 1 · Free' },
  { tier: 2, label: 'Tier 2 · Pro' },
];

export default function FindRoomer() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { getHostAccessTier, hasRoomerApplied } = useAppData();
  const [search, setSearch] = useState('');
  const [neighborhood, setNeighborhood] = useState('All');

  // Demo-only override so the 3 access tiers can be clicked through and shown
  // to the client without having to actually pause listings / toggle a real
  // subscription first. Defaults to whatever the account's real tier is.
  const realTier = getHostAccessTier(currentUser.email);
  const [previewTier, setPreviewTier] = useState(null);
  const tier = previewTier ?? realTier.tier;

  const roomers = useMemo(() => {
    return SEED_ROOMERS.filter((r) => {
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.occupation.toLowerCase().includes(search.toLowerCase());
      const matchesNeighborhood = neighborhood === 'All' || r.neighborhoods.includes(neighborhood);
      return matchesSearch && matchesNeighborhood;
    });
  }, [search, neighborhood]);

  return (
    <div>
      <div className="mb-2">
        <h1 className="font-display text-xl font-extrabold">Find a Roomer</h1>
        <p className="text-[14.5px] text-ink/55 dark:text-cream/55">
          Browse renters looking for a room and reach out directly — no waiting for applications.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-dashed border-ink/20 dark:border-cream/20 bg-cream/60 dark:bg-white/5 px-4 py-3">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink/40 dark:text-cream/40">
          Demo: preview a tier
        </span>
        <div className="flex gap-1 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-1">
          {TIER_PREVIEW_OPTIONS.map((opt) => (
            <button
              key={opt.tier}
              type="button"
              onClick={() => setPreviewTier(opt.tier)}
              className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
                tier === opt.tier
                  ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                  : 'text-ink/60 dark:text-cream/60 hover:bg-border dark:hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {tier === 0 && (
        <div className="my-6 flex flex-col items-start gap-4 rounded-2xl border border-amber/40 bg-amber-soft px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-text" strokeWidth={2.25} />
            <div>
              <div className="font-display font-bold text-amber-text">List a room to unlock Roomer profiles</div>
              <p className="mt-1 max-w-md text-[13.5px] text-ink/65 dark:text-cream/65">
                Real renters are actively looking right now. Post your first listing to see full profiles and start
                messaging them directly.
              </p>
            </div>
          </div>
          <Button to="/listings/new" className="w-full shrink-0 sm:w-auto">
            Create Listing
          </Button>
        </div>
      )}

      {tier === 1 && (
        <div className="my-6 flex flex-col items-start gap-4 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display font-bold">You're on the Free plan</div>
            <p className="mt-1 max-w-md text-[13.5px] text-ink/60 dark:text-cream/60">
              You can message Roomers who've already applied to one of your listings. Upgrade to message anyone in
              the directory, applied or not.
            </p>
          </div>
          <Button to="/subscription" className="w-full shrink-0 sm:w-auto">
            Upgrade to Pro
          </Button>
        </div>
      )}

      {tier === 2 && (
        <div className="my-6 flex flex-col items-start gap-4 rounded-2xl border border-sage/40 bg-sage-soft px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-text" strokeWidth={2.25} />
            <div>
              <div className="font-display font-bold text-sage-text">Pro plan active</div>
              <p className="mt-1 max-w-md text-[13.5px] text-ink/65 dark:text-cream/65">
                You can message any Roomer directly, whether or not they've applied to one of your listings.
              </p>
            </div>
          </div>
          <Button to="/subscription" variant="outline" size="sm" className="shrink-0">
            Manage subscription
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3.5 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or occupation…"
          className="flex-1 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-3 text-[14px] outline-none focus:border-ink/40"
        />
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="cursor-pointer rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[13.5px] font-bold outline-none"
        >
          <option value="All">All neighborhoods</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-[13.5px] text-ink/55 dark:text-cream/55">
        {roomers.length} roomer{roomers.length === 1 ? '' : 's'} found
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {roomers.map((r) =>
          tier === 0 ? (
            <RoomerCard key={r.id} roomer={r} locked />
          ) : (
            <RoomerCard
              key={r.id}
              roomer={r}
              canMessage={tier === 2 || hasRoomerApplied(currentUser.email, r.email)}
              onMessage={() => navigate('/messages')}
            />
          ),
        )}
      </div>

      {tier === 0 && (
        <p className="mt-8 text-center text-[12.5px] text-ink/40 dark:text-cream/40">
          Profiles shown above are locked previews — list a room to see real details.
        </p>
      )}
    </div>
  );
}
