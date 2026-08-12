export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] ${className}`} {...props}>
      {children}
    </div>
  );
}
