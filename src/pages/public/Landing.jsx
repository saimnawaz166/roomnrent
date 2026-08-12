import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Lock, Search, Building2, DollarSign, Calendar, BedDouble, Users, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import ListingCard from '../../components/listings/ListingCard';
import SponsorSlider from '../../components/ads/SponsorSlider';
import { useAppData } from '../../context/AppDataContext';
import { LISTING_TYPES } from '../../data/listings';
import { NEIGHBORHOODS } from '../../data/neighborhoods';
import { TESTIMONIALS, FAQS, HOW_IT_WORKS, WHY_CHOOSE_US } from '../../data/testimonials';
import { getAvatarUrl } from '../../lib/photos';

const HERO_PILLS = [
  { icon: ShieldCheck, label: 'Verified Listings', tone: 'bg-sage-soft text-sage-text' },
  { icon: MessageCircle, label: 'Smart Matching', tone: 'bg-lavender-soft text-lavender-text' },
  { icon: Lock, label: 'Secure & Safe', tone: 'bg-amber-soft text-amber-text' },
];

const PRICE_RANGES = ['Any budget', 'Up to $800', '$800 – $1,200', '$1,200 – $1,600', '$1,600+'];

const LISTING_TYPE_ICONS = {
  'Private Room': BedDouble,
  'Shared Room': Users,
  Studio: Home,
  'Entire Unit': Building2,
};

const ICON_TONE_TEXT = {
  amber: 'text-amber-text',
  sage: 'text-sage-text',
  lavender: 'text-lavender-text',
};

// Brighter/saturated variant for icons sitting directly on the dark
// "Why choose us" section — the muted -text tones above read fine on white
// cards but go muddy against bg-ink.
const ICON_TONE_VIVID = {
  amber: 'text-amber',
  sage: 'text-sage',
  lavender: 'text-lavender',
};

const WHY_CHOOSE_ICONS = {
  'Verified profiles': ShieldCheck,
  'Transparent pricing': DollarSign,
  'Real roommate info': Users,
  'Secure messaging': MessageCircle,
};

const NEIGHBORHOOD_PILL_STYLES = [
  'bg-amber text-ink',
  'bg-sage text-white',
  'bg-lavender text-ink',
  'bg-white dark:bg-[#1c1c1c] text-ink dark:text-cream border border-border dark:border-white/10',
];

