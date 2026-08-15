// Translates between Postgres snake_case rows and the camelCase shapes the
// app already used for mock data (src/data/listings.js, src/data/applications.js)
// — keeps every existing consumer (ListingCard, PropertyDetail, dashboards,
// etc.) working against the same field names whether the data came from
// SEED_LISTINGS or a real `listings` table.
import { supabase } from './supabaseClient';

// `listing-photos` is a public bucket — a storage path converts to a stable,
// permanent public URL with no auth needed, safe to compute on every map.
export function listingPhotoPublicUrl(storagePath) {
  return supabase.storage.from('listing-photos').getPublicUrl(storagePath).data.publicUrl;
}

export function listingPhotoRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    url: listingPhotoPublicUrl(row.storage_path),
    storagePath: row.storage_path,
    caption: row.caption,
    sortOrder: row.sort_order,
  };
}

// `row.listing_photos` is the embedded relation from
// `.select('*, listing_photos(...)')` — real uploads, if any exist for this
// listing. Empty when nobody has uploaded real photos yet, in which case
// callers fall back to the deterministic stock-photo pool (src/lib/photos.js).
export function listingRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    landlordId: row.landlord_id,
    landlordName: row.landlord_name,
    landlordEmail: row.landlord_email,
    title: row.title,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    zip: row.zip,
    price: row.price,
    period: row.period,
    beds: row.beds,
    type: row.type,
    roomType: row.room_type,
    listingType: row.listing_type,
    leaseEndDate: row.lease_end_date,
    transferFee: row.transfer_fee,
    rating: row.rating,
    reviews: row.reviews_count,
    tags: row.tags || [],
    furnished: row.furnished,
    utilitiesIncluded: row.utilities_included,
    currentPetsPresent: row.current_pets_present,
    status: row.status,
    blurb: row.blurb,
    roommates: row.roommates,
    bathroomType: row.bathroom_type,
    minStay: row.min_stay,
    deposit: row.deposit,
    parking: row.parking,
    petPolicy: row.pet_policy,
    smokingPolicy: row.smoking_policy,
    amenities: row.amenities || [],
    photos: row.photos || [],
    availableFrom: row.available_from,
    flagged: row.flagged,
    createdAt: row.created_at,
    uploadedPhotos: (row.listing_photos || [])
      .map(listingPhotoRowToApp)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

const LISTING_FIELD_MAP = {
  landlordId: 'landlord_id',
  landlordName: 'landlord_name',
  landlordEmail: 'landlord_email',
  title: 'title',
  city: 'city',
  neighborhood: 'neighborhood',
  address: 'address',
  zip: 'zip',
  price: 'price',
  period: 'period',
  beds: 'beds',
  type: 'type',
  roomType: 'room_type',
  listingType: 'listing_type',
  leaseEndDate: 'lease_end_date',
  transferFee: 'transfer_fee',
  rating: 'rating',
  reviews: 'reviews_count',
  tags: 'tags',
  furnished: 'furnished',
  utilitiesIncluded: 'utilities_included',
  currentPetsPresent: 'current_pets_present',
  status: 'status',
  blurb: 'blurb',
  roommates: 'roommates',
  bathroomType: 'bathroom_type',
  minStay: 'min_stay',
  deposit: 'deposit',
  parking: 'parking',
  petPolicy: 'pet_policy',
  smokingPolicy: 'smoking_policy',
  amenities: 'amenities',
  photos: 'photos',
  availableFrom: 'available_from',
  flagged: 'flagged',
};

// Only includes keys actually present on `listing` — lets callers pass a
// partial patch (e.g. `updateListing(id, { status: 'paused' })`) without
// accidentally nulling out every other column.
export function listingAppToRow(listing) {
  const row = {};
  for (const [appKey, dbKey] of Object.entries(LISTING_FIELD_MAP)) {
    if (listing[appKey] !== undefined) row[dbKey] = listing[appKey];
  }
  return row;
}

export function applicationRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    renterId: row.renter_id,
    renterName: row.renter_name,
    renterEmail: row.renter_email,
    moveInDate: row.move_in_date,
    note: row.note,
    status: row.status,
    idFileName: row.id_file_name,
    createdAt: row.created_at,
  };
}

const APPLICATION_FIELD_MAP = {
  listingId: 'listing_id',
  renterId: 'renter_id',
  renterName: 'renter_name',
  renterEmail: 'renter_email',
  moveInDate: 'move_in_date',
  note: 'note',
  status: 'status',
  idFileName: 'id_file_name',
};

export function applicationAppToRow(app) {
  const row = {};
  for (const [appKey, dbKey] of Object.entries(APPLICATION_FIELD_MAP)) {
    if (app[appKey] !== undefined) row[dbKey] = app[appKey];
  }
  return row;
}

export function profileRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function reviewRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    fromId: row.from_id,
    fromName: row.from_name,
    fromRole: row.from_role,
    toId: row.to_id,
    toName: row.to_name,
    toRole: row.to_role,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at,
  };
}

export function reviewAppToRow(review) {
  return {
    listing_id: review.listingId,
    from_id: review.fromId,
    from_name: review.fromName,
    from_role: review.fromRole,
    to_id: review.toId,
    to_name: review.toName,
    to_role: review.toRole,
    rating: review.rating,
    text: review.text,
  };
}

export function notificationRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    text: row.text,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function sponsorSlotRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    blurb: row.blurb,
    active: row.active,
    impressions: row.impressions,
    clicks: row.clicks,
    placements: row.placements || [],
    neighborhoodSlugs: row.neighborhood_slugs || [],
  };
}

const SPONSOR_SLOT_FIELD_MAP = {
  type: 'type',
  label: 'label',
  blurb: 'blurb',
  active: 'active',
  impressions: 'impressions',
  clicks: 'clicks',
  placements: 'placements',
  neighborhoodSlugs: 'neighborhood_slugs',
};

export function sponsorSlotAppToRow(slot) {
  const row = {};
  for (const [appKey, dbKey] of Object.entries(SPONSOR_SLOT_FIELD_MAP)) {
    if (slot[appKey] !== undefined) row[dbKey] = slot[appKey];
  }
  return row;
}

export function reportRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reportedBy: row.reported_by_name,
    type: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function supportTicketRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fromName: row.from_name,
    type: row.type,
    subject: row.subject,
    status: row.status,
    thread: row.thread || [],
    createdAt: row.created_at,
  };
}

// `row` is a roomer_profiles row with its `profiles` relation embedded
// (select('*, profiles(id, name, email)')) — merges the two into the flat
// shape RoomerCard already expects (id/name/email + the profile fields).
export function roomerProfileRowToApp(row) {
  if (!row || !row.profiles) return null;
  return {
    id: row.profiles.id,
    name: row.profiles.name,
    email: row.profiles.email,
    age: row.age,
    occupation: row.occupation,
    bio: row.bio,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    moveInDate: row.move_in_date,
    neighborhoods: row.neighborhoods || [],
    tags: row.tags || [],
    verified: row.verified,
  };
}

const ROOMER_PROFILE_FIELD_MAP = {
  age: 'age',
  occupation: 'occupation',
  bio: 'bio',
  budgetMin: 'budget_min',
  budgetMax: 'budget_max',
  moveInDate: 'move_in_date',
  neighborhoods: 'neighborhoods',
  tags: 'tags',
};

export function roomerProfileAppToRow(profile) {
  const row = {};
  for (const [appKey, dbKey] of Object.entries(ROOMER_PROFILE_FIELD_MAP)) {
    if (profile[appKey] !== undefined) row[dbKey] = profile[appKey];
  }
  return row;
}
