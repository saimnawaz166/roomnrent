// Back-compat re-export — the demo "Viewing as" role switcher this file used
// to implement has been replaced by real Supabase auth in AuthContext.jsx.
// Every page/component in the app imports useRole/useCurrentUser from here;
// keeping this file (instead of rewriting every import) means the swap to
// real auth didn't require touching ~13 unrelated files.
export { useRole, useCurrentUser } from './AuthContext';