export default function Landing() {
  const navigate = useNavigate();
  const { listings } = useAppData();
  const liveListings = listings.filter((l) => l.status === 'live');
  const [openFaq, setOpenFaq] = useState(-1);
  const [location, setLocation] = useState('');
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);

  return (
    <div>
      {/* Hero — text stays in the left column like the original design; on
          lg+ the photo bleeds flush to the top-right of the section (no
          margin) and fades right-to-left into the page background as it
          approaches the text, instead of sitting in a separate boxed card. */}
      <section className="relative overflow-hidden lg:min-h-[640px]">
        {/* Full-bleed photo, no margin on its top/right — desktop only */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-[62%]">
          <img src="/room-hero.png" alt="A bright, furnished room" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent from-45% to-cream dark:to-[#101010]" />

          <div className="pointer-events-auto absolute right-8 top-8 flex items-center gap-2.5 rounded-2xl border border-border dark:border-white/10 bg-white/95 dark:bg-[#1c1c1c]/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="flex -space-x-2.5">
              {[1, 2, 3].map((i) => (
                <ImagePlaceholder
                  key={i}
                  shape="circle"
                  src={getAvatarUrl(`social-proof-${i}`)}
                  className="h-7 w-7 border-2 border-white dark:border-[#1c1c1c]"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-[13px] font-bold leading-none">
                4.8 <span className="text-amber">★</span>
              </div>
              <div className="mt-0.5 text-[11px] text-ink/55 dark:text-cream/55">Trusted by renters</div>
            </div>
          </div>

          <div className="pointer-events-auto absolute bottom-8 right-8 flex items-center gap-2.5 rounded-2xl border border-border dark:border-white/10 bg-white/95 dark:bg-[#1c1c1c]/95 px-4 py-3 shadow-xl backdrop-blur">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-soft text-coral-text">
              <Calendar className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-[13px] font-bold">Easy Booking</span>
          </div>
        </div>

        {/* Same photo, contained and rounded — mobile/tablet only */}
        <img
          src="/room-hero.png"
          alt="A bright, furnished room"
          className="h-64 w-full object-cover sm:h-80 lg:hidden"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:flex lg:min-h-[640px] lg:items-center lg:px-10 lg:py-16">
          <div className="pt-10 lg:w-[46%] lg:pt-0">
            <div className="mb-7 flex flex-wrap gap-2.5">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="flex items-center gap-2 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] py-2 pl-2 pr-3.5 text-[13px] font-bold shadow-sm"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${pill.tone}`}>
                    <pill.icon className="h-[13px] w-[13px]" strokeWidth={2.75} />
                  </span>
                  {pill.label}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight lg:text-6xl">
              Find Your
              <br />
              <span className="text-amber">Perfect Room.</span>
              <br />
              Live Better.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/65 dark:text-cream/65">
              A modern platform connecting renters with{' '}
              <strong className="font-bold text-ink dark:text-cream">great rooms &amp; landlords</strong>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate('/browse');
              }}
              className="mt-9 flex flex-col gap-1 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-2.5 shadow-sm sm:flex-row sm:items-center overflow-hidden"
            >
              <label className="flex flex-1  min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5">
                <Search className="h-[18px] w-[18px] shrink-0 text-ink/40 dark:text-cream/40" strokeWidth={2.25} />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search location…"
                  className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-ink/40 dark:placeholder:text-cream/40"
                />
              </label>
              <div className="hidden h-8 w-px shrink-0 bg-border dark:bg-white/10 sm:block" />
              <HeroSelect icon={Building2} value={roomType} onChange={setRoomType}>
                <option value="">All Listings</option>
                {LISTING_TYPES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </HeroSelect>
              <div className="hidden h-8 w-px shrink-0 bg-border dark:bg-white/10 sm:block" />
              <HeroSelect icon={DollarSign} value={priceRange} onChange={setPriceRange}>
                {PRICE_RANGES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </HeroSelect>
              <Button type="submit" size="lg" className="whitespace-nowrap shrink-0">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Listing types */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <h2 className="font-display mb-6 text-2xl font-extrabold">Browse by listing type</h2>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {LISTING_TYPES.map((lt) => {
            const Icon = LISTING_TYPE_ICONS[lt.label] || Home;
            return (
              <Link
                key={lt.label}
                to="/browse"
                className="flex items-center gap-4 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center ${ICON_TONE_TEXT[lt.tone] || ''}`}>
                  <Icon className="h-8 w-8" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="font-display mb-1 font-bold">{lt.label}</div>
                  <div className="text-[13.5px] text-ink/55 dark:text-cream/55">{lt.count} listings</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <h2 className="font-display mb-6 text-2xl font-extrabold">Explore neighborhoods</h2>
        <div className="flex flex-wrap gap-3">
          {NEIGHBORHOODS.map((n, i) => (
            <Link
              key={n.slug}
              to={`/neighborhoods/${n.slug}`}
              className={`rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md ${NEIGHBORHOOD_PILL_STYLES[i % NEIGHBORHOOD_PILL_STYLES.length]}`}
            >
              {n.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-extrabold">Featured listings</h2>
          <Link to="/browse" className="text-sm font-bold hover:text-amber-dark">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {liveListings.slice(0, 4).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <SponsorSlider type="carousel" variant="spotlight" />

      {/* Why choose us */}
      <section className="bg-ink px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display mb-9 text-2xl font-extrabold text-cream">Why choose ROOMNRENT</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((w) => {
              const Icon = WHY_CHOOSE_ICONS[w.title] || ShieldCheck;
              return (
                <div key={w.title} className="rounded-2xl bg-white/5 p-6">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center ${ICON_TONE_VIVID[w.tone] || ''}`}>
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div className="font-display mb-2 font-bold text-cream">{w.title}</div>
                  <p className="text-[13.5px] leading-relaxed text-cream/60">{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <h2 className="font-display mb-11 text-2xl font-extrabold">How it works</h2>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-3">
          {HOW_IT_WORKS.map((h) => (
            <div key={h.n}>
              <div className="font-display mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-amber-soft text-xl font-extrabold text-amber-text">
                {h.n}
              </div>
              <div className="font-display mb-2 text-[17px] font-bold">{h.title}</div>
              <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-ink/60 dark:text-cream/60">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#FFF8EC] px-6 py-24 lg:px-10 dark:bg-[#141414]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display mb-9 text-center text-2xl font-extrabold">
            What renters and landlords say
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-7">
                <p className="mb-5 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <ImagePlaceholder shape="circle" src={getAvatarUrl(t.name)} alt={t.name} className="h-11 w-11 shrink-0" />
                  <div>
                    <div className="font-display text-[13.5px] font-bold">{t.name}</div>
                    <div className="text-xs text-ink/55 dark:text-cream/55">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24 lg:px-10">
        <h2 className="font-display mb-8 text-center text-2xl font-extrabold">Frequently asked questions</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <button
                key={f.q}
                type="button"
                onClick={() => setOpenFaq(open ? -1 : i)}
                className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-6 py-5 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-display text-[15px] font-bold">{f.q}</span>
                  <span className="text-xl font-bold text-amber">{open ? '−' : '+'}</span>
                </div>
                {open && <p className="mt-3.5 text-sm leading-relaxed text-ink/65 dark:text-cream/65">{f.a}</p>}
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="rounded-[32px] bg-amber px-8 py-16 text-center">
          <h2 className="font-display mb-4 text-3xl font-extrabold text-ink">Ready to find your next room?</h2>
          <p className="mb-8 text-base text-ink/75">Join thousands of verified renters and landlords today.</p>
          <Button to="/signup" variant="dark" size="lg">
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
}

function HeroSelect({ icon: Icon, value, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
      <Icon className="h-[18px] w-[18px] shrink-0 text-ink/40 dark:text-cream/40" strokeWidth={2.25} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-[14.5px] font-semibold outline-none"
      >
        {children}
      </select>
    </label>
  );
}
