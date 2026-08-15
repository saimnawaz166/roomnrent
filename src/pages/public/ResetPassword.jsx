import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

// Landing spot for the link in a Supabase password-reset email. Clicking
// that link gives the browser a short-lived "recovery" session automatically
// (supabase-js picks the token up from the URL) — enough to call
// updateUser({ password }) here, nothing else.
export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not update your password. The reset link may have expired — request a new one.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-14">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <Logo />
        </div>

        {done ? (
          <div className="rounded-2xl border border-sage/40 bg-sage-soft px-5 py-6 text-center">
            <div className="font-display mb-2 font-bold text-sage-text">Password updated</div>
            <p className="text-[13.5px] leading-relaxed text-ink/65 dark:text-cream/65">
              You can now log in with your new password.
            </p>
            <Button className="mt-5 w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="font-display mb-2 text-2xl font-extrabold">Set a new password</h1>
            <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">Choose a new password for your account.</p>

            {error && (
              <div className="mb-5 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
                {error}
              </div>
            )}

            <div className="mb-6 flex flex-col gap-3.5">
              <div>
                <div className="mb-1.5 text-[13px] font-bold">New password</div>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3.5 text-[14.5px] outline-none focus:border-ink/40"
                />
              </div>
              <div>
                <div className="mb-1.5 text-[13px] font-bold">Confirm password</div>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3.5 text-[14.5px] outline-none focus:border-ink/40"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
