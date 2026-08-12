// Formats a "YYYY-MM-DD" value (from a native <input type="date">) into a
// friendly display string, e.g. "September 1, 2026". Returns null for
// missing/invalid input so callers can supply their own fallback text.
export function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
