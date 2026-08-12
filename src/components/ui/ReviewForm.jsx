import { useState } from 'react';
import Button from './Button';

export default function ReviewForm({ label, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ rating, text: text.trim() });
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="rounded-2xl border border-border dark:border-white/10 bg-sage-soft px-5 py-4 text-sm font-semibold text-sage-text">Thanks — your review was posted.</p>;
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border dark:border-white/10 p-5">
      <div className="mb-3 text-[13px] font-bold">{label}</div>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="cursor-pointer text-2xl leading-none"
          >
            <span className={n <= rating ? 'text-amber' : 'text-border'}>★</span>
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share how it went…"
        className="mb-3 w-full resize-none rounded-xl border border-border dark:border-white/10 px-4 py-3 text-sm outline-none focus:border-ink/40"
      />
      <Button type="submit" size="sm">
        Submit review
      </Button>
    </form>
  );
}
