import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  listingRowToApp,
  listingAppToRow,
  applicationRowToApp,
  applicationAppToRow,
  profileRowToApp,
  reviewRowToApp,
  reviewAppToRow,
  notificationRowToApp,
  sponsorSlotRowToApp,
  sponsorSlotAppToRow,
  reportRowToApp,
  supportTicketRowToApp,
  roomerProfileRowToApp,
  roomerProfileAppToRow,
  listingPhotoRowToApp,
} from '../lib/supabaseMappers';
import { useAuth } from './AuthContext';
import { ACTIVE_LISTING_STATUSES } from '../data/listings';

// Everything in this file is backed by Supabase (see supabase/schema.sql) —
// fetched on mount and whenever the logged-in user changes, since Row Level
// Security returns a different result set per session. `verifications` and
// `hostSubscriptions` stay keyed by email locally (not id) purely so every
// existing consumer — which already matches people by landlordEmail/
// renterEmail throughout the app — didn't need to be rewritten.
const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.user?.id || null;

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [verifications, setVerifications] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sponsorSlots, setSponsorSlots] = useState([]);
  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // Keyed by host email → { billingCycle, subscribedAt } once they've paid
  // for the "Find a Roomer" direct-message upgrade, absent otherwise.
  const [hostSubscriptions, setHostSubscriptions] = useState({});
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [roomerProfiles, setRoomerProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let active = true;
    setListingsLoading(true);
    supabase
      .from('listings')
      .select('*, listing_photos(id, listing_id, storage_path, caption, sort_order)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load listings:', error.message);
        setListings(error ? [] : (data || []).map(listingRowToApp));
        setListingsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    setApplicationsLoading(true);
    supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load applications:', error.message);
        setApplications(error ? [] : (data || []).map(applicationRowToApp));
        setApplicationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load users:', error.message);
        setPlatformUsers(error ? [] : (data || []).map(profileRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('verifications')
      .select('*, profiles(email)')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load verifications:', error.message);
          setVerifications({});
          return;
        }
        const map = {};
        for (const row of data || []) {
          if (!row.profiles?.email) continue;
          map[row.profiles.email] = { status: row.status, fileName: row.file_name, submittedAt: row.submitted_at };
        }
        setVerifications(map);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setFavorites([]);
      return;
    }
    supabase
      .from('favorites')
      .select('*')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load favorites:', error.message);
        setFavorites(error ? [] : (data || []).map((r) => ({ id: r.id, renterId: r.renter_id, listingId: r.listing_id })));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load reviews:', error.message);
        setReviews(error ? [] : (data || []).map(reviewRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('sponsor_slots')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load sponsor slots:', error.message);
        setSponsorSlots(error ? [] : (data || []).map(sponsorSlotRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load reports:', error.message);
        setReports(error ? [] : (data || []).map(reportRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load support tickets:', error.message);
        setTickets(error ? [] : (data || []).map(supportTicketRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setNotifications([]);
      return;
    }
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Failed to load notifications:', error.message);
        setNotifications(error ? [] : (data || []).map(notificationRowToApp));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setHostSubscriptions({});
      setSubscriptionHistory([]);
      return;
    }
    supabase
      .from('host_subscriptions')
      .select('*, profiles(email)')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load host subscriptions:', error.message);
          return;
        }
        const map = {};
        for (const row of data || []) {
          if (!row.profiles?.email) continue;
          map[row.profiles.email] = { billingCycle: row.billing_cycle, subscribedAt: row.subscribed_at };
        }
        setHostSubscriptions(map);
      });
    supabase
      .from('subscription_history')
      .select('*, profiles(email)')
      .order('at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load subscription history:', error.message);
          return;
        }
        setSubscriptionHistory(
          (data || []).map((row) => ({
            id: row.id,
            hostEmail: row.profiles?.email,
            type: row.type,
            tierLabel: row.tier_label,
            price: row.price,
            billingCycle: row.billing_cycle,
            at: row.at,
          })),
        );
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('roomer_profiles')
      .select('*, profiles(id, name, email)')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load roomer profiles:', error.message);
          setRoomerProfiles([]);
          return;
        }
        setRoomerProfiles((data || []).map(roomerProfileRowToApp).filter(Boolean));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Rebuilds the conversation list for whoever is logged in — each entry
  // carries the other participant's info and a preview of the latest
  // message, matching the shape Messaging.jsx renders. Called on mount, and
  // again any time a conversation is created or a message is sent so the
  // inbox preview stays current.
  const refreshConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return;
    }
    const { data: myRows, error: myError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);
    if (myError) {
      console.error('Failed to load conversations:', myError.message);
      setConversations([]);
      return;
    }
    const ids = (myRows || []).map((r) => r.conversation_id);
    if (ids.length === 0) {
      setConversations([]);
      return;
    }
    const { data, error } = await supabase
      .from('conversations')
      .select(
        'id, listing_id, created_at, listings(title), conversation_participants(user_id, last_read_at, profiles(id, name, email)), messages(id, text, sender_id, created_at)',
      )
      .in('id', ids);
    if (error) {
      console.error('Failed to load conversations:', error.message);
      setConversations([]);
      return;
    }
    const mapped = (data || []).map((c) => {
      const participants = c.conversation_participants || [];
      const other = participants.find((p) => p.user_id !== userId)?.profiles;
      const myLastReadAt = participants.find((p) => p.user_id === userId)?.last_read_at;
      const msgs = [...(c.messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => m.sender_id !== userId && (!myLastReadAt || new Date(m.created_at) > new Date(myLastReadAt)),
      ).length;
      return {
        id: c.id,
        listingId: c.listing_id,
        listingTitle: c.listings?.title || '',
        otherUserId: other?.id || null,
        name: other?.name || 'Unknown',
        email: other?.email || null,
        preview: last?.text || 'No messages yet',
        lastAt: last?.created_at || c.created_at,
        unread,
      };
    });
    mapped.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    setConversations(mapped);
  }, [userId]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Inserts a notification for another user (e.g. notifying a landlord that
  // someone applied). Only touches local state when it's for the person
  // currently looking at the app — everyone else picks theirs up next time
  // their own notifications fetch runs.
  const insertNotification = useCallback(
    async (targetUserId, type, text) => {
      if (!targetUserId) return;
      const { data, error } = await supabase
        .from('notifications')
        .insert({ user_id: targetUserId, type, text, read: false })
        .select()
        .single();
      if (error) {
        console.error('Failed to create notification:', error.message);
        return;
      }
      if (targetUserId === userId) {
        setNotifications((prev) => [notificationRowToApp(data), ...prev]);
      }
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      // ---- listings (Supabase) ----
      listings,
      listingsLoading,
      getListingById: (id) => listings.find((l) => String(l.id) === String(id)),
      getListingsByNeighborhood: (slug) => listings.filter((l) => l.neighborhood === slug),
      updateListingStatus: async (id, status) => {
        const { data, error } = await supabase.from('listings').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        const mapped = listingRowToApp(data);
        setListings((prev) => prev.map((l) => (String(l.id) === String(id) ? mapped : l)));
        return mapped;
      },
      updateListing: async (id, patch) => {
        const { data, error } = await supabase
          .from('listings')
          .update(listingAppToRow(patch))
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        const mapped = listingRowToApp(data);
        setListings((prev) => prev.map((l) => (String(l.id) === String(id) ? mapped : l)));
        return mapped;
      },
      deleteListing: async (id) => {
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) throw error;
        setListings((prev) => prev.filter((l) => String(l.id) !== String(id)));
      },
      addListing: async (data) => {
        const row = listingAppToRow({ status: 'live', rating: 0, reviews: 0, tags: [], photos: [], ...data });
        const { data: inserted, error } = await supabase.from('listings').insert(row).select().single();
        if (error) throw error;
        const mapped = listingRowToApp(inserted);
        setListings((prev) => [mapped, ...prev]);
        return mapped;
      },
      // Real photo uploads to the public `listing-photos` Storage bucket —
      // `listing_photos` rows are what PropertyDetail/ListingCard prefer over
      // the deterministic stock-photo pool once at least one exists.
      uploadListingPhoto: async (listingId, file, caption = '', sortOrder = 0) => {
        const path = `${listingId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('listing-photos').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: row, error } = await supabase
          .from('listing_photos')
          .insert({ listing_id: listingId, storage_path: path, caption, sort_order: sortOrder })
          .select()
          .single();
        if (error) throw error;
        const mapped = listingPhotoRowToApp(row);
        setListings((prev) =>
          prev.map((l) => (String(l.id) === String(listingId) ? { ...l, uploadedPhotos: [...(l.uploadedPhotos || []), mapped] } : l)),
        );
        return mapped;
      },
      deleteListingPhoto: async (listingId, photo) => {
        await supabase.storage.from('listing-photos').remove([photo.storagePath]);
        const { error } = await supabase.from('listing_photos').delete().eq('id', photo.id);
        if (error) throw error;
        setListings((prev) =>
          prev.map((l) =>
            String(l.id) === String(listingId)
              ? { ...l, uploadedPhotos: (l.uploadedPhotos || []).filter((p) => p.id !== photo.id) }
              : l,
          ),
        );
      },

      // ---- applications (Supabase) ----
      applications,
      applicationsLoading,
      submitApplication: async (data) => {
        const row = applicationAppToRow({ status: 'submitted', ...data });
        const { data: inserted, error } = await supabase.from('applications').insert(row).select().single();
        if (error) throw error;
        const mapped = applicationRowToApp(inserted);
        setApplications((prev) => [mapped, ...prev]);
        const listing = listings.find((l) => String(l.id) === String(mapped.listingId));
        if (listing?.landlordId) {
          insertNotification(
            listing.landlordId,
            'application',
            `${mapped.renterName} submitted an application for "${listing.title}".`,
          );
        }
        return mapped;
      },
      updateApplicationStatus: async (id, status) => {
        const { data, error } = await supabase
          .from('applications')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        const mapped = applicationRowToApp(data);
        setApplications((prev) => prev.map((a) => (a.id === id ? mapped : a)));
        if (mapped.renterId && status !== 'submitted') {
          const listing = listings.find((l) => String(l.id) === String(mapped.listingId));
          const label = status === 'approved' ? 'was accepted' : `was ${status}`;
          insertNotification(mapped.renterId, 'application', `Your application for "${listing?.title || 'a listing'}" ${label}.`);
        }
        return mapped;
      },
      hasApprovedApplication: (renterEmail, listingId) =>
        applications.some(
          (a) => a.renterEmail === renterEmail && String(a.listingId) === String(listingId) && a.status === 'approved',
        ),

      // ---- platform users (admin) ----
      platformUsers,
      // Soft-ban only — see phase-d-polish.sql. A suspended account can't
      // create new listings/applications (enforced by RLS), but isn't force-
      // logged-out of any session already open (no admin auth API reachable
      // from a publishable-key client for that).
      updateUserStatus: async (email, status) => {
        const { data, error } = await supabase.from('profiles').update({ status }).eq('email', email).select().single();
        if (error) throw error;
        const mapped = profileRowToApp(data);
        setPlatformUsers((prev) => prev.map((u) => (u.email === email ? mapped : u)));
      },

      // ---- verifications ----
      verifications,
      getVerification: (email) => verifications[email] || { status: 'none' },
      submitVerification: async (email, fileName) => {
        const submittedAt = new Date().toISOString();
        const { error } = await supabase
          .from('verifications')
          .upsert({ user_id: userId, status: 'pending', file_name: fileName, submitted_at: submittedAt });
        if (error) throw error;
        setVerifications((prev) => ({ ...prev, [email]: { status: 'pending', fileName, submittedAt } }));
      },
      setVerificationStatus: async (email, status) => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (profileError) throw profileError;
        const { error } = await supabase.from('verifications').update({ status }).eq('user_id', profile.id);
        if (error) throw error;
        setVerifications((prev) => ({ ...prev, [email]: { ...(prev[email] || {}), status } }));
      },
      // Real ID uploads to the private `id-uploads` Storage bucket (used for
      // both self-verification and per-application ID uploads). Returns the
      // storage path — callers save that as the "file name" field, and use
      // getSignedIdFileUrl to view it later (the bucket isn't public).
      uploadIdFile: async (file) => {
        const path = `${userId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('id-uploads').upload(path, file);
        if (error) throw error;
        return path;
      },
      getSignedIdFileUrl: async (path) => {
        const { data, error } = await supabase.storage.from('id-uploads').createSignedUrl(path, 60);
        if (error) throw error;
        return data.signedUrl;
      },

      // ---- favorites ----
      // Keyed by the real user id (not email) — pass currentUser.id in.
      favorites,
      isFavorited: (renterId, listingId) =>
        favorites.some((f) => f.renterId === renterId && String(f.listingId) === String(listingId)),
      toggleFavorite: async (renterId, listingId) => {
        const existing = favorites.find((f) => f.renterId === renterId && String(f.listingId) === String(listingId));
        if (existing) {
          const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
          if (error) throw error;
          setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        } else {
          const { data, error } = await supabase
            .from('favorites')
            .insert({ renter_id: renterId, listing_id: listingId })
            .select()
            .single();
          if (error) throw error;
          setFavorites((prev) => [...prev, { id: data.id, renterId: data.renter_id, listingId: data.listing_id }]);
        }
      },

      // ---- reviews ----
      reviews,
      getReviewsForListing: (listingId) => reviews.filter((r) => String(r.listingId) === String(listingId)),
      addReview: async (review) => {
        const { data, error } = await supabase.from('reviews').insert(reviewAppToRow(review)).select().single();
        if (error) throw error;
        const mapped = reviewRowToApp(data);
        setReviews((prev) => [mapped, ...prev]);
        return mapped;
      },

      // ---- sponsor ads ----
      sponsorSlots,
      addSponsorSlot: async (slot) => {
        const row = sponsorSlotAppToRow({ active: true, impressions: 0, clicks: 0, ...slot });
        const { data, error } = await supabase.from('sponsor_slots').insert(row).select().single();
        if (error) throw error;
        const mapped = sponsorSlotRowToApp(data);
        setSponsorSlots((prev) => [mapped, ...prev]);
        return mapped;
      },
      updateSponsorSlot: async (id, patch) => {
        const { data, error } = await supabase
          .from('sponsor_slots')
          .update(sponsorSlotAppToRow(patch))
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        const mapped = sponsorSlotRowToApp(data);
        setSponsorSlots((prev) => prev.map((s) => (s.id === id ? mapped : s)));
      },
      toggleSponsorSlot: async (id) => {
        const current = sponsorSlots.find((s) => s.id === id);
        if (!current) return;
        const { data, error } = await supabase
          .from('sponsor_slots')
          .update({ active: !current.active })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        const mapped = sponsorSlotRowToApp(data);
        setSponsorSlots((prev) => prev.map((s) => (s.id === id ? mapped : s)));
      },
      deleteSponsorSlot: async (id) => {
        const { error } = await supabase.from('sponsor_slots').delete().eq('id', id);
        if (error) throw error;
        setSponsorSlots((prev) => prev.filter((s) => s.id !== id));
      },
      // Atomic +1 via Postgres RPC (see supabase/phase-d-polish.sql) — safe
      // under concurrent viewers, and works for logged-out visitors too since
      // the function runs as security definer rather than through the
      // normal (write-restricted) sponsor_slots RLS policy.
      recordAdImpression: async (slotId) => {
        const { error } = await supabase.rpc('increment_sponsor_impressions', { p_slot_id: slotId });
        if (error) {
          console.error('Failed to record ad impression:', error.message);
          return;
        }
        setSponsorSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, impressions: (s.impressions || 0) + 1 } : s)));
      },
      recordAdClick: async (slotId) => {
        const { error } = await supabase.rpc('increment_sponsor_clicks', { p_slot_id: slotId });
        if (error) {
          console.error('Failed to record ad click:', error.message);
          return;
        }
        setSponsorSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, clicks: (s.clicks || 0) + 1 } : s)));
      },

      // ---- reports & support ----
      reports,
      resolveReport: async (id) => {
        const { data, error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id).select().single();
        if (error) throw error;
        setReports((prev) => prev.map((r) => (r.id === id ? reportRowToApp(data) : r)));
      },
      tickets,
      resolveTicket: async (id) => {
        const { data, error } = await supabase
          .from('support_tickets')
          .update({ status: 'resolved' })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        setTickets((prev) => prev.map((t) => (t.id === id ? supportTicketRowToApp(data) : t)));
      },
      replyToTicket: async (id, text) => {
        const ticket = tickets.find((t) => t.id === id);
        if (!ticket) return;
        const nextThread = [...ticket.thread, { from: 'admin', text, at: new Date().toISOString() }];
        const { data, error } = await supabase
          .from('support_tickets')
          .update({ thread: nextThread })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        setTickets((prev) => prev.map((t) => (t.id === id ? supportTicketRowToApp(data) : t)));
      },

      // ---- notifications ----
      notifications,
      markNotificationRead: async (id) => {
        const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
        if (error) throw error;
        setNotifications((prev) => prev.map((n) => (n.id === id ? notificationRowToApp(data) : n)));
      },
      markAllNotificationsRead: async () => {
        const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length === 0) return;
        const { error } = await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
        if (error) throw error;
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },

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
      // active listing count at the time). Always acts on the CURRENTLY
      // logged-in host (self-service upgrade/cancel) — `hostEmail` is only
      // used to key the local mock-shaped state, not to pick a target user.
      subscribeHost: async (hostEmail, billingCycle = 'monthly', meta = {}) => {
        const at = new Date().toISOString();
        const { error: subError } = await supabase
          .from('host_subscriptions')
          .upsert({ host_id: userId, billing_cycle: billingCycle, subscribed_at: at });
        if (subError) throw subError;
        const { data: histRow, error: histError } = await supabase
          .from('subscription_history')
          .insert({ host_id: userId, type: 'subscribed', billing_cycle: billingCycle, tier_label: meta.tierLabel, price: meta.price, at })
          .select()
          .single();
        if (histError) throw histError;
        setHostSubscriptions((prev) => ({ ...prev, [hostEmail]: { billingCycle, subscribedAt: at } }));
        setSubscriptionHistory((prev) => [
          { id: histRow.id, hostEmail, type: 'subscribed', billingCycle, at, ...meta },
          ...prev,
        ]);
      },
      unsubscribeHost: async (hostEmail, meta = {}) => {
        const at = new Date().toISOString();
        const { error: delError } = await supabase.from('host_subscriptions').delete().eq('host_id', userId);
        if (delError) throw delError;
        const { data: histRow, error: histError } = await supabase
          .from('subscription_history')
          .insert({ host_id: userId, type: 'cancelled', billing_cycle: meta.billingCycle, tier_label: meta.tierLabel, price: meta.price, at })
          .select()
          .single();
        if (histError) throw histError;
        setHostSubscriptions((prev) => {
          const next = { ...prev };
          delete next[hostEmail];
          return next;
        });
        setSubscriptionHistory((prev) => [{ id: histRow.id, hostEmail, type: 'cancelled', at, ...meta }, ...prev]);
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

      // ---- Find a Roomer directory (real renter opt-in profiles) ----
      roomerProfiles,
      getMyRoomerProfile: () => roomerProfiles.find((r) => r.id === userId) || null,
      upsertRoomerProfile: async (data) => {
        const row = { user_id: userId, ...roomerProfileAppToRow(data) };
        const { data: saved, error } = await supabase
          .from('roomer_profiles')
          .upsert(row)
          .select('*, profiles(id, name, email)')
          .single();
        if (error) throw error;
        const mapped = roomerProfileRowToApp(saved);
        setRoomerProfiles((prev) => (prev.some((r) => r.id === mapped.id) ? prev.map((r) => (r.id === mapped.id ? mapped : r)) : [...prev, mapped]));
        return mapped;
      },
      deleteRoomerProfile: async () => {
        const { error } = await supabase.from('roomer_profiles').delete().eq('user_id', userId);
        if (error) throw error;
        setRoomerProfiles((prev) => prev.filter((r) => r.id !== userId));
      },

      // ---- Messaging (real conversations/messages) ----
      conversations,
      refreshConversations,
      // Finds an existing 1:1 conversation with `otherUserId` (scoped to
      // `listingId` when given), or creates one. Two sequential inserts —
      // add self, then add the other person — because the RLS policy for
      // adding someone else requires the requester to already be a
      // participant, which is only true after the first insert commits.
      getOrCreateConversation: async (otherUserId, listingId = null) => {
        const { data: mine } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId);
        const myIds = (mine || []).map((r) => r.conversation_id);
        if (myIds.length > 0) {
          const { data: theirs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', myIds);
          const candidateIds = (theirs || []).map((r) => r.conversation_id);
          if (candidateIds.length > 0) {
            let query = supabase.from('conversations').select('id').in('id', candidateIds);
            query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null);
            const { data: existing } = await query.limit(1).maybeSingle();
            if (existing) return existing.id;
          }
        }
        const { data: convo, error: convoError } = await supabase
          .from('conversations')
          .insert({ listing_id: listingId })
          .select()
          .single();
        if (convoError) throw convoError;
        const { error: selfError } = await supabase
          .from('conversation_participants')
          .insert({ conversation_id: convo.id, user_id: userId });
        if (selfError) throw selfError;
        const { error: otherError } = await supabase
          .from('conversation_participants')
          .insert({ conversation_id: convo.id, user_id: otherUserId });
        if (otherError) throw otherError;
        await refreshConversations();
        return convo.id;
      },
      fetchMessages: async (conversationId) => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map((m) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          text: m.text,
          createdAt: m.created_at,
        }));
      },
      sendMessage: async (conversationId, text) => {
        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id: conversationId, sender_id: userId, text })
          .select()
          .single();
        if (error) throw error;
        const convo = conversations.find((c) => c.id === conversationId);
        if (convo?.otherUserId) {
          const senderName = platformUsers.find((u) => u.id === userId)?.name || 'Someone';
          insertNotification(convo.otherUserId, 'message', `${senderName} sent you a new message.`);
        }
        refreshConversations();
        return { id: data.id, conversationId: data.conversation_id, senderId: data.sender_id, text: data.text, createdAt: data.created_at };
      },
      // Call when a conversation is opened — updates my own participant row
      // so the unread badge for it clears (and stays clear as long as I
      // don't get a new message after this timestamp).
      markConversationRead: async (conversationId) => {
        const now = new Date().toISOString();
        const { error } = await supabase
          .from('conversation_participants')
          .update({ last_read_at: now })
          .eq('conversation_id', conversationId)
          .eq('user_id', userId);
        if (error) {
          console.error('Failed to mark conversation read:', error.message);
          return;
        }
        setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
      },
      totalUnreadMessages: conversations.reduce((sum, c) => sum + (c.unread || 0), 0),
    }),
    [
      listings,
      listingsLoading,
      applications,
      applicationsLoading,
      platformUsers,
      verifications,
      favorites,
      reviews,
      sponsorSlots,
      reports,
      tickets,
      notifications,
      hostSubscriptions,
      subscriptionHistory,
      roomerProfiles,
      conversations,
      refreshConversations,
      userId,
      insertNotification,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
