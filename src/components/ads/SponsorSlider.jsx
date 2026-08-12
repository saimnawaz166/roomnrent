import { useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { getListingPhoto } from '../../lib/photos';

const SPOTLIGHT_GRADIENTS = [
  'bg-gradient-to-br from-amber to-[#ffd98f]',
  'bg-gradient-to-br from-sage to-[#b7ecA0]',
  'bg-gradient-to-br from-lavender to-[#ece3fb]',
];

// A site-wide sponsor slider — separate from the contextual AdBox cards
// embedded in page content. Three looks share the same rotation/data logic:
// 'strip' (slim banner, mounted in PublicLayout), 'card' (dashboard pages),
// and 'spotlight' (large hero-style showcase, used on the Landing page).
export default function SponsorSlider({ type = 'top-section', variant = 'strip', bare = false }) {
  const { sponsorSlots } = useAppData();
  const slots = sponsorSlots.filter((s) => s.active && s.type === type);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slots.length]);

  useEffect(() => {
    if (slots.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slots.length), 5500);
    return () => clearInterval(t);
  }, [slots.length]);

  if (slots.length === 0) return null;
  const safeIndex = index % slots.length;
  const next = () => setIndex((i) => (i + 1) % slots.length);
  const prev = () => setIndex((i) => (i - 1 + slots.length) % slots.length);

  if (variant === 'spotlight') {
    return (
      <section className={bare ? 'mt-9' : 'mx-auto max-w-7xl px-6 pb-20 lg:px-10'}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">
              Sponsored
            </span>
            <h2 className="font-display text-2xl font-extrabold">Featured partners</h2>
          </div>
          {slots.length > 1 && (
            <div className="flex items-center gap-2">
              <SpotlightNavButton dir="prev" onClick={prev} />
              <SpotlightNavButton dir="next" onClick={next} />
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[28px] shadow-lg">
          {slots.map((slot, i) => (
            <div
              key={slot.id}
              className={`${SPOTLIGHT_GRADIENTS[i % SPOTLIGHT_GRADIENTS.length]} transition-opacity duration-700 ease-out ${
                i === safeIndex ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
              }`}
            >
              <div className="flex flex-col items-center gap-9 px-8 py-12 sm:flex-row sm:px-14 sm:py-16">
                <div className="max-w-md">
                  <h3 className="font-display mb-3 text-2xl font-extrabold text-ink sm:text-[28px]">{slot.label}</h3>
                  <p className="text-[15px] leading-relaxed text-ink/70">{slot.blurb}</p>
                  <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-transform hover:-translate-y-0.5">
                    Learn more →
                  </div>
                </div>
                <ImagePlaceholder
                  src={getListingPhoto(slot.id, 0)}
                  alt={slot.label}
                  className="h-40 w-full max-w-xs shrink-0 rounded-2xl border-0 sm:h-48"
                />
              </div>
            </div>
          ))}
        </div>

        {slots.length > 1 && (
          <div className="mt-5 flex justify-center gap-1.5">
            {slots.map((slot, i) => (
              <button
                key={slot.id}
                type="button"
                aria-label={`Show sponsor ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  i === safeIndex ? 'w-7 bg-ink' : 'w-1.5 bg-border hover:bg-ink/30'
                }`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  const wrap =
    variant === 'card'
      ? 'mb-7 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-3.5'
      : 'border-b border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]';
  const inner = variant === 'card' ? '' : 'mx-auto max-w-7xl px-6 lg:px-10';

  return (
    <div className={wrap}>
      <div className={`flex items-center gap-4 ${inner} ${variant === 'card' ? '' : 'py-3'}`}>
        <span className="shrink-0 rounded-full bg-cream dark:bg-[#141414] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink/40 dark:text-cream/40">
          Sponsored
        </span>

        <div className="relative h-5 flex-1 overflow-hidden">
          {slots.map((slot, i) => (
            <div
              key={slot.id}
              className={`absolute inset-0 flex items-center gap-2 transition-all duration-500 ease-out ${
                i === safeIndex
                  ? 'translate-y-0 opacity-100'
                  : i < safeIndex
                    ? '-translate-y-2.5 opacity-0'
                    : 'translate-y-2.5 opacity-0'
              }`}
            >
              <span className="truncate text-[13px] font-bold">{slot.label}</span>
              <span className="hidden truncate text-[13px] text-ink/55 dark:text-cream/55 sm:inline">— {slot.blurb}</span>
            </div>
          ))}
        </div>

        {slots.length > 1 && (
          <div className="flex shrink-0 items-center gap-1.5">
            {slots.map((slot, i) => (
              <button
                key={slot.id}
                type="button"
                aria-label={`Show sponsor ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  i === safeIndex ? 'w-4 bg-amber' : 'w-1.5 bg-border hover:bg-ink/25'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpotlightNavButton({ dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous sponsor' : 'Next sponsor'}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-sm font-bold transition-colors hover:bg-cream dark:hover:bg-white/10"
    >
      {dir === 'prev' ? '←' : '→'}
    </button>
  );
}
