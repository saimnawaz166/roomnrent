export const BLOG_POSTS = [
  {
    slug: 'why-we-built-roomnrent',
    category: 'Our Story',
    title: 'Why We Built ROOMNRENT',
    excerpt: 'A room shouldn’t require a broker, a fee, or a leap of faith. Here’s why ROOMNRENT exists.',
    date: '2026-06-01T00:00:00.000Z',
    readMinutes: 3,
    body: [
      {
        text: "We kept running into the same two people, never finding each other: a homeowner with a spare room and no easy way to list it, and a renter who needed a place fast and didn't want to gamble on an anonymous ad.",
      },
      {
        text: 'ROOMNRENT is built to close that gap. Listing a room is free, it always will be. Every renter and landlord verifies their identity before a conversation starts, so trust isn’t something you have to take on faith from a stranger’s profile photo.',
      },
      {
        text: 'That’s the whole idea: a real listing, a real person on the other end, and a straightforward way to get from “looking” to “moved in.”',
      },
    ],
    ctas: [
      { label: 'Browse rooms', to: '/browse' },
      { label: 'List your room', to: '/listings/new' },
    ],
  },
  {
    slug: '5-questions-before-you-move-in',
    category: 'For Renters',
    title: '5 Questions to Ask Before You Move Into a Shared Room',
    excerpt: 'A little clarity up front saves a lot of friction later. Here’s what to ask before you say yes.',
    date: '2026-06-08T00:00:00.000Z',
    readMinutes: 4,
    body: [
      {
        text: "Moving into a shared room is different from signing a regular lease — you're joining a household, not just renting space. A few honest questions before you commit can save a lot of friction later.",
      },
      {
        heading: '1. Who else lives here, and what are they like?',
        text: 'Ask about the other people in the house — schedules, habits, how long they’ve lived there. A host who can answer this easily is usually a good sign.',
      },
      {
        heading: "2. What's included, and what isn't?",
        text: '"Utilities included" can mean different things to different hosts. Get specific about wifi, parking, and laundry.',
      },
      {
        heading: "3. What are the house rules?",
        text: 'Guests, quiet hours, shared chores, smoking policy — better to know before move-in than to find out the hard way.',
      },
      {
        heading: "4. What's the minimum stay?",
        text: 'Flexibility matters if your plans change. Know the terms before you sign anything.',
      },
      {
        heading: '5. How does rent actually get paid?',
        text: 'Method, due date, what happens if you’re a day late. Get it in writing, even if it’s just a message thread.',
      },
      { text: 'A good host expects these questions — answering them clearly is part of being a trustworthy landlord.' },
    ],
    ctas: [{ label: 'Browse rooms', to: '/browse' }],
  },
  {
    slug: 'why-we-verify-ids',
    category: 'For Landlords',
    title: 'What Landlords Should Know About ID Verification',
    excerpt: 'Verification isn’t about suspicion — it’s about making sure everyone on ROOMNRENT is who they say they are.',
    date: '2026-06-15T00:00:00.000Z',
    readMinutes: 3,
    body: [
      {
        text: "If you've listed a room, you've probably noticed the ID verification step — for you, and for anyone who applies to your listing. Here's why it's there.",
      },
      {
        heading: 'Why we ask for it.',
        text: 'A room isn’t a used couch — you’re letting someone into your home, or trusting a stranger’s home enough to move into it. Verification is the baseline that makes that trust possible from the first message.',
      },
      {
        heading: 'Who can see it.',
        text: 'Your ID is never public. When a renter applies, you can view their ID — and only you. Nobody outside that specific application ever sees it.',
      },
      {
        heading: "What it doesn't do.",
        text: 'Verification confirms identity. It doesn’t replace your own judgment — you’re still the one deciding who moves in, reviewing applications, and having real conversations before you say yes.',
      },
    ],
    ctas: [{ label: 'List your room', to: '/listings/new' }],
  },
  {
    slug: 'telling-your-story',
    category: 'For Renters',
    title: 'Second Chances: How to Tell Your Story on Your Renter Profile',
    excerpt: 'A rough patch on your rental history doesn’t have to be the end of the conversation.',
    date: '2026-06-22T00:00:00.000Z',
    readMinutes: 3,
    body: [
      {
        text: 'A layoff, a medical bill, a landlord who wouldn’t fix anything — any of these can leave a mark on your rental history that a background check alone can’t explain.',
      },
      {
        text: 'Your profile has a place for context, in your own words, before a host ever sees your application. This isn’t about excuses — it’s about giving a fuller picture. "One prior eviction" with no explanation reads very differently from a short, honest note about what happened and what’s changed since.',
      },
      {
        text: 'You don’t have to share anything you’re not comfortable sharing, but if your history needs context, your profile is built to give you the room to provide it.',
      },
    ],
    ctas: [{ label: 'Browse rooms', to: '/browse' }],
  },
  {
    slug: 'neighborhood-spotlight-wicker-park',
    category: 'Neighborhood Spotlight',
    neighborhoodSlug: 'wicker-park',
    title: 'Neighborhood Spotlight: What to Know Before Renting a Room in Wicker Park',
    excerpt: 'Indie retail, live music, and tree-lined streets — here’s what makes it worth a look.',
    date: '2026-06-29T00:00:00.000Z',
    readMinutes: 3,
    body: [
      {
        text: 'Wicker Park has a strong indie retail and music scene, tree-lined residential streets, and easy Blue Line access into the Loop — a favorite for renters who want character housing over high-rises.',
      },
      {
        heading: 'Getting around.',
        text: 'The Blue Line puts downtown within a fifteen-minute ride, and the neighborhood itself is walkable enough that a lot of renters skip the car altogether.',
      },
      {
        heading: 'What to expect from a room here.',
        text: 'Listings tend to be in converted walk-ups and lofts rather than large apartment complexes — expect character, and expect rooms to move fast.',
      },
    ],
    ctas: [{ label: 'Browse rooms in Wicker Park', to: '/neighborhoods/wicker-park' }],
  },
];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
