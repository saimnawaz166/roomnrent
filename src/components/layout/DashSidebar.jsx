import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  ClipboardList,
  Search,
  Building2,
  Users,
  PlusCircle,
  UsersRound,
  CreditCard,
  MessageSquare,
  Bell,
  UserCircle,
  Flag,
  LifeBuoy,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Logo from '../Logo';
import { useRole, useCurrentUser } from '../../context/RoleContext';
import { useAppData } from '../../context/AppDataContext';

const COLLAPSE_KEY = 'roomnrent-sidebar-collapsed';

// Sticky column on large screens (stays put while page content scrolls); an
// off-canvas drawer (with backdrop) below lg — DashboardLayout owns the
// open/close state and passes it down so a hamburger button in its header
// can control this from outside.
//
// On large screens the sidebar can also be pinned into a narrow icon-only
// rail — it stays fully visible (icons + tooltips, no hover tricks), it just
// drops the labels and section headers to save width. Preference persists
// across reloads.
export default function DashSidebar({ open, onClose }) {
  const { role } = useRole();
  const currentUser = useCurrentUser();
  const { applications, listings, reports, tickets } = useAppData();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  const myListingIds = new Set(listings.filter((l) => l.landlordEmail === currentUser.email).map((l) => l.id));
  const pendingApplicants = applications.filter(
    (a) => myListingIds.has(a.listingId) && a.status === 'submitted',
  ).length;
  const openReports = reports.filter((r) => r.status === 'open').length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;

  const SECTIONS = {
    renter: [
      {
        title: 'Dashboard',
        items: [
          { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
          { label: 'Saved Listings', to: '/dashboard/saved', icon: Heart },
          { label: 'My Applications', to: '/dashboard/applications', icon: ClipboardList },
        ],
      },
      { title: 'Explore', items: [{ label: 'Browse Rooms', to: '/browse', icon: Search }] },
      {
        title: 'Account',
        items: [
          { label: 'Messages', to: '/messages', icon: MessageSquare },
          { label: 'Notifications', to: '/notifications', icon: Bell },
          { label: 'Profile Settings', to: '/profile', icon: UserCircle },
        ],
      },
    ],
    landlord: [
      {
        title: 'Dashboard',
        items: [
          { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
          { label: 'My Listings', to: '/dashboard/listings', icon: Building2 },
          { label: 'Applicants', to: '/dashboard/applicants', icon: Users, badge: pendingApplicants },
        ],
      },
      {
        title: 'Manage',
        items: [
          { label: 'Create Listing', to: '/listings/new', icon: PlusCircle },
          { label: 'Find a Roomer', to: '/find-a-roomer', icon: UsersRound },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Messages', to: '/messages', icon: MessageSquare },
          { label: 'Subscription', to: '/subscription', icon: CreditCard },
          { label: 'Notifications', to: '/notifications', icon: Bell },
          { label: 'Profile Settings', to: '/profile', icon: UserCircle },
        ],
      },
    ],
    admin: [
      {
        title: 'Platform',
        items: [
          { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
          { label: 'Users', to: '/admin/users', icon: Users },
          { label: 'Listings', to: '/admin/listings', icon: Building2 },
          { label: 'Reports', to: '/admin/reports', icon: Flag, badge: openReports },
          { label: 'Support', to: '/admin/support', icon: LifeBuoy, badge: openTickets },
          { label: 'Ads', to: '/admin/ads', icon: Megaphone },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Notifications', to: '/notifications', icon: Bell },
          { label: 'Profile Settings', to: '/profile', icon: UserCircle },
        ],
      },
    ],
  };

  const sections = SECTIONS[role];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto overflow-x-hidden border-r border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] py-6 transition-[transform,width] duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          collapsed ? 'lg:w-[76px] lg:min-w-[76px] lg:px-2.5' : 'lg:w-64 lg:min-w-64 lg:px-5'
        } px-5 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {collapsed ? (
          <div className="mb-7 flex flex-col items-center gap-3">
            <Logo iconOnly />
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink/50 dark:text-cream/50 hover:bg-cream dark:hover:bg-white/10 lg:flex"
            >
              <PanelLeftOpen className="h-[17px] w-[17px]" strokeWidth={2.25} />
            </button>
          </div>
        ) : (
          <div className="mb-7 flex items-center justify-between px-1">
            <Logo />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink/50 dark:text-cream/50 hover:bg-cream dark:hover:bg-white/10 lg:flex"
              >
                <PanelLeftClose className="h-[17px] w-[17px]" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-lg text-ink/50 dark:text-cream/50 hover:bg-cream lg:hidden"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="mb-1.5 px-3.5 text-[10.5px] font-bold uppercase tracking-wider text-ink/35 dark:text-cream/35">
                  {section.title}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        collapsed ? 'justify-center px-2' : 'px-3.5'
                      } ${
                        isActive
                          ? 'bg-amber-soft text-amber-text'
                          : 'text-ink/65 dark:text-cream/65 hover:bg-cream dark:hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-amber-text' : 'text-ink/40 dark:text-cream/40 group-hover:text-ink/60 dark:group-hover:text-cream/60'}`}
                          strokeWidth={2.25}
                        />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!!item.badge &&
                          (collapsed ? (
                            <span className="absolute right-1 top-1 h-2 w-2 shrink-0 rounded-full bg-coral" />
                          ) : (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-coral-soft px-1.5 text-[11px] font-bold text-coral-text">
                              {item.badge}
                            </span>
                          ))}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
