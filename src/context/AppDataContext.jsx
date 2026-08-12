import { createContext, useContext, useMemo, useState } from 'react';
import { SEED_LISTINGS } from '../data/listings';
import { SEED_APPLICATIONS } from '../data/applications';
import { SEED_VERIFICATIONS } from '../data/verifications';
import { SEED_REVIEWS } from '../data/reviews';
import { SEED_SPONSOR_SLOTS } from '../data/sponsors';
import { SEED_REPORTS, SEED_SUPPORT_TICKETS } from '../data/support';
import { NOTIFICATIONS as SEED_NOTIFICATIONS } from '../data/messaging';
import { ACTIVE_LISTING_STATUSES } from '../data/listings';

// Single in-memory store for everything that needs to be mutable and shared
// across pages (apply on one page, see it in a dashboard on another) until
// there's a real backend. Resets on refresh — that's fine for a frontend-only
// build; swap the useState initializers for API calls once one exists.
const AppDataContext = createContext(null);

let uidCounter = 1000;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}-${uidCounter}`;
}

export function AppDataProvider({ children }) {
  const [listings, setListings] = useState(SEED_LISTINGS);
  const [applications, setApplications] = useState(SEED_APPLICATIONS);
  const [verifications, setVerifications] = useState(SEED_VERIFICATIONS);
  const [favorites, setFavorites] = useState([{ renterEmail: 'priya@mail.com', listingId: 2 }]);
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [sponsorSlots, setSponsorSlots] = useState(SEED_SPONSOR_SLOTS);
  const [reports, setReports] = useState(SEED_REPORTS);
  const [tickets, setTickets] = useState(SEED_SUPPORT_TICKETS);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  // Keyed by host email → { billingCycle, subscribedAt } once they've paid
  // for the "Find a Roomer" direct-message upgrade, absent otherwise. No
  // real billing yet, so this is just state a demo host can flip on/off from
  // the Subscription page.
  const [hostSubscriptions, setHostSubscriptions] = useState({});
  // Append-only log of subscribe/cancel events per host, newest first —
  // powers the "Subscription history" list on the Subscription page.
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  const value = useMemo(
    () => ({
      // ---- listings ----
      listings,
      getListingById: (id) => listings.find((l) => String(l.id) === String(id)),
      getListingsByNeighborhood: (slug) => listings.filter((l) => l.neighborhood === slug),
      updateListingStatus: (id, status) =>
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l))),
      updateListing: (id, patch) =>
        setListings((prev) => prev.map((l) => (String(l.id) === String(id) ? { ...l, ...patch } : l))),
      deleteListing: (id) => setListings((prev) => prev.filter((l) => String(l.id) !== String(id))),
      addListing: (data) => {
        const listing = {
          id: uid('listing'),
          status: 'live',
          rating: 0,
          reviews: 0,
          tags: [],
          photos: [],
          createdAt: new Date().toISOString(),
          ...data,
        };
        setListings((prev) => [listing, ...prev]);
        return listing;
      },

      // ---- applications ----
      applications,
      submitApplication: (data) => {
        const app = { id: uid('app'), status: 'submitted', createdAt: new Date().toISOString(), ...data };
        setApplications((prev) => [app, ...prev]);
        return app;
      },
      updateApplicationStatus: (id, status) =>
        setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a))),
      hasApprovedApplication: (renterEmail, listingId) =>
        applications.some(
          (a) => a.renterEmail === renterEmail && String(a.listingId) === String(listingId) && a.status === 'approved',
        ),

      // ---- verifications ----
      verifications,
      getVerification: (email) => verifications[email] || { status: 'none' },
      submitVerification: (email, fileName) =>
        setVerifications((prev) => ({ ...prev, [email]: { status: 'pending', fileName, submittedAt: new Date().toISOString() } })),
      setVerificationStatus: (email, status) =>
        setVerifications((prev) => ({ ...prev, [email]: { ...(prev[email] || {}), status } })),

      // ---- favorites ----
      favorites,
      isFavorited: (email, listingId) => favorites.some((f) => f.renterEmail === email && f.listingId === listingId),
      toggleFavorite: (email, listingId) =>
        setFavorites((prev) =>
          prev.some((f) => f.renterEmail === email && f.listingId === listingId)
            ? prev.filter((f) => !(f.renterEmail === email && f.listingId === listingId))
            : [...prev, { renterEmail: email, listingId }],
        ),

      // ---- reviews ----
      reviews,
      getReviewsForListing: (listingId) => reviews.filter((r) => String(r.listingId) === String(listingId)),
      addReview: (review) => setReviews((prev) => [{ id: uid('rev'), createdAt: new Date().toISOString(), ...review }, ...prev]),

      // ---- sponsor ads ----
      sponsorSlots,
      addSponsorSlot: (slot) =>
        setSponsorSlots((prev) => [...prev, { id: uid('sponsor'), active: true, impressions: 0, clicks: 0, ...slot }]),
      updateSponsorSlot: (id, patch) =>
        setSponsorSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      toggleSponsorSlot: (id) =>
        setSponsorSlots((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))),
      deleteSponsorSlot: (id) => setSponsorSlots((prev) => prev.filter((s) => s.id !== id)),

      // ---- reports & support ----
      reports,
      resolveReport: (id) => setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r))),
      tickets,
      resolveTicket: (id) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t))),
      replyToTicket: (id, text) =>
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, thread: [...t.thread, { from: 'admin', text, at: new Date().toISOString() }] } : t,
          ),
        ),

      // ---- notifications ----
      notifications,
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllNotificationsRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),

      // ---- Find a Roomer access (host tiers) ----
      // Tier 0: no active listing → locked/silhouette directory, CTA to list a room.
      // Tier 1: active listing (live or coming_soon) → full profiles, but can only
      //         message a roomer who has already applied to one of this host's listings.
      // Tier 2: active listing + paid subscription → can message anyone.
      getActiveListingCount: (hostEmail) =>
        listings.filter((l) => l.landlordEmail === hostEmail && ACTIVE_LISTING_STATUSES.includes(l.status)).length,
      hasSubscription: (hostEmail) => !!hostSubscriptions[hostEmail],
      getHostSubscription: (hostEmail) => hostSubscriptions[hostEmail] || null,
      getSubscriptionHistory: (hostEmail) => subscriptionHistory.filter((h) => h.hostEmail === hostEmail),
      // `meta` carries display info the caller already has (tier label, price,
      // active listing count at the time) so the history log is self-contained
      // even after listings/pricing change later.
      subscribeHost: (hostEmail, billingCycle = 'monthly', meta = {}) => {
        const at = new Date().toISOString();
        setHostSubscriptions((prev) => ({ ...prev, [hostEmail]: { billingCycle, subscribedAt: at } }));
        setSubscriptionHistory((prev) => [
          { id: uid('sub'), hostEmail, type: 'subscribed', billingCycle, at, ...meta },
          ...prev,
        ]);
      },
      unsubscribeHost: (hostEmail, meta = {}) => {
        const at = new Date().toISOString();
        setHostSubscriptions((prev) => {
          const next = { ...prev };
          delete next[hostEmail];
          return next;
        });
        setSubscriptionHistory((prev) => [{ id: uid('sub'), hostEmail, type: 'cancelled', at, ...meta }, ...prev]);
      },
      getHostAccessTier: (hostEmail) => {
        const hasActiveListing = listings.some(
          (l) => l.landlordEmail === hostEmail && ACTIVE_LISTING_STATUSES.includes(l.status),
        );
        const isSubscribed = !!hostSubscriptions[hostEmail];
        const tier = !hasActiveListing ? 0 : isSubscribed ? 2 : 1;
        return { tier, hasActiveListing, isSubscribed };
      },
      hasRoomerApplied: (hostEmail, roomerEmail) => {
        const myListingIds = new Set(listings.filter((l) => l.landlordEmail === hostEmail).map((l) => l.id));
        return applications.some((a) => a.renterEmail === roomerEmail && myListingIds.has(a.listingId));
      },
      canMessageRoomer: (hostEmail, roomerEmail) => {
        const hasActiveListing = listings.some(
          (l) => l.landlordEmail === hostEmail && ACTIVE_LISTING_STATUSES.includes(l.status),
        );
        if (!hasActiveListing) return false;
        if (hostSubscriptions[hostEmail]) return true;
        const myListingIds = new Set(listings.filter((l) => l.landlordEmail === hostEmail).map((l) => l.id));
        return applications.some((a) => a.renterEmail === roomerEmail && myListingIds.has(a.listingId));
      },
    }),
    [
      listings,
      applications,
      verifications,
      favorites,
      reviews,
      sponsorSlots,
      reports,
      tickets,
      notifications,
      hostSubscriptions,
      subscriptionHistory,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
