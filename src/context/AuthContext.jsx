import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Real Supabase-backed auth — replaces the old demo "Viewing as" role
// switcher. `session` is the raw Supabase auth session; `profile` is the
// matching row from `public.profiles` (id, email, name, role), which is
// what the rest of the app actually reads via useCurrentUser()/useRole().
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile(userId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (active) setProfile(data || null);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });

    // Fires on sign-in, sign-out, and token refresh — keeps `profile` in
    // sync with whoever is actually logged in right now.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Supabase projects default to requiring email confirmation — if so,
  // signUp() succeeds but returns no session yet (nothing to redirect to
  // until the user clicks the confirmation link). Callers should check the
  // return value's `session` before navigating to the dashboard.
  async function signUp(email, password, name, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;
    return { session: data.session };
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // Emails a reset link pointing at /reset-password. Clicking it gives the
  // browser a temporary "recovery" session — just enough to call
  // updateUser({ password }) below, nothing else.
  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  const value = { session, profile, loading, signUp, signIn, signOut, resetPassword, updatePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Back-compat shims — every page/component that used to read the demo role
// switcher via useRole()/useCurrentUser() keeps working unchanged, now
// backed by the real logged-in profile instead of fake state. `setRole` is
// gone: there's nothing to switch anymore, the role comes from the account.
export function useRole() {
  const { profile } = useAuth();
  return { role: profile?.role || 'renter' };
}

export function useCurrentUser() {
  const { profile } = useAuth();
  return profile || { id: null, role: 'renter', name: '', email: '' };
}
