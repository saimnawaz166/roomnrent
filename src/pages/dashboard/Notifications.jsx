import { useState } from 'react';
import { ClipboardList, MessageSquare, Building2, Bell, CheckCheck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { formatRelativeTime } from '../../lib/date';

const TYPE_CONFIG = {
  application: { icon: ClipboardList, chip: 'bg-amber-soft text-amber-text' },
  message: { icon: MessageSquare, chip: 'bg-sage-soft text-sage-text' },
  listing: { icon: Building2, chip: 'bg-lavender-soft text-lavender-text' },
  system: { icon: Bell, chip: 'bg-border/60 dark:bg-white/10 text-ink/55 dark:text-cream/55' },
};

const FILTERS = ['all', 'unread'];

function isToday(iso) {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const todayItems = visible.filter((n) => isToday(n.createdAt));
  const earlierItems = visible.filter((n) => !isToday(n.createdAt));

  return (
    <div className="max-w-2xl">
      <div className="mb-1.5 flex items-center gap-2.5">
        <h1 className="font-display text-2xl font-extrabold">Notifications</h1>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-soft px-1.5 text-[11px] font-bold text-coral-text">
            {unreadCount}
          </span>
        )}
      </div>
      <p className="mb-6 text-[14.5px] text-ink/55 dark:text-cream/55">
        Stay on top of applications, messages, and listing activity.
      </p>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-1">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-[12.5px] font-bold capitalize transition-colors ${
                filter === key ? 'bg-amber text-ink' : 'text-ink/55 dark:text-cream/55 hover:text-ink dark:hover:text-cream'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
          className="flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-ink/60 dark:text-cream/60 hover:text-amber-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck className="h-4 w-4" strokeWidth={2.5} />
          Mark all as read
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] py-16 text-center text-sm text-ink/55 dark:text-cream/55">
          {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {todayItems.length > 0 && <NotificationGroup title="Today" items={todayItems} onRead={markNotificationRead} />}
          {earlierItems.length > 0 && <NotificationGroup title="Earlier" items={earlierItems} onRead={markNotificationRead} />}
        </div>
      )}
    </div>
  );
}

function NotificationGroup({ title, items, onRead }) {
  return (
    <div>
      <div className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((n) => {
          const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
          const Icon = config.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onRead(n.id)}
              className={`flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border px-5 py-4 text-left transition-colors ${
                n.read
                  ? 'border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]'
                  : 'border-amber/30 bg-amber-soft/40 hover:bg-amber-soft/60 dark:bg-amber/10 dark:hover:bg-amber/15'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.chip}`}>
                <Icon className="h-[17px] w-[17px]" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[14px] leading-relaxed ${
                    n.read ? 'text-ink/75 dark:text-cream/75' : 'font-semibold text-ink dark:text-cream'
                  }`}
                >
                  {n.text}
                </div>
                <div className="mt-1 text-xs text-ink/45 dark:text-cream/45">{formatRelativeTime(n.createdAt)}</div>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
