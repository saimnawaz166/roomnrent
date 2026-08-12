export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-border dark:border-white/10 border-t-amber" />
      <div className="text-sm font-semibold text-ink/60 dark:text-cream/60">{label}</div>
    </div>
  );
}
