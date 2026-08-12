import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Flag, Eye } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useRole } from '../../context/RoleContext';
import { useAppData } from '../../context/AppDataContext';
import AdTypeSection from '../../components/admin/AdTypeSection';
import { ADMIN_USERS, CHART_BARS } from '../../data/admin';
import { LISTING_STATUS_LABELS } from '../../data/listings';
import { AD_TYPE_LABELS, AD_TYPE_DESCRIPTIONS } from '../../data/sponsors';
import { statusTone } from '../../lib/tone';

const VALID_TABS = ['overview', 'users', 'listings', 'reports', 'support', 'ads'];
const USER_ROLE_VIEWS = ['Renter', 'Landlord'];

export default function AdminDashboard() {
  const { role } = useRole();
  const { tab: tabParam } = useParams();
  const tab = VALID_TABS.includes(tabParam) ? tabParam : 'overview';
  const [userRoleView, setUserRoleView] = useState('Renter');
  const maxBar = Math.max(...CHART_BARS);
  const {
    listings,
    updateListing,
    verifications,
    setVerificationStatus,
    reports,
    resolveReport,
    tickets,
    resolveTicket,
  } = useAppData();

  if (role !== 'admin') return <Navigate to="/dashboard" replace />;

  const pendingVerifications = Object.entries(verifications).filter(([, v]) => v.status === 'pending');

  return (
    <div>
      {tab === 'overview' && (
        <div>
          <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total users" value="24,180" />
            <StatCard label="Active listings" value={String(listings.filter((l) => l.status === 'live').length)} />
            <StatCard label="Pending reviews" value={String(pendingVerifications.length)} />
            <StatCard
              label="Open reports"
              value={String(reports.filter((r) => r.status === 'open').length)}
              valueClassName="text-coral-text"
            />
          </div>
          <div className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-7">
            <div className="font-display mb-5 font-bold">New signups (last 7 days)</div>
            <div className="flex h-36 items-end gap-3">
              {CHART_BARS.map((v, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-sage" style={{ height: `${(v / maxBar) * 100}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {pendingVerifications.length > 0 && (
            <div className="mb-7">
              <div className="font-display mb-3 font-bold">Verification queue</div>
              <div className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
                {pendingVerifications.map(([email, v]) => (
                  <div
                    key={email}
                    className="flex flex-col gap-3 border-t border-border dark:border-white/10 px-6 py-4 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <Link to={`/admin/users/${encodeURIComponent(email)}`} className="min-w-0 hover:underline">
                      <div className="truncate font-semibold">{ADMIN_USERS.find((u) => u.email === email)?.name || email}</div>
                      <div className="truncate text-[12.5px] text-ink/55 dark:text-cream/55">{v.fileName}</div>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => setVerificationStatus(email, 'approved')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setVerificationStatus(email, 'rejected')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex gap-1 rounded-full border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-1 w-fit">
            {USER_ROLE_VIEWS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setUserRoleView(r)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-[12.5px] font-bold transition-colors ${
                  userRoleView === r ? 'bg-amber text-ink' : 'text-ink/55 dark:text-cream/55 hover:text-ink dark:hover:text-cream'
                }`}
              >
                {r}s ({ADMIN_USERS.filter((u) => u.role === r).length})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr_auto] gap-3 bg-cream dark:bg-[#141414] px-6 py-4 text-[12.5px] font-bold text-ink/55 dark:text-cream/55">
                <div>Name</div>
                <div>Email</div>
                <div>Status</div>
                <div>Joined</div>
                <div className="text-right">Actions</div>
              </div>
              {ADMIN_USERS.filter((u) => u.role === userRoleView).map((u) => (
                <div
                  key={u.email}
                  className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr_auto] items-center gap-3 border-t border-border dark:border-white/10 px-6 py-4 text-sm"
                >
                  <div className="truncate font-semibold">{u.name}</div>
                  <div className="truncate text-ink/60 dark:text-cream/60">{u.email}</div>
                  <div>
                    <Badge tone={statusTone(u.status)}>{u.status}</Badge>
                  </div>
                  <div className="text-ink/60 dark:text-cream/60">{u.joined}</div>
                  <div className="flex justify-end">
                    <Link
                      to={`/admin/users/${encodeURIComponent(u.email)}`}
                      aria-label={`View ${u.name}`}
                      title="View"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors hover:bg-cream dark:hover:bg-white/10 hover:text-ink dark:hover:text-cream"
                    >
                      <Eye className="h-[17px] w-[17px]" strokeWidth={2.25} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'listings' &&
        (listings.length === 0 ? (
          <p className="text-sm text-ink/55 dark:text-cream/55">No listings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_auto] gap-3 bg-cream dark:bg-[#141414] px-6 py-4 text-[12.5px] font-bold text-ink/55 dark:text-cream/55">
                <div>Listing</div>
                <div>Owner</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="grid grid-cols-[1.6fr_1fr_1fr_auto] items-center gap-3 border-t border-border dark:border-white/10 px-6 py-4 text-sm"
                >
                  <div className="truncate font-semibold">{l.title}</div>
                  <div className="truncate text-ink/60 dark:text-cream/60">{l.landlordName || '—'}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={statusTone(l.status)}>{LISTING_STATUS_LABELS[l.status] || l.status}</Badge>
                    {l.flagged && <Badge tone="coral">Flagged</Badge>}
                  </div>
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/listings/${l.id}`}
                      aria-label={`View ${l.title}`}
                      title="View full details"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors hover:bg-cream dark:hover:bg-white/10 hover:text-ink dark:hover:text-cream"
                    >
                      <Eye className="h-[17px] w-[17px]" strokeWidth={2.25} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => updateListing(l.id, { flagged: !l.flagged })}
                      aria-label={l.flagged ? `Unflag ${l.title}` : `Flag ${l.title}`}
                      title={l.flagged ? 'Unflag listing' : 'Flag listing'}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                        l.flagged
                          ? 'text-coral-text hover:bg-coral-soft'
                          : 'text-ink/45 dark:text-cream/45 hover:bg-coral-soft hover:text-coral-text'
                      }`}
                    >
                      <Flag className="h-[16px] w-[16px]" strokeWidth={2.25} fill={l.flagged ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {tab === 'reports' &&
        (reports.length === 0 ? (
          <p className="text-sm text-ink/55 dark:text-cream/55">No reports.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-bold">
                    {r.type === 'listing' ? '🏠' : '👤'} {r.targetLabel}
                  </div>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </div>
                <p className="mb-2 text-sm text-ink/70 dark:text-cream/70">{r.reason}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-ink/50 dark:text-cream/50">
                  <span>
                    Reported by {r.reportedBy} · {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  {r.status === 'open' && (
                    <Button size="sm" variant="outline" onClick={() => resolveReport(r.id)}>
                      Mark resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === 'support' &&
        (tickets.length === 0 ? (
          <p className="text-sm text-ink/55 dark:text-cream/55">No support tickets.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-bold">
                    {t.fromName} · <span className="font-normal text-ink/50 dark:text-cream/50">{t.type}</span>
                  </div>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </div>
                <div className="mb-3 flex flex-col gap-2">
                  {t.thread.map((m, i) => (
                    <div key={i} className={`rounded-xl px-3.5 py-2.5 text-[13px] ${m.from === 'admin' ? 'bg-amber-soft' : 'bg-cream dark:bg-[#141414]'}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                {t.status === 'open' && (
                  <Button size="sm" variant="outline" onClick={() => resolveTicket(t.id)}>
                    Mark resolved
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}

      {tab === 'ads' && (
        <div>
          <AdTypeSection type="carousel" title={AD_TYPE_LABELS.carousel} description={AD_TYPE_DESCRIPTIONS.carousel} />
          <AdTypeSection type="top-section" title={AD_TYPE_LABELS['top-section']} description={AD_TYPE_DESCRIPTIONS['top-section']} />
          <AdTypeSection type="listing" title={AD_TYPE_LABELS.listing} description={AD_TYPE_DESCRIPTIONS.listing} hasPlacements />
        </div>
      )}
    </div>
  );
}
