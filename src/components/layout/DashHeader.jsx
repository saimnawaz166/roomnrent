import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import ThemeToggle from '../ui/ThemeToggle';
import { getAvatarUrl } from '../../lib/photos';
import { useRole, useCurrentUser } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';

// Maps the current path to a short, human page title so every dashboard
// screen has consistent chrome instead of each page inventing (and
// repeating) its own heading. Order matters — first match wins.
const TITLE_RULES = [
  { test: (p) => p === '/dashboard', title: () => 'Overview' },
  { test: (p) => p === '/admin', title: () => 'Platform Overview' },
  { test: (p) => p === '/dashboard/saved', title: () => 'Saved Listings' },
  { test: (p) => p === '/dashboard/applications', title: () => 'My Applications' },
  { test: (p) => p === '/dashboard/listings', title: () => 'My Listings' },
  { test: (p) => p === '/dashboard/applicants', title: () => 'Applicants' },
  { test: (p) => p === '/admin/users', title: () => 'Users' },
  { test: (p) => p.startsWith('/admin/users/'), title: () => 'User Details' },
  { test: (p) => p === '/admin/listings', title: () => 'Listings' },
  { test: (p) => p === '/admin/reports', title: () => 'Reports' },
  { test: (p) => p === '/admin/support', title: () => 'Support' },
  { test: (p) => p === '/admin/ads', title: () => 'Sponsor Ads' },
  { test: (p) => p === '/listings/new', title: () => 'Create Listing' },
  { test: (p) => p === '/find-a-roomer', title: () => 'Find a Roomer' },
  { test: (p) => p === '/subscription', title: () => 'Subscription' },
  { test: (p) => p.endsWith('/edit'), title: () => 'Edit Listing' },
  { test: (p) => p.startsWith('/applications/'), title: () => 'Application' },
  { test: (p) => p.startsWith('/messages'), title: () => 'Messages' },
  { test: (p) => p === '/profile', title: () => 'Profile Settings' },
  { test: (p) => p === '/notifications', title: () => 'Notifications' },
];

const ROLE_LABELS = { renter: 'Renter', landlord: 'Landlord', admin: 'Admin' };

function getTitle(pathname) {
  return TITLE_RULES.find((rule) => rule.test(pathname))?.title() || 'Dashboard';
}

export default function DashHeader({ onOpenMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();
  const currentUser = useCurrentUser();
  const { signOut } = useAuth();
  const { notifications } = useAppData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
      <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-cream dark:hover:bg-white/10 lg:hidden"
          >
            <span className="block h-0.5 w-5 rounded-full bg-ink dark:bg-cream" />
            <span className="block h-0.5 w-5 rounded-full bg-ink dark:bg-cream" />
            <span className="block h-0.5 w-5 rounded-full bg-ink dark:bg-cream" />
          </button>
          <div className="min-w-0">
            <div className="font-display truncate text-[17px] font-bold">{getTitle(pathname)}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle className="h-9 w-9" />
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink/55 dark:text-cream/55 transition-colors hover:bg-cream dark:hover:bg-white/10"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.25} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-soft px-1 text-[9px] font-bold text-coral-text">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 transition-colors hover:bg-cream dark:hover:bg-white/10"
          >
            <ImagePlaceholder
              shape="circle"
              src={getAvatarUrl(currentUser.email)}
              alt={currentUser.name}
              className="h-7 w-7 shrink-0"
            />
            <span className="hidden text-[13px] font-semibold sm:block">{currentUser.name}</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-border dark:border-white/10 px-5 py-2.5 lg:px-8">
        <span className="rounded-full bg-cream dark:bg-[#141414] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">
          {ROLE_LABELS[role] || role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-ink/60 dark:text-cream/60 hover:bg-cream dark:hover:bg-white/10"
        >
          <LogOut className="h-[13px] w-[13px]" strokeWidth={2.25} /> Log out
        </button>
      </div>
    </header>
  );
}
