export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-7 max-w-full overflow-x-auto">
      <div className="flex w-fit gap-1.5 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-[13.5px] font-bold transition-colors cursor-pointer ${
              active === tab.value
                ? 'bg-amber text-ink'
                : 'text-ink/60 dark:text-cream/60 hover:text-ink dark:hover:text-cream'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
