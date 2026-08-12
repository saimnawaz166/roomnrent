import { Link } from 'react-router-dom';

export default function Logo({ to = '/', size = 'md', light = false, iconOnly = false }) {
  const dims = size === 'lg' ? 'h-10 w-10 text-lg' : 'h-9 w-9 text-base';
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span
        className={`flex ${dims} shrink-0 items-center justify-center rounded-xl bg-amber font-display font-extrabold text-ink`}
      >
        R
      </span>
      {!iconOnly && (
        <span className={`font-display text-lg font-extrabold ${light ? 'text-cream' : 'text-ink dark:text-cream'}`}>
          ROOMNRENT
        </span>
      )}
    </Link>
  );
}
