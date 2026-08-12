export default function StarRow({ rating, size = 'text-sm' }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className={size}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'text-amber' : 'text-border'}>
          ★
        </span>
      ))}
    </span>
  );
}
