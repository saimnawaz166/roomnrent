const SHAPE_CLASSES = {
  rect: 'rounded-2xl',
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
};

// Renders a real photo when `src` is given (deterministic stand-ins from
// src/lib/photos.js until there's real image upload/storage). Falls back to
// the original gradient block + label when `src` is omitted.
export default function ImagePlaceholder({ shape = 'rect', label, className = '', src, alt }) {
  if (src) {
    // <img> is a replaced element — unlike a div, `width/height: auto` sizes
    // to the image's intrinsic pixels, not the container. Only default to
    // filling the box when the caller hasn't already sized that axis itself
    // (e.g. fixed avatar sizes like `h-7 w-7` must win, untouched).
    const hasWidth = /(^|\s)w-/.test(className);
    const hasHeight = /(^|\s)h-/.test(className);
    const fill = [hasWidth ? '' : 'w-full', hasHeight ? '' : 'h-full'].filter(Boolean).join(' ');
    return (
      <img
        src={src}
        alt={alt || label || ''}
        loading="lazy"
        className={`block object-cover ${fill} ${SHAPE_CLASSES[shape]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-soft to-lavender-soft text-center ${SHAPE_CLASSES[shape]} ${className}`}
    >
      {label && <span className="px-2 text-[11px] font-semibold text-ink/40 dark:text-cream/40">{label}</span>}
    </div>
  );
}
