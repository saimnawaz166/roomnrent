import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import SponsorSlider from '../ads/SponsorSlider';

export default function PublicLayout() {
  // The Landing page hosts its own large "spotlight" sponsor slider further
  // down the page (after Featured listings), so the slim header strip is
  // skipped there to avoid showing two sponsor units back to back.
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      {!isLanding && <SponsorSlider type="top-section" />}
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
