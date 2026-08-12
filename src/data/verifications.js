// Keyed by email. status: 'none' | 'pending' | 'approved' | 'rejected'.
export const SEED_VERIFICATIONS = {
  'elena@mail.com': { status: 'approved', fileName: 'elena-drivers-license.jpg', submittedAt: '2026-06-02T00:00:00.000Z' },
  'priya@mail.com': { status: 'approved', fileName: 'priya-id.jpg', submittedAt: '2026-06-10T00:00:00.000Z' },
  'marcus@mail.com': { status: 'approved', fileName: 'marcus-id.pdf', submittedAt: '2026-07-01T00:00:00.000Z' },
  'sasha@mail.com': { status: 'pending', fileName: 'sasha-passport.jpg', submittedAt: '2026-07-28T00:00:00.000Z' },
  'david@mail.com': { status: 'approved', fileName: 'david-id.jpg', submittedAt: '2026-05-15T00:00:00.000Z' },
};
