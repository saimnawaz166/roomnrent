// `file` is the raw selected File object (or null) — the caller is
// responsible for actually uploading it (see uploadIdFile in
// AppDataContext) once the surrounding form is submitted.
export default function IdUploadField({ label = 'Government-issued ID', file, onChange }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-bold">{label}</div>
      <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border dark:border-white/10 px-6 py-6 text-center text-[13.5px] text-ink/50 dark:text-cream/50 hover:border-ink/30 dark:hover:border-cream/30">
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <span className="font-semibold text-ink dark:text-cream">{file.name} — click to replace</span>
        ) : (
          <span>Drop a driver's license, ID, or passport photo</span>
        )}
      </label>
    </div>
  );
}
