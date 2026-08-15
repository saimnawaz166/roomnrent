import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAppData } from '../../context/AppDataContext';
import { AD_PLACEMENT_GROUPS } from '../../data/sponsors';
import { NEIGHBORHOODS } from '../../data/neighborhoods';

const EMPTY_FORM = { label: '', blurb: '', placements: [], neighborhoodSlug: '' };

// One reusable manager for a single ad type (carousel / top-section / listing)
// — table + inline create/edit form + pause/activate/delete actions. Used
// three times in AdminDashboard, once per type, all reading/writing the same
// shared sponsorSlots store so changes show up on the live site immediately.
export default function AdTypeSection({ type, title, description, hasPlacements = false }) {
  const { sponsorSlots, addSponsorSlot, updateSponsorSlot, deleteSponsorSlot, toggleSponsorSlot } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const slots = sponsorSlots.filter((s) => s.type === type);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(slot) {
    setEditingId(slot.id);
    setForm({
      label: slot.label,
      blurb: slot.blurb,
      placements: slot.placements || [],
      neighborhoodSlug: slot.neighborhoodSlugs?.[0] || '',
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function togglePlacement(key) {
    setForm((f) => ({
      ...f,
      placements: f.placements.includes(key) ? f.placements.filter((p) => p !== key) : [...f.placements, key],
    }));
  }

  async function handleSave() {
    if (!form.label.trim()) return;
    const data = {
      type,
      label: form.label.trim(),
      blurb: form.blurb.trim(),
      ...(hasPlacements
        ? {
            placements: form.placements,
            neighborhoodSlugs: form.neighborhoodSlug ? [form.neighborhoodSlug] : [],
          }
        : {}),
    };
    try {
      if (editingId) await updateSponsorSlot(editingId, data);
      else await addSponsorSlot(data);
      closeForm();
    } catch (err) {
      window.alert(err.message || 'Could not save this ad.');
    }
  }

  async function handleDelete(slot) {
    if (!window.confirm(`Delete "${slot.label}"? This can't be undone.`)) return;
    try {
      if (editingId === slot.id) closeForm();
      await deleteSponsorSlot(slot.id);
    } catch (err) {
      window.alert(err.message || 'Could not delete this ad.');
    }
  }

  return (
    <div className="mb-9">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display font-bold">{title}</div>
          <p className="text-[12.5px] text-ink/55 dark:text-cream/55">{description}</p>
        </div>
        <Button size="sm" onClick={formOpen && !editingId ? closeForm : openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Create
        </Button>
      </div>

      {formOpen && (
        <div className="mb-4 rounded-2xl border border-amber/40 bg-amber-soft/40 dark:bg-amber/10 p-5">
          <div className="mb-3 text-[13px] font-bold">{editingId ? 'Edit ad' : 'New ad'}</div>
          <div className="flex flex-col gap-3.5">
            <FormField label="Label" value={form.label} onChange={(v) => setForm((f) => ({ ...f, label: v }))} placeholder="e.g. Harbor & Co. Renters Insurance" />
            <div>
              <div className="mb-1.5 text-[13px] font-bold">Blurb</div>
              <textarea
                rows={2}
                value={form.blurb}
                onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
                placeholder="Short sponsor description shown alongside the label"
                className="w-full resize-none rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
              />
            </div>

            {hasPlacements && (
              <>
                <div>
                  <div className="mb-1.5 text-[13px] font-bold">Show on</div>
                  <div className="flex flex-wrap gap-2">
                    {AD_PLACEMENT_GROUPS.map((g) => (
                      <label
                        key={g.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                          form.placements.includes(g.key)
                            ? 'border-amber bg-amber text-ink'
                            : 'border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-ink/60 dark:text-cream/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.placements.includes(g.key)}
                          onChange={() => togglePlacement(g.key)}
                          className="hidden"
                        />
                        {g.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[13px] font-bold">Target neighborhood (optional)</div>
                  <select
                    value={form.neighborhoodSlug}
                    onChange={(e) => setForm((f) => ({ ...f, neighborhoodSlug: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
                  >
                    <option value="">All neighborhoods</option>
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n.slug} value={n.slug}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2.5">
              <Button size="sm" onClick={handleSave} disabled={!form.label.trim()}>
                {editingId ? 'Save changes' : 'Create ad'}
              </Button>
              <Button size="sm" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {slots.length === 0 ? (
        <p className="text-sm text-ink/55 dark:text-cream/55">No {title.toLowerCase()} ads yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c]">
          <div className="min-w-[560px]">
            {slots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 border-t border-border dark:border-white/10 px-5 py-3.5 text-sm first:border-t-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{s.label}</span>
                    <Badge tone={s.active ? 'sage' : 'neutral'}>{s.active ? 'Active' : 'Paused'}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-ink/55 dark:text-cream/55">{s.blurb}</p>
                  <div className="mt-1 text-[11.5px] text-ink/40 dark:text-cream/40">
                    {hasPlacements && s.placements?.length > 0 && (
                      <>{s.placements.map((p) => AD_PLACEMENT_GROUPS.find((g) => g.key === p)?.label || p).join(', ')} · </>
                    )}
                    {s.impressions ?? 0} impressions · {s.clicks ?? 0} clicks
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={s.active ? 'Pause' : 'Activate'}
                    onClick={() => toggleSponsorSlot(s.id).catch((err) => window.alert(err.message || 'Could not update this ad.'))}
                    hoverClass="hover:bg-cream dark:hover:bg-white/10 hover:text-ink dark:hover:text-cream"
                  >
                    {s.active ? <EyeOff className="h-[16px] w-[16px]" strokeWidth={2.25} /> : <Eye className="h-[16px] w-[16px]" strokeWidth={2.25} />}
                  </IconButton>
                  <IconButton label="Edit" onClick={() => openEdit(s)} hoverClass="hover:bg-amber-soft hover:text-amber-text">
                    <Pencil className="h-[15px] w-[15px]" strokeWidth={2.25} />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => handleDelete(s)} hoverClass="hover:bg-coral-soft hover:text-coral-text">
                    <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.25} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-3 text-[14.5px] outline-none focus:border-ink/40"
      />
    </div>
  );
}

function IconButton({ label, onClick, hoverClass, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink/45 dark:text-cream/45 transition-colors ${hoverClass}`}
    >
      {children}
    </button>
  );
}
