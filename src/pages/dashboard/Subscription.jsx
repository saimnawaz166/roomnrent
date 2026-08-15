import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Receipt, Sparkles, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useAppData } from '../../context/AppDataContext';
import { useCurrentUser } from '../../context/RoleContext';
import { SUBSCRIPTION_TIERS, getPricingTierForCount } from '../../data/subscription';

const CYCLE_LABELS = { monthly: 'Monthly', annual: 'Annual' };

const PLAN_FEATURES = [
  'Message any Roomer directly, no application required',
  'Full, unblurred Roomer profiles in Find a Roomer',
  'Priority placement for your listings in Roomer search',
  'Cancel anytime — no long-term contract',
];

const GOOD_TO_KNOW = [
  'Price is calculated automatically from your number of active (live or coming soon) listings — you never pick a plan manually.',
  'If your active listings move into a new tier (e.g. you list a 2nd room), your price updates from your next billing cycle.',
  'To change your billing cycle (monthly ↔ annual), cancel and resubscribe at the new cycle.',
  'This is a demo — no real payment is processed, and cancelling ends access immediately rather than at period end.',
  'Every subscribe/cancel action is logged below in your subscription history.',
];

function money(n) {
  return `$${n.toFixed(2)}`;
}

function formatDate(iso, withTime) {
  const opts = { month: withTime ? 'long' : 'short', day: 'numeric', year: 'numeric' };
  return new Date(iso).toLocaleDateString('en-US', opts);
}

