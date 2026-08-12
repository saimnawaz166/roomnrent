import { Link } from 'react-router-dom';
import { NEIGHBORHOODS } from '../../data/neighborhoods';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Safety', to: '/safety' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Cookies', to: '/cookies' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink pb-0 pt-14 text-cream">
      <div className="px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 pb-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="font-display mb-3 text-lg font-extrabold">ROOMNRENT</div>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-cream/55">
              Connecting renters with trusted landlords across the country.
            </p>
          </div>
          <div>
            <div className="mb-3.5 text-[13px] font-bold">Neighborhoods</div>
            <div className="flex flex-col gap-2.5 text-[13.5px] text-cream/60">
              {NEIGHBORHOODS.slice(0, 5).map((n) => (
                <Link key={n.slug} to={`/neighborhoods/${n.slug}`} className="transition-colors hover:text-cream">
                  {n.name}
                </Link>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mb-3.5 text-[13px] font-bold">{col.title}</div>
              <div className="flex flex-col gap-2.5 text-[13.5px] text-cream/60">
                {col.links.map((link) => (
                  <Link key={link.label} to={link.to} className="transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-7xl border-t border-cream/15 pb-8 pt-5 text-[12.5px] text-cream/45">
          © 2026 ROOMNRENT. All rights reserved.
        </div>
      </div>

      <img src="/rentnroom-logo.jpeg" alt="RentNRoom" className="block h-auto w-full" />
    </footer>
  );
}
