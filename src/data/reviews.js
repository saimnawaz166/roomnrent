export const SEED_REVIEWS = [
  {
    id: 'rev-1',
    listingId: 1,
    fromName: 'Marcus Webb',
    fromRole: 'renter',
    toName: 'Elena Ruiz',
    toRole: 'landlord',
    rating: 5,
    text: 'Elena was easy to talk to and fixed a leaky faucet the same day I mentioned it. Would rent from her again.',
    createdAt: '2026-07-25T00:00:00.000Z',
  },
  {
    id: 'rev-2',
    listingId: 1,
    fromName: 'Elena Ruiz',
    fromRole: 'landlord',
    toName: 'Marcus Webb',
    toRole: 'renter',
    rating: 5,
    text: 'Marcus was quiet, paid on time every month, and always gave a heads up before having guests over. Great renter.',
    createdAt: '2026-07-26T00:00:00.000Z',
  },
];

export const SEED_HOUSEHOLD_MEMBERS = {
  1: [{ id: 'hm-1', name: 'Jordan Lee', note: 'Lives in the other upstairs room. Works evenings, keeps common areas clean.' }],
  3: [{ id: 'hm-2', name: 'Amara Diallo', note: 'One of the two current housemates. Product designer, quiet during the week.' }],
  4: [{ id: 'hm-3', name: 'Terrence W.', note: 'Works evenings, mostly around on weekends.' }],
};
