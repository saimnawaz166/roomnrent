import { toneClasses } from '../../lib/tone';

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${toneClasses(tone)}`}>{children}</span>
  );
}