function addInterval(date, cycle) {
  const d = new Date(date);
  if (cycle === 'annual') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

// Landlord-only billing page for the "Find a Roomer" direct-message upgrade
// (Tier 2 in AppDataContext's getHostAccessTier). The host never picks a
// price — it's derived from how many active listings they currently have —
// but subscribing itself still runs through a proper review → confirm →
// success flow rather than toggling on instantly.
export default function Subscription() {
  const currentUser = useCurrentUser();
  const { getActiveListingCount, getHostSubscription, getSubscriptionHistory, subscribeHost, unsubscribeHost } =
    useAppData();

  const activeCount = getActiveListingCount(currentUser.email);
  const currentTier = getPricingTierForCount(activeCount);
  const subscription = getHostSubscription(currentUser.email);
  const history = getSubscriptionHistory(currentUser.email);

  const [billingCycle, setBillingCycle] = useState(subscription?.billingCycle || 'monthly');
  const [step, setStep] = useState('idle'); // idle → review → success (subscribe flow only)
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const price = currentTier ? (billingCycle === 'annual' ? currentTier.annual : currentTier.monthly) : null;
  const period = billingCycle === 'annual' ? '/year' : '/month';
  const nextBillingDate = currentTier ? addInterval(new Date(), billingCycle) : null;

  async function handleConfirmSubscribe() {
    setActionError('');
    setSubmitting(true);
    try {
      await subscribeHost(currentUser.email, billingCycle, { tierLabel: currentTier.label, price });
      setStep('success');
    } catch (err) {
      setActionError(err.message || 'Could not activate your subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (
      !window.confirm(
        "Cancel your Pro subscription? You'll lose direct-message access to Roomers who haven't applied to your listings.",
      )
    )
      return;
    setActionError('');
    const cancelPrice = subscription.billingCycle === 'annual' ? currentTier?.annual : currentTier?.monthly;
    try {
      await unsubscribeHost(currentUser.email, {
        tierLabel: currentTier?.label,
        price: cancelPrice,
        billingCycle: subscription.billingCycle,
      });
      setStep('idle');
    } catch (err) {
      setActionError(err.message || 'Could not cancel your subscription. Please try again.');
    }
  }

  const showReferenceGrid = step !== 'review' && step !== 'success';

  return (
    <div>
      <div className="mb-2">
        <h1 className="font-display text-xl font-extrabold">Subscription</h1>
        <p className="text-[14.5px] text-ink/55 dark:text-cream/55">
          Unlock direct messaging to any Roomer in <span className="font-semibold">Find a Roomer</span> — priced
          automatically by how many active listings you have.
        </p>
      </div>

      {activeCount === 0 ? (
        <Card className="mt-6">
          <EmptyState
            title="You need an active listing first"
            description="Subscription pricing is based on your number of active listings. Create or reactivate a listing to see your price."
            actionLabel="Create Listing"
            actionTo="/listings/new"
          />
        </Card>
      ) : (
        <>
          {actionError && (
            <div className="mt-6 rounded-xl border border-coral-text/30 bg-coral-soft px-4 py-3 text-[13.5px] font-semibold text-coral-text">
              {actionError}
            </div>
          )}

          {step === 'review' ? (
            <ReviewStep
              currentTier={currentTier}
              billingCycle={billingCycle}
              price={price}
              period={period}
              nextBillingDate={nextBillingDate}
              submitting={submitting}
              onBack={() => setStep('idle')}
              onConfirm={handleConfirmSubscribe}
            />
          ) : step === 'success' ? (
            <SuccessStep
              currentTier={currentTier}
              billingCycle={billingCycle}
              price={price}
              period={period}
              onDone={() => setStep('idle')}
            />
          ) : subscription ? (
            <SubscribedStatus
              currentTier={currentTier}
              subscription={subscription}
              activeCount={activeCount}
              onCancel={handleCancel}
            />
          ) : (
            <IdleStep
              currentTier={currentTier}
              activeCount={activeCount}
              price={price}
              period={period}
              billingCycle={billingCycle}
              setBillingCycle={setBillingCycle}
              onSubscribe={() => setStep('review')}
            />
          )}

          {showReferenceGrid && (
            <>
              <div className="font-display mb-3.5 mt-8 font-bold">How pricing works</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {SUBSCRIPTION_TIERS.map((t) => {
                  const isYours = t.id === currentTier?.id;
                  const savingsPct = Math.round((1 - t.annual / (t.monthly * 12)) * 100);
                  return (
                    <Card key={t.id} className={`p-6 ${isYours ? 'border-amber ring-2 ring-amber/50' : ''}`}>
                      {isYours && (
                        <div className="mb-3">
                          <Badge tone="amber">Your tier</Badge>
                        </div>
                      )}
                      <div className="mb-1 text-[13px] font-bold text-ink/55 dark:text-cream/55">{t.label}</div>
                      <div className="font-display mb-1 text-2xl font-extrabold">
                        {money(t.monthly)}
                        <span className="text-sm font-semibold text-ink/45 dark:text-cream/45">/mo</span>
                      </div>
                      <div className="mb-4 text-[12.5px] text-ink/50 dark:text-cream/50">
                        or {money(t.annual)}/year · save {savingsPct}%
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {PLAN_FEATURES.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-[12px] text-ink/65 dark:text-cream/65">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-text" strokeWidth={2.5} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          <div className="font-display mb-3.5 mt-10 font-bold">Good to know</div>
          <Card className="p-6">
            <ul className="flex flex-col gap-3">
              {GOOD_TO_KNOW.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink/65 dark:text-cream/65"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mb-3.5 mt-10 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-ink/40 dark:text-cream/40" strokeWidth={2.25} />
            <div className="font-display font-bold">Subscription history</div>
          </div>
          {history.length === 0 ? (
            <Card className="px-6 py-10 text-center text-[13.5px] text-ink/50 dark:text-cream/50">
              No subscription activity yet.
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-b-0 dark:border-white/10"
                >
                  {h.type === 'subscribed' ? (
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-sage-text" strokeWidth={2.25} />
                  ) : (
                    <XCircle className="h-[18px] w-[18px] shrink-0 text-coral-text" strokeWidth={2.25} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">
                      {h.type === 'subscribed' ? 'Subscribed' : 'Cancelled'}
                      {h.tierLabel ? ` — ${h.tierLabel}` : ''}
                    </div>
                    <div className="text-[12px] text-ink/50 dark:text-cream/50">{formatDate(h.at)}</div>
                  </div>
                  {h.price != null && (
                    <div className="shrink-0 text-[13px] font-bold text-ink/70 dark:text-cream/70">
                      {money(h.price)}
                      {h.billingCycle === 'annual' ? '/yr' : '/mo'}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function IdleStep({ currentTier, activeCount, price, period, billingCycle, setBillingCycle, onSubscribe }) {
  return (
    <div className="my-6 rounded-2xl border border-amber/40 bg-amber-soft px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-text" strokeWidth={2.25} />
          <div>
            <div className="font-display font-bold text-amber-text">
              Your price: {money(price)}
              {period}
            </div>
            <p className="mt-1 text-[13.5px] text-ink/65 dark:text-cream/65">
              Based on your {activeCount} active listing{activeCount === 1 ? '' : 's'} ({currentTier.label} tier).
            </p>
          </div>
        </div>
        <Button onClick={onSubscribe} className="w-full shrink-0 sm:w-auto">
          Subscribe
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-1.5 border-t border-amber/30 pt-5">
        <span className="mr-1 text-[10.5px] font-bold uppercase tracking-wide text-ink/40 dark:text-cream/40">
          Billing cycle
        </span>
        <div className="flex gap-1 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-1">
          {Object.entries(CYCLE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setBillingCycle(key)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                billingCycle === key
                  ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                  : 'text-ink/60 dark:text-cream/60 hover:bg-border dark:hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ currentTier, billingCycle, price, period, nextBillingDate, submitting, onBack, onConfirm }) {
  return (
    <Card className="my-6 p-6 sm:p-7">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-ink/50 hover:text-ink dark:text-cream/50 dark:hover:text-cream"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} /> Back
      </button>
      <div className="font-display mb-1 text-lg font-extrabold">Review your subscription</div>
      <p className="mb-5 text-[13.5px] text-ink/55 dark:text-cream/55">
        Confirm the details below to activate your Pro plan.
      </p>

      <div className="flex flex-col gap-3 rounded-xl bg-cream p-5 dark:bg-[#141414]">
        <ReviewRow label="Plan" value={`Pro — ${currentTier.label}`} />
        <ReviewRow label="Billing cycle" value={CYCLE_LABELS[billingCycle]} />
        <ReviewRow label="Price" value={`${money(price)}${period}`} />
        <ReviewRow
          label="Next billing date"
          value={nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        />
        <div className="my-1 h-px bg-border dark:bg-white/10" />
        <ReviewRow label="Due today" value={money(price)} bold />
      </div>

      <p className="mt-4 text-[12px] text-ink/40 dark:text-cream/40">
        This is a demo checkout — no real payment method is charged.
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={onConfirm} disabled={submitting} className="flex-1">
          {submitting ? 'Activating…' : 'Confirm & Subscribe'}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={submitting} className="flex-1">
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function ReviewRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink/55 dark:text-cream/55">{label}</span>
      <span className={`text-right text-[13.5px] ${bold ? 'font-extrabold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

function SuccessStep({ currentTier, billingCycle, price, period, onDone }) {
  return (
    <Card className="my-6 flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft">
        <CheckCircle2 className="h-6 w-6 text-sage-text" strokeWidth={2.25} />
      </div>
      <div className="font-display text-lg font-extrabold">You're now on the Pro plan!</div>
      <p className="max-w-sm text-[13.5px] text-ink/60 dark:text-cream/60">
        {money(price)}
        {period} · billed {billingCycle} · {currentTier.label} tier. You can message any Roomer directly starting
        now.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button to="/find-a-roomer">Go to Find a Roomer</Button>
        <Button variant="outline" onClick={onDone}>
          Done
        </Button>
      </div>
    </Card>
  );
}

function SubscribedStatus({ currentTier, subscription, activeCount, onCancel }) {
  const price = subscription.billingCycle === 'annual' ? currentTier.annual : currentTier.monthly;
  const period = subscription.billingCycle === 'annual' ? '/year' : '/month';
  return (
    <div className="my-6 flex flex-col items-start gap-4 rounded-2xl border border-sage/40 bg-sage-soft px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-text" strokeWidth={2.25} />
        <div>
          <div className="font-display font-bold text-sage-text">Pro plan active</div>
          <p className="mt-1 text-[13.5px] text-ink/65 dark:text-cream/65">
            {money(price)}
            {period} · billed {CYCLE_LABELS[subscription.billingCycle].toLowerCase()} · based on {activeCount}{' '}
            active listing{activeCount === 1 ? '' : 's'} ({currentTier?.label}). You can message any Roomer
            directly.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 cursor-pointer text-[12.5px] font-bold text-ink/50 underline dark:text-cream/50"
      >
        Cancel subscription
      </button>
    </div>
  );
}
