// Shared color-tone classes used across badges, stat tiles, and icon chips.
// Keeps the amber/sage/coral/lavender palette from the brand mockup consistent
// everywhere instead of re-typing bg/text pairs at every call site.
export const TONE_CLASSES = {
  amber: 'bg-amber-soft text-amber-text',
  sage: 'bg-sage-soft text-sage-text',
  coral: 'bg-coral-soft text-coral-text',
  lavender: 'bg-lavender-soft text-lavender-text',
  neutral: 'bg-border/40 text-ink/60',
};

export function toneClasses(tone = 'neutral') {
  return TONE_CLASSES[tone] || TONE_CLASSES.neutral;
}

// Maps common status strings (application/listing/user states) to a tone.
export function statusTone(status) {
  const s = (status || '').toLowerCase();
  if (['accepted', 'approved', 'verified', 'live', 'resolved'].includes(s)) return 'sage';
  if (['declined', 'flagged', 'rejected'].includes(s)) return 'coral';
  if (['waitlisted', 'viewed', 'coming_soon', 'coming soon'].includes(s)) return 'lavender';
  if (['under review', 'pending', 'pending review', 'submitted', 'open', 'paused'].includes(s)) return 'amber';
  return 'neutral';
}
