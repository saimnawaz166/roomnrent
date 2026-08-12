import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashSidebar from './DashSidebar';
import DashHeader from './DashHeader';
import Footer from './Footer';
import SponsorSlider from '../ads/SponsorSlider';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Belt-and-braces: close the drawer on any route change, in case a link
  // inside the sidebar ever skips its own onClose (e.g. programmatic nav).
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen">
      <DashSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashHeader onOpenMenu={() => setSidebarOpen(true)} />

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-14">
          <SponsorSlider type="top-section" variant="card" />
          <Outlet />
          <SponsorSlider type="carousel" variant="spotlight" bare />
        </main>

        <Footer />
      </div>
    </div>
  );
}
