import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-amber text-ink hover:bg-amber-dark',
  outline: 'border border-ink text-ink hover:bg-ink/5 bg-transparent dark:border-cream/30 dark:text-cream dark:hover:bg-white/5',
  dark: 'bg-ink text-cream hover:bg-ink/85',
  ghost: 'text-ink/70 dark:text-cream/70 hover:text-amber-dark',
};

const SIZES = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  sm: 'px-4 py-2 text-xs',
};

export default function Button({
  as,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  const Component = as || 'button';
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
