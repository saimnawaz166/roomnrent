import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ThemeProvider } from './context/ThemeContext';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import RequireAuth from './components/layout/RequireAuth';

import Landing from './pages/public/Landing';
import Browse from './pages/public/Browse';
import PropertyDetail from './pages/public/PropertyDetail';
import NeighborhoodPage from './pages/public/NeighborhoodPage';
import Apply from './pages/public/Apply';
import Auth from './pages/public/Auth';
import ResetPassword from './pages/public/ResetPassword';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import InfoPage from './pages/public/InfoPage';
import NotFound from './pages/public/NotFound';

import Dashboard from './pages/dashboard/Dashboard';
import FindRoomer from './pages/dashboard/FindRoomer';
import Subscription from './pages/dashboard/Subscription';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserDetail from './pages/dashboard/UserDetail';
import ListingWizard from './pages/dashboard/ListingWizard';
import ApplicationDetail from './pages/dashboard/ApplicationDetail';
import Messaging from './pages/dashboard/Messaging';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Landing />} />
              <Route path="browse" element={<Browse />} />
              <Route path="neighborhoods/:slug" element={<NeighborhoodPage />} />
              <Route path="listings/:id" element={<PropertyDetail />} />
              <Route path="apply/:id" element={<Apply />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="login" element={<Auth />} />
              <Route path="signup" element={<Auth />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="about" element={<InfoPage slug="about" />} />
              <Route path="careers" element={<InfoPage slug="careers" />} />
              <Route path="press" element={<InfoPage slug="press" />} />
              <Route path="terms" element={<InfoPage slug="terms" />} />
              <Route path="privacy" element={<InfoPage slug="privacy" />} />
              <Route path="cookies" element={<InfoPage slug="cookies" />} />
              <Route path="help" element={<InfoPage slug="help" />} />
              <Route path="safety" element={<InfoPage slug="safety" />} />
              <Route path="contact" element={<InfoPage slug="contact" />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/:tab" element={<Dashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users/:email" element={<UserDetail />} />
                <Route path="admin/:tab" element={<AdminDashboard />} />
                <Route path="listings/new" element={<ListingWizard />} />
                <Route path="listings/:id/edit" element={<ListingWizard />} />
                <Route path="find-a-roomer" element={<FindRoomer />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="applications/:id" element={<ApplicationDetail />} />
                <Route path="messages" element={<Messaging />} />
                <Route path="messages/:id" element={<Messaging />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
