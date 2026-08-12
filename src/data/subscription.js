// Pricing for the "Find a Roomer" direct-message upgrade. The host doesn't
// pick a plan — the price auto-scales off how many active (live or
// coming_soon) listings they currently have, and re-evaluates any time that
// count changes.
export const SUBSCRIPTION_TIERS = [
  { id: 'starter', label: '1 listing', minListings: 1, maxListings: 1, monthly: 7.99, annual: 59.88 },
  { id: 'growth', label: '2–4 listings', minListings: 2, maxListings: 4, monthly: 12.99, annual: 107.88 },
  { id: 'scale', label: '5+ listings', minListings: 5, maxListings: Infinity, monthly: 14.99, annual: 119.88 },
];

// Returns the tier that applies for a given active-listing count, or null if
// the host has no active listings yet (nothing to base a price on).
export function getPricingTierForCount(count) {
  if (!count || count < 1) return null;
  return SUBSCRIPTION_TIERS.find((t) => count >= t.minListings && count <= t.maxListings) || null;
}
