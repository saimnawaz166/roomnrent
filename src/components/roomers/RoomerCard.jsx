import { Lock, MessageCircle } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import VerificationBadge from '../ui/VerificationBadge';
import { getNeighborhoodBySlug } from '../../data/neighborhoods';
import { getAvatarUrl } from '../../lib/photos';

// Renders either a full Roomer profile or a locked/silhouette teaser,
// depending on the viewing host's access tier — see AppDataContext's
// getHostAccessTier/canMessageRoomer for the tier rules.
export default function RoomerCard({ roomer, locked = false, canMessage = false, onMessage }) {
  if (locked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
        <div className="pointer-events-none select-none opacity-40 blur-[6px]">
          <ImagePlaceholder src={getAvatarUrl(roomer.email)} className="h-40 rounded-none" />
          <div className="p-4">
            <div className="mb-1.5 h-4 w-2/3 rounded bg-ink/20 dark:bg-cream/20" />
            <div className="mb-3 h-3 w-1/2 rounded bg-ink/10 dark:bg-cream/10" />
            <div className="h-3 w-full rounded bg-ink/10 dark:bg-cream/10" />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cream/60 dark:bg-[#101010]/60 px-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#1c1c1c] shadow-sm">
            <Lock className="h-4 w-4 text-ink/50 dark:text-cream/50" strokeWidth={2.25} />
          </div>
          <div className="text-[12.5px] font-bold text-ink/70 dark:text-cream/70">List a room to unlock</div>
        </div>
      </div>
    );
  }

  const neighborhoods = (roomer.neighborhoods || []).map((slug) => getNeighborhoodBySlug(slug)?.name || slug).join(', ');
  const subtitle = [roomer.age, roomer.occupation].filter(Boolean).join(' · ');
  const budget =
    roomer.budgetMin != null && roomer.budgetMax != null ? `$${roomer.budgetMin}–$${roomer.budgetMax}` : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] transition-shadow hover:shadow-lg">
      <ImagePlaceholder
        label="Roomer photo"
        src={getAvatarUrl(roomer.email)}
        alt={roomer.name}
        className="h-40 rounded-none"
      />
      <div className="p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold">{roomer.name}</span>
              {roomer.verified && <VerificationBadge status="approved" />}
            </div>
            {subtitle && <div className="text-[12.5px] text-ink/50 dark:text-cream/50">{subtitle}</div>}
          </div>
          {budget && <span className="shrink-0 font-display text-[13.5px] font-bold text-amber-text">{budget}</span>}
        </div>

        {roomer.bio && (
          <p className="mb-3 line-clamp-2 text-[12.5px] leading-relaxed text-ink/65 dark:text-cream/65">{roomer.bio}</p>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5 text-[11px]">
          {roomer.moveInDate && (
            <span className="rounded-full border border-border dark:border-white/10 bg-cream dark:bg-[#141414] px-2.5 py-1 font-semibold">
              Move-in: {roomer.moveInDate}
            </span>
          )}
          {neighborhoods && (
            <span className="truncate rounded-full border border-border dark:border-white/10 bg-cream dark:bg-[#141414] px-2.5 py-1 font-semibold">
              {neighborhoods}
            </span>
          )}
        </div>

        {roomer.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {roomer.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-semibold text-amber-text">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onMessage}
          disabled={!canMessage}
          title={canMessage ? undefined : 'This roomer needs to apply to one of your listings, or upgrade to message anyone'}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-colors disabled:cursor-not-allowed ${
            canMessage
              ? 'bg-amber text-ink hover:bg-amber-dark'
              : 'bg-border/50 text-ink/40 dark:bg-white/5 dark:text-cream/35'
          }`}
        >
          {canMessage ? (
            <>
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2.25} /> Message
            </>
          ) : (
            <>
              <Lock className="h-[13px] w-[13px]" strokeWidth={2.25} /> Message locked
            </>
          )}
        </button>
      </div>
    </div>
  );
}
