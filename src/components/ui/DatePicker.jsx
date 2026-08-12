import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseISO(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Custom calendar-popup date field — used in place of the native
// <input type="date">, whose OS-drawn picker doesn't match the rest of the
// app's design. Stores/returns the same "YYYY-MM-DD" format so it's a
// drop-in swap wherever an ISO date string is expected.
export default function DatePicker({ label, value, onChange, placeholder = 'Select a date' }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseISO(value) || new Date());
  const rootRef = useRef(null);

  const selected = parseISO(value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function openPicker() {
    setViewDate(selected || new Date());
    setOpen(true);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const displayValue = selected
    ? selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="relative flex-1" ref={rootRef}>
      {label && <div className="mb-1.5 text-[13px] font-bold">{label}</div>}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-left text-[14.5px] outline-none focus:border-ink/40"
      >
        <span className={displayValue ? '' : 'text-ink/40 dark:text-cream/40'}>{displayValue || placeholder}</span>
        <Calendar className="h-[17px] w-[17px] shrink-0 text-ink/40 dark:text-cream/40" strokeWidth={2.25} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-72 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink/60 dark:text-cream/60 hover:bg-cream dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <div className="text-[13.5px] font-bold">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-ink/60 dark:text-cream/60 hover:bg-cream dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-ink/40 dark:text-cream/40">
            {WEEKDAYS.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toISO(year, month, d));
                    setOpen(false);
                  }}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${
                    isSelected
                      ? 'bg-amber text-ink'
                      : isToday
                        ? 'text-amber-text'
                        : 'text-ink/70 dark:text-cream/70 hover:bg-cream dark:hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
