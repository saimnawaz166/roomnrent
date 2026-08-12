import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/ui/Button';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'login');
  const [accountType, setAccountType] = useState('renter');

  return (
    <div className="flex min-h-[calc(100vh-88px-1px)]">
      <div className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Logo />
          </div>

          <div className="mb-9 flex gap-1.5 rounded-full bg-cream dark:bg-[#141414] p-1">
            <TabButton active={mode === 'login'} onClick={() => setMode('login')}>
              Log In
            </TabButton>
            <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
              Sign Up
            </TabButton>
          </div>

          {mode === 'login' ? (
            <>
              <h1 className="font-display mb-2 text-2xl font-extrabold">Welcome back</h1>
              <p className="mb-7 text-sm text-ink/55 dark:text-cream/55">Log in to manage your listings and applications.</p>
              <div className="mb-5 flex flex-col gap-3.5">
                <Field label="Email" placeholder="you@email.com" type="email" />
                <Field label="Password" placeholder="••••••••" type="password" />
              </div>
              <div className="mb-6 text-right text-[13px] font-bold text-amber-dark">Forgot password?</div>
              <Button className="mb-4 w-full" onClick={() => navigate('/dashboard')}>
                Log In
              </Button>
              <p className="text-center text-[13.5px] text-ink/55 dark:text-cream/55">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-bold text-amber-dark cursor-pointer">
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
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
                <Field label="Full name" placeholder="Jane Doe" />
                <Field label="Email" placeholder="you@email.com" type="email" />
                <Field label="Password" placeholder="••••••••" type="password" />
              </div>
              <Button className="mb-4 w-full" onClick={() => navigate('/dashboard')}>
                Create Account
              </Button>
              <p className="text-center text-[13.5px] text-ink/55 dark:text-cream/55">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-bold text-amber-dark cursor-pointer">
                  Log in
                </button>
              </p>
            </>
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
