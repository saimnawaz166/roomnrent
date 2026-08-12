import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import RenterDashboard from './RenterDashboard';
import LandlordDashboard from './LandlordDashboard';

// /dashboard shows the renter or landlord view depending on the signed-in
// role. Admins are redirected to their own /admin dashboard.
export default function Dashboard() {
  const { role } = useRole();

  if (role === 'admin') return <Navigate to="/admin" replace />;
  return role === 'landlord' ? <LandlordDashboard /> : <RenterDashboard />;
}
