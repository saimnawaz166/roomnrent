import StarRow from './StarRow';

export default function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl border border-border dark:border-white/10 p-5">
      <div className="mb-2 flex items-center justify-between">
        <StarRow rating={review.rating} size="text-base" />
        <span className="text-xs text-ink/45 dark:text-cream/45">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="mb-2 text-sm leading-relaxed text-ink/75 dark:text-cream/75">{review.text}</p>
      <p className="text-[12.5px] font-semibold text-ink/55 dark:text-cream/55">
        — {review.fromName} ({review.fromRole})
      </p>
    </div>
  );
}
