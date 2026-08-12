// Static content for the footer's Company/Support/Legal pages. Kept as data
// (rather than one bespoke component per page) since they all share the same
// simple title + sections layout — see pages/public/InfoPage.jsx.
export const INFO_PAGES = {
  about: {
    title: 'About ROOMNRENT',
    intro:
      'ROOMNRENT connects renters looking for a room with landlords and current tenants who have space to share. We built the platform to make finding a room — not just an apartment — simple, transparent, and safe.',
    sections: [
      {
        heading: 'Our mission',
        body: 'Millions of people need a place to live that isn’t a full apartment lease — a spare room, a spot in a shared house, or someone else’s lease they can take over. ROOMNRENT exists to make that search as easy as browsing full apartment listings, with real verification and a clear paper trail from first message to move-in.',
      },
      {
        heading: 'How it works',
        body: 'Renters browse live listings, view full details, and apply with a move-in date and a short note. Landlords and current tenants review applications and respond directly. Once an application is approved, the exact address unlocks and both sides can message to finalize move-in.',
      },
      {
        heading: 'Where we operate',
        body: 'ROOMNRENT listings currently span neighborhoods across San Francisco, Seattle, Austin, Chicago, Denver, Boston, Portland, and Los Angeles, with more cities added as the platform grows.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    intro: 'We’re a small team building the easiest way to find and fill a spare room.',
    sections: [
      {
        heading: 'Open roles',
        body: 'We don’t have any open roles listed right now, but we’re always glad to hear from people who care about housing access. Send a note and your background to careers@roomnrent.com and we’ll keep it on file.',
      },
      {
        heading: 'How we work',
        body: 'ROOMNRENT is a remote-friendly team. We ship in small increments, talk to renters and landlords constantly, and try to keep the product simpler than the problem it’s solving.',
      },
    ],
  },
  press: {
    title: 'Press',
    intro: 'Resources for journalists and media covering ROOMNRENT.',
    sections: [
      { heading: 'Media inquiries', body: 'For interview requests or press questions, reach out to press@roomnrent.com and we’ll get back to you within a couple of business days.' },
      { heading: 'Brand assets', body: 'Logo files and basic brand guidelines are available on request — email press@roomnrent.com.' },
      { heading: 'Recent coverage', body: 'No press coverage to share yet. Check back soon.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'These terms govern your use of ROOMNRENT. This is a general summary and not a substitute for reading the full agreement before relying on it.',
    sections: [
      { heading: '1. Acceptance of terms', body: 'By creating an account or using ROOMNRENT, you agree to these terms. If you don’t agree, please don’t use the platform.' },
      { heading: '2. Using the platform', body: 'ROOMNRENT lists rooms and connects renters with landlords and current tenants. We don’t own, manage, or inspect any listed property, and we’re not a party to any lease or rental agreement made between users.' },
      { heading: '3. Listings & applications', body: 'Landlords are responsible for the accuracy of their listings. Renters are responsible for the accuracy of information submitted in an application. Both sides agree to communicate honestly and follow applicable local housing law.' },
      { heading: '4. Payments', body: 'ROOMNRENT does not currently process rent, deposits, or transfer fees. Any payment arrangement is made directly between renter and landlord, outside the platform.' },
      { heading: '5. Account termination', body: 'We may suspend or remove an account that violates these terms, misrepresents a listing or application, or is reported and confirmed for abusive behavior.' },
      { heading: '6. Changes to these terms', body: 'We may update these terms from time to time. Continued use of ROOMNRENT after a change means you accept the updated terms.' },
      { heading: 'Contact', body: 'Questions about these terms can be sent to legal@roomnrent.com.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page explains what information ROOMNRENT collects and how it’s used.',
    sections: [
      { heading: 'Information we collect', body: 'Account details (name, email, role), listing and application content you submit, identity verification documents you upload, and basic usage data like pages visited.' },
      { heading: 'How we use it', body: 'To operate the platform — matching renters with listings, running the application and messaging flow, verifying identity, and improving the product.' },
      { heading: 'Sharing', body: 'Application details are shared with the landlord you apply to. Verification documents are reviewed internally and are never shown to other users. We don’t sell personal data.' },
      { heading: 'Your choices', body: 'You can request a copy of your data or ask us to delete your account at any time by emailing privacy@roomnrent.com.' },
      { heading: 'Data retention', body: 'We keep account and application data for as long as your account is active, plus a limited period afterward for legal and safety record-keeping.' },
      { heading: 'Contact', body: 'Privacy questions: privacy@roomnrent.com.' },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'ROOMNRENT uses a small number of cookies and local-storage entries to keep the site working the way you’d expect.',
    sections: [
      { heading: 'What we use them for', body: 'Keeping you signed in, remembering preferences like light/dark theme, and understanding aggregate usage so we can improve the product.' },
      { heading: 'What we don’t do', body: 'We don’t use cookies to sell your data or track you across unrelated third-party sites.' },
      { heading: 'Managing cookies', body: 'Most browsers let you clear cookies and local storage from their settings. Doing so will sign you out and reset saved preferences.' },
    ],
  },
  help: {
    title: 'Help Center',
    intro: 'Answers to the most common questions about using ROOMNRENT.',
    sections: [
      { heading: 'How do I apply to a room?', body: 'Open any live listing and select "Apply Now." You’ll confirm your move-in date, add a short note for the landlord, and optionally upload an ID for verification.' },
      { heading: 'When does the exact address show up?', body: 'The precise address unlocks automatically once the landlord approves your application. Before that, you’ll see the general neighborhood.' },
      { heading: 'How do I message a landlord?', body: 'Once you’ve applied, use the Message button on the listing or your dashboard to open a conversation.' },
      { heading: 'How do I list a room?', body: 'From your dashboard, choose "Create Listing," pick the listing type, and fill in the details. Your listing is published as soon as you finish the wizard.' },
      { heading: 'Still stuck?', body: 'Reach out from the Contact page and our team will follow up.' },
    ],
  },
  safety: {
    title: 'Safety Center',
    intro: 'A few practical guidelines for renting or listing a room safely.',
    sections: [
      { heading: 'ID verification', body: 'ROOMNRENT lets both renters and landlords upload ID for verification. A verified badge means the person’s identity document has been reviewed — it’s one signal among several, not a guarantee.' },
      { heading: 'Before you move in', body: 'See the room in person or on a video call before sending any money, get the agreement in writing, and trust your instincts if something feels off.' },
      { heading: 'Never wire money to a stranger', body: 'Be cautious of anyone who asks for payment before you’ve seen the room or met in person, especially by wire transfer or gift card.' },
      { heading: 'Report a problem', body: 'Use the report option on a listing or profile, or contact our team directly, and we’ll review it.' },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro: 'We’d love to hear from you — whether it’s a question, feedback, or something that needs our attention.',
    sections: [
      { heading: 'General support', body: 'support@roomnrent.com — we typically reply within one business day.' },
      { heading: 'Trust & safety', body: 'safety@roomnrent.com — for anything urgent involving a listing or user.' },
      { heading: 'Press & partnerships', body: 'press@roomnrent.com' },
    ],
  },
};

export function getInfoPage(slug) {
  return INFO_PAGES[slug];
}
