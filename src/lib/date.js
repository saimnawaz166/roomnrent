// Formats a "YYYY-MM-DD" value (from a native <input type="date">) into a
// friendly display string, e.g. "September 1, 2026". Returns null for
// missing/invalid input so callers can supply their own fallback text.
export function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Formats a full ISO timestamp (e.g. a Supabase `created_at`) into a short
// relative label — "2 min ago", "3 hours ago", "Yesterday", or a date once
// it's more than a week old. Used for notifications, which used to ship
// with a frozen "10 min ago" string in the seed data; a real timestamp needs
// to be turned into that display text at render time instead.
export function formatRelativeTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
