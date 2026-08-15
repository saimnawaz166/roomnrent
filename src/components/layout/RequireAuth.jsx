import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Gates every /dashboard-style route behind a real Supabase session —
// wraps the DashboardLayout route group in App.jsx. Unauthenticated visitors
// get bounced to /login with the page they wanted stashed in location state,
// so Auth.jsx can send them back after a successful sign-in.
export default function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50 dark:text-cream/50">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
