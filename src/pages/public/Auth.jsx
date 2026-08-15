import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'login');
  const [accountType, setAccountType] = useState('renter');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // True once signup succeeded but Supabase requires email confirmation
  // before a session exists — nothing to redirect to yet.
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  function switchMode(next) {
    setMode(next);
    setError('');
    setConfirmEmailSent(false);
    setResetSent(false);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'Could not send a reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log in. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { session } = await signUp(email, password, name, accountType);
      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        setConfirmEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-88px-1px)]">
      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Logo />
          </div>

          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="mb-6 flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-ink/55 dark:text-cream/55 hover:text-ink dark:hover:text-cream"
            >
              ← Back to log in
            </button>
          ) : (
            <div className="mb-9 flex gap-1.5 rounded-full bg-cream dark:bg-[#141414] p-1">
              <TabButton active={mode === 'login'} onClick={() => switchMode('login')}>
                Log In
              </TabButton>
              <TabButton active={mode === 'signup'} onClick={() => switchMode('signup')}>
                Sign Up
              </TabButton>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
              {error}
            </div>
          )}

          {mode === 'signup' && confirmEmailSent ? (
            <div className="rounded-2xl border border-sage/40 bg-sage-soft px-5 py-6 text-center">
              <div className="font-display mb-2 font-bold text-sage-text">Check your email</div>
              <p className="text-[13.5px] leading-relaxed text-ink/65 dark:text-cream/65">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then log
                in.
              </p>
              <Button className="mt-5 w-full" onClick={() => switchMode('login')}>
                Back to log in
              </Button>
            </div>
          ) : mode === 'forgot' ? (
            resetSent ? (
              <div className="rounded-2xl border border-sage/40 bg-sage-soft px-5 py-6 text-center">
                <div className="font-display mb-2 font-bold text-sage-text">Check your email</div>
                <p className="text-[13.5px] leading-relaxed text-ink/65 dark:text-cream/65">
                  We sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <h1 className="font-display mb-2 text-2xl font-extrabold">Reset your password</h1>
                <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">
                  Enter your account email and we'll send you a reset link.
                </p>
                <Field
                  label="Email"
                  placeholder="you@email.com"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={submitting} className="mt-6 w-full">
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            )
          ) : mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <h1 className="font-display mb-2 text-2xl font-extrabold">Welcome back</h1>
              <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">Log in to manage your listings and applications.</p>
              <div className="mb-5 flex flex-col gap-3.5">
                <Field
                  label="Email"
                  placeholder="you@email.com"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="mb-6 block w-full cursor-pointer text-right text-[13px] font-bold text-amber-dark"
              >
                Forgot password?
              </button>
              <Button type="submit" disabled={submitting} className="mb-4 w-full">
                {submitting ? 'Logging in…' : 'Log In'}
              </Button>
              <p className="text-center text-[13.5px] text-ink/55 dark:text-cream/55">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-bold text-amber-dark cursor-pointer">
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <h1 className="font-display mb-2 text-2xl font-extrabold">Create your account</h1>
              <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">Join ROOMNRENT as a renter or landlord.</p>
              <div className="mb-5 flex gap-2.5">
                <RoleOption active={accountType === 'renter'} onClick={() => setAccountType('renter')}>
                  I&apos;m a Renter
                </RoleOption>
                <RoleOption active={accountType === 'landlord'} onClick={() => setAccountType('landlord')}>
                  I&apos;m a Landlord
                </RoleOption>
              </div>
              <div className="mb-6 flex flex-col gap-3.5">
                <Field
                  label="Full name"
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Field
                  label="Email"
                  placeholder="you@email.com"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={submitting} className="mb-4 w-full">
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
              <p className="text-center text-[13.5px] text-ink/55 dark:text-cream/55">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-bold text-amber-dark cursor-pointer">
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
      <div className="relative hidden flex-1 lg:block">
        <img
          src="/login-hero.jpg"
          alt="A cozy, sunlit bedroom in a shared rental apartment"
          className="h-full w-full object-cover object-left"
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-2.5 text-sm font-bold cursor-pointer transition-colors ${
        active ? 'bg-white dark:bg-[#1c1c1c] text-ink dark:text-cream' : 'text-ink/55 dark:text-cream/55'
      }`}
    >
      {children}
    </button>
  );
}

function RoleOption({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border py-3.5 text-[13.5px] font-bold cursor-pointer transition-colors ${
        active ? 'border-amber bg-amber-soft text-ink' : 'border-border dark:border-white/10 text-ink/55 dark:text-cream/55'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <input
        {...props}
        className="w-full rounded-xl border border-border dark:border-white/10 px-4 py-3.5 text-[14.5px] outline-none focus:border-ink/40"
      />
    </div>
  );
}
