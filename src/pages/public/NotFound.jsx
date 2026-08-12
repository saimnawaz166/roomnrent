import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center">
      <div className="font-display mb-2 text-6xl font-extrabold text-amber">404</div>
      <h1 className="font-display mb-2 text-lg font-bold">Page not found</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink/60 dark:text-cream/60">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button to="/">Back to Home</Button>
    </div>
  );
}
