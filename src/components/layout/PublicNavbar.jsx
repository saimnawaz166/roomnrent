import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../Logo';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const linkClasses = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive ? 'text-ink dark:text-cream' : 'text-ink/60 dark:text-cream/60 hover:text-ink dark:hover:text-cream'
  }`;

const mobileLinkClasses = ({ isActive }) =>
  `rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors ${
    isActive ? 'bg-amber-soft text-amber-text' : 'text-ink/70 dark:text-cream/70 hover:bg-cream'
  }`;

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border dark:border-white/10 bg-cream/95 dark:bg-[#101010]/95 backdrop-blur">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/browse" className={linkClasses}>
            Browse Rooms
          </NavLink>
          <NavLink to="/blog" className={linkClasses}>
            Blog
          </NavLink>
          <NavLink to="/find-a-roomer" className={linkClasses}>
            Find a Roomer
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Button to="/login" variant="ghost" size="sm">
              Log In
            </Button>
            <Button to="/signup" size="sm">
              Sign Up
            </Button>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white dark:hover:bg-white/10 md:hidden"
          >
            <span className={`block h-0.5 w-5 rounded-full bg-ink dark:bg-cream transition-transform ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-ink dark:bg-cream transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-ink dark:bg-cream transition-transform ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border dark:border-white/10 bg-cream dark:bg-[#141414] px-6 py-4 md:hidden">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/browse" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
            Browse Rooms
          </NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
            Blog
          </NavLink>
          <NavLink to="/find-a-roomer" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
            Find a Roomer
          </NavLink>
          <NavLink to="/login" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
            Log In
          </NavLink>
          <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5">
            <span className="text-[15px] font-semibold text-ink/70 dark:text-cream/70">Theme</span>
            <ThemeToggle className="h-9 w-9" />
          </div>
          <Button to="/signup" className="mt-2 w-full">
            Sign Up
          </Button>
        </nav>
      )}
    </header>
  );
}
