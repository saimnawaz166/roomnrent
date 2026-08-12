// Mock sponsor slots — real partner placements/links are a business decision,
// not a design one. impressions/clicks are seed numbers, not live tracking.

// The 3 ad surfaces the product actually renders:
// - "carousel"    → the big rotating showcase (SponsorSlider, variant="spotlight")
// - "top-section" → the slim banner strip under the header (SponsorSlider, variant="strip"/"card")
// - "listing"     → contextual cards embedded in page content (AdBox), each
//                    targeted to one or more placements below and optionally
//                    a single neighborhood.
export const AD_TYPE_LABELS = {
  carousel: 'Carousel',
  'top-section': 'Top Section',
  listing: 'Listing Ad',
};

export const AD_TYPE_DESCRIPTIONS = {
  carousel: 'Large rotating showcase on the homepage and at the bottom of every dashboard page.',
  'top-section': 'Slim banner strip under the header, on every page.',
  listing: 'Contextual card embedded on listing, browse, and blog pages — can target one neighborhood.',
};

export const AD_PLACEMENT_GROUPS = [
  { key: 'listing-detail', label: 'Listing pages' },
  { key: 'browse-neighborhoods', label: 'Browse & Neighborhoods' },
  { key: 'blog-content', label: 'Blog & Content' },
];

export const SEED_SPONSOR_SLOTS = [
  // ---- carousel (homepage + bottom of every dashboard page) ----
  {
    id: 'sponsor-1',
    type: 'carousel',
    label: 'Harbor & Co. Renters Insurance',
    blurb: 'Renters insurance built for shared housing — ask about the ROOMNRENT discount.',
    active: true,
    impressions: 1284,
    clicks: 47,
  },
  {
    id: 'sponsor-2',
    type: 'carousel',
    label: 'Movalo Moving',
    blurb: 'Book a local moving crew in under 10 minutes — ROOMNRENT members get 15% off.',
    active: true,
    impressions: 1046,
    clicks: 39,
  },
  {
    id: 'sponsor-3',
    type: 'carousel',
    label: 'Nestled Furniture Rental',
    blurb: 'Furnish your room in a weekend. Rent what you need, return it when you move out.',
    active: true,
    impressions: 968,
    clicks: 31,
  },

  // ---- top-section (slim strip under the header, every page) ----
  {
    id: 'sponsor-4',
    type: 'top-section',
    label: 'NeighborFRONT',
    blurb: 'Local neighborhood news, from the team behind ROOMNRENT.',
    active: true,
    impressions: 2103,
    clicks: 88,
  },
  {
    id: 'sponsor-5',
    type: 'top-section',
    label: 'SafeKeep Self Storage',
    blurb: 'Need extra space during your move? First month free at any SafeKeep location.',
    active: true,
    impressions: 1877,
    clicks: 64,
  },
  {
    id: 'sponsor-6',
    type: 'top-section',
    label: 'Sparkle Home Cleaning',
    blurb: 'Book a move-in deep clean before your new roommates arrive.',
    active: true,
    impressions: 1532,
    clicks: 52,
  },

  // ---- listing (contextual card on listing/browse/blog pages) ----
  {
    id: 'sponsor-7',
    type: 'listing',
    label: 'Wicker Park Hardware',
    blurb: 'Everything for move-in day, five minutes from most Wicker Park listings.',
    active: true,
    impressions: 902,
    clicks: 21,
    placements: ['listing-detail', 'browse-neighborhoods'],
    neighborhoodSlugs: ['wicker-park'],
  },
  {
    id: 'sponsor-8',
    type: 'listing',
    label: 'Mission Bay Bike Co.',
    blurb: 'Bike rentals and repairs, five minutes from most Mission Bay listings.',
    active: true,
    impressions: 611,
    clicks: 18,
    placements: ['listing-detail', 'browse-neighborhoods'],
    neighborhoodSlugs: ['mission-bay'],
  },
  {
    id: 'sponsor-9',
    type: 'listing',
    label: 'RoomieMatch Compatibility Quiz',
    blurb: 'Not sure who to room with? Take our free 2-minute compatibility quiz.',
    active: true,
    impressions: 1349,
    clicks: 57,
    placements: ['browse-neighborhoods', 'blog-content'],
    neighborhoodSlugs: [],
  },
];
