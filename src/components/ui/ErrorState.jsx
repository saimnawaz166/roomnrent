import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this page. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-soft text-2xl font-extrabold text-coral-text">
        !
      </div>
      <div className="font-display mb-2 text-lg font-bold">{title}</div>
      <div className="mb-6 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-cream/60">{description}</div>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
