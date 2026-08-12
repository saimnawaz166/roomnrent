import { createContext, useContext, useState } from 'react';

// Stands in for real auth/session state until the backend exists. Lets the
// dashboard demo switch between renter / landlord / admin views, each backed
// by a fixed demo identity so applications, reviews, and verification have
// someone consistent to attach to.
const RoleContext = createContext(null);

export const DEMO_USERS = {
  renter: { role: 'renter', name: 'Priya Nair', email: 'priya@mail.com' },
  landlord: { role: 'landlord', name: 'Elena Ruiz', email: 'elena@mail.com' },
  admin: { role: 'admin', name: 'Admin User', email: 'admin@roomnrent.com' },
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState('renter');
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}

// Convenience hook for pages that just need "who am I right now" (name/email)
// rather than the raw role + setter.
export function useCurrentUser() {
  const { role } = useRole();
  return DEMO_USERS[role];
}
