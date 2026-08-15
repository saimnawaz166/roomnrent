import { useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { getListingPhoto } from '../../lib/photos';

// One shared ad unit, two layouts, same rotating sponsor-slot data — an admin
// adding/editing/toggling a slot in the Ads tab updates every placement on
// the site immediately since it all reads from the same context state.
export default function AdBox({ placement, neighborhoodSlug, variant = 'vertical' }) {
  const { sponsorSlots, recordAdImpression, recordAdClick } = useAppData();
  const slots = sponsorSlots.filter((s) => {
    if (!s.active || s.type !== 'listing' || !s.placements?.includes(placement)) return false;
    if (s.neighborhoodSlugs?.length > 0) return neighborhoodSlug && s.neighborhoodSlugs.includes(neighborhoodSlug);
    return true;
  });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slots.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slots.length), 6000);
    return () => clearInterval(t);
  }, [slots.length]);

  const activeSlotId = slots[index % (slots.length || 1)]?.id;
  useEffect(() => {
    if (activeSlotId) recordAdImpression(activeSlotId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlotId]);

  if (slots.length === 0) return null;
  const slot = slots[index % slots.length];
  const horizontal = variant === 'horizontal';

  return (
    <button
      type="button"
      onClick={() => recordAdClick(slot.id)}
      className={`w-full cursor-pointer overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white text-left dark:bg-[#1c1c1c] ${horizontal ? 'flex items-center gap-5 p-5' : 'p-4'}`}
    >
      <ImagePlaceholder
        src={getListingPhoto(slot.id, 0)}
        alt={slot.label}
        className={horizontal ? 'h-20 w-32 shrink-0' : 'mb-3 h-24 w-full'}
      />
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink/35 dark:text-cream/35">Sponsored</div>
        <div className="text-sm font-bold">{slot.label}</div>
        <p className="mt-0.5 text-[12.5px] text-ink/55 dark:text-cream/55">{slot.blurb}</p>
      </div>
    </button>
  );
}
