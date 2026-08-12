export const CONVERSATIONS = [
  {
    id: 1,
    name: 'Elena Ruiz',
    listing: 'Modern Room near Tech Corridor',
    preview: 'Sounds great — how about a video tour Thursday?',
    time: '2m',
    unread: 2,
  },
  {
    id: 2,
    name: 'David Chen',
    listing: 'Bright Room in Wicker Park',
    preview: 'Yes, utilities are included in the $900.',
    time: '1h',
    unread: 0,
  },
  {
    id: 3,
    name: 'Sasha Patel',
    listing: 'Cozy Studio in Capitol Hill',
    preview: 'Thanks for applying! I will review by Friday.',
    time: '3h',
    unread: 0,
  },
  {
    id: 4,
    name: 'Marcus Webb',
    listing: 'Shared Loft near Downtown',
    preview: 'The room is still available, want to schedule a visit?',
    time: '1d',
    unread: 1,
  },
  {
    id: 5,
    name: 'Priya Nair',
    listing: 'Sunny Studio near the Park',
    preview: 'Perfect, see you Saturday at noon.',
    time: '2d',
    unread: 0,
  },
];

export const THREAD = [
  { from: 'them', text: 'Hi! Thanks for your interest in the room near Tech Corridor.', time: '10:02 AM' },
  { from: 'me', text: 'Hi Elena, happy to hear back. Is the room still available from Sept 1?', time: '10:05 AM' },
  { from: 'them', text: 'It is. Would you like to see photos of the shared kitchen too?', time: '10:07 AM' },
  { from: 'me', text: 'Yes please, and is parking included?', time: '10:09 AM' },
  { from: 'them', text: 'Sounds great — how about a video tour Thursday?', time: '10:12 AM' },
];

export const NOTIFICATIONS = [
  {
    id: 1,
    type: 'application',
    text: 'Your application for "Bright Room in Wicker Park" was accepted.',
    time: '10 min ago',
    read: false,
  },
  { id: 2, type: 'message', text: 'Elena Ruiz sent you a new message.', time: '1 hour ago', read: false },
  {
    id: 3,
    type: 'listing',
    text: 'Your listing "Modern Room near Tech Corridor" got 12 new views today.',
    time: '3 hours ago',
    read: true,
  },
  { id: 4, type: 'system', text: 'Your identity verification was approved.', time: 'Yesterday', read: true },
  {
    id: 5,
    type: 'application',
    text: 'David Chen submitted an application for your listing.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 6,
    type: 'system',
    text: 'Reminder: renew your lease template for the new listing wizard.',
    time: '2 days ago',
    read: true,
  },
];

