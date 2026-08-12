import Card from './Card';

export default function StatCard({ label, value, valueClassName = '' }) {
  return (
    <Card className="p-6">
      <div className="mb-2 text-[13px] text-ink/55 dark:text-cream/55">{label}</div>
      <div className={`font-display text-2xl font-extrabold ${valueClassName}`}>{value}</div>
    </Card>
  );
}
