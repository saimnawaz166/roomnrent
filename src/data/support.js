export const SEED_REPORTS = [
  {
    id: 'report-1',
    type: 'listing',
    targetLabel: 'Room in Renovated Craftsman',
    reportedBy: 'Priya Nair',
    reason: "Listing photos didn't match the description on arrival.",
    status: 'open',
    createdAt: '2026-08-05T00:00:00.000Z',
  },
  {
    id: 'report-2',
    type: 'user',
    targetLabel: 'Marcus Webb',
    reportedBy: 'Elena Ruiz',
    reason: 'Applicant sent a message that felt off-topic and pushy about moving in early.',
    status: 'resolved',
    createdAt: '2026-07-28T00:00:00.000Z',
  },
];

export const SEED_SUPPORT_TICKETS = [
  {
    id: 'ticket-1',
    type: 'bug',
    fromName: 'Priya Nair',
    status: 'open',
    createdAt: '2026-08-06T00:00:00.000Z',
    thread: [
      { from: 'user', text: "The 'Save' heart on a listing card sometimes doesn't fill in until I refresh the page.", at: '2026-08-06T00:00:00.000Z' },
    ],
  },
  {
    id: 'ticket-2',
    type: 'question',
    fromName: 'Elena Ruiz',
    status: 'resolved',
    createdAt: '2026-08-01T00:00:00.000Z',
    thread: [
      { from: 'user', text: 'If I pause a listing, do applicants who already applied still show up in my Applicants tab?', at: '2026-08-01T00:00:00.000Z' },
      { from: 'admin', text: 'Yes — pausing only hides it from Browse. Everyone who already applied stays visible.', at: '2026-08-01T01:00:00.000Z' },
    ],
  },
];
