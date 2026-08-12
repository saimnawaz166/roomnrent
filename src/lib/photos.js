// Deterministic stand-in photos for listings and people, until there's real
// image upload/storage. The same listing id / person seed always resolves
// to the same picks (in the same order) so the UI doesn't reshuffle images
// on every render or page reload — it just looks like a normal photo set.

// Curated, verified-reachable Unsplash interior/apartment photos — real
// bedrooms, living rooms, and kitchens so listing cards look like an actual
// rental site instead of empty placeholder tiles.
const LISTING_PHOTO_IDS = [
  '1522708323590-d24dbb6b0267',
  '1522771739844-6a9f6d5f14af',
  '1560448204-e02f11c3d0e2',
  '1493809842364-78817add7ffb',
  '1502672260266-1c1ef2d93688',
  '1484154218962-a197022b5858',
  '1512918728675-ed5a9ecdebfd',
  '1560185127-6ed189bf02f4',
  '1505873242700-f289a29e1e0f',
  '1571508601891-ca5e7a713859',
  '1598928506311-c55ded91a20c',
  '1631679706909-1844bbd07221',
  '1523755231516-e43fd2e8dca5',
];

function hashSeed(value) {
  const str = String(value);
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Returns `count` interior photo URLs for a given listing id — always the
// same set, in the same order, for the same id (cycles through the pool
// with an id-based offset so different listings show different photos).
export function getListingPhotos(listingId, count = 6) {
  const base = hashSeed(listingId);
  const n = LISTING_PHOTO_IDS.length;
  return Array.from({ length: count }, (_, i) => {
    const photoId = LISTING_PHOTO_IDS[(base + i) % n];
    return `https://images.unsplash.com/photo-${photoId}?w=800&q=80&auto=format&fit=crop`;
  });
}

export function getListingPhoto(listingId, index = 0) {
  return getListingPhotos(listingId, index + 1)[index];
}

// Stable "profile photo" for a person, keyed by any unique value (email is
// best; falls back to a name or id when that's all that's available).
export function getAvatarUrl(seed) {
  const n = (hashSeed(seed) % 70) + 1; // pravatar.cc serves faces 1–70
  return `https://i.pravatar.cc/150?img=${n}`;
}
