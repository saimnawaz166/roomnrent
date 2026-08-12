import Button from './Button';

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-5 h-16 w-16 rounded-2xl bg-amber-soft" />
      <div className="font-display mb-2 text-lg font-bold">{title}</div>
      {description && <div className="mb-6 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-cream/60">{description}</div>}
      {actionLabel && (actionTo || onAction) && (
        <Button to={actionTo} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
