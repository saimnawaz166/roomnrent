// Seed applications for the demo landlord's (Elena Ruiz) listings, plus one
// already-submitted application from the demo renter (Priya Nair) so both
// dashboards have something to show on first load.
export const SEED_APPLICATIONS = [
  {
    id: 'app-1',
    listingId: 4,
    renterName: 'Priya Nair',
    renterEmail: 'priya@mail.com',
    moveInDate: 'September 1, 2026',
    note: "Hi Elena, I'm a quiet grad student looking for a stable place through next summer. Happy to share references.",
    status: 'submitted',
    idFileName: 'priya-id.jpg',
    createdAt: '2026-07-30T14:20:00.000Z',
  },
  {
    id: 'app-2',
    listingId: 1,
    renterName: 'Marcus Webb',
    renterEmail: 'marcus@mail.com',
    moveInDate: 'August 15, 2026',
    note: 'Remote software engineer, quiet during the day, tidy. Can move in as early as needed.',
    status: 'approved',
    idFileName: 'marcus-id.pdf',
    createdAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'app-3',
    listingId: 6,
    renterName: 'Sasha Patel',
    renterEmail: 'sasha@mail.com',
    moveInDate: 'Now',
    note: 'Grad student, early riser, non-smoker. Currently subletting nearby so a quick visit works well.',
    status: 'declined',
    idFileName: null,
    createdAt: '2026-07-10T11:30:00.000Z',
  },
];
