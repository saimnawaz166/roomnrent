import EmptyState from '../../components/ui/EmptyState';
import { getInfoPage } from '../../data/infoPages';

export default function InfoPage({ slug }) {
  const page = getInfoPage(slug);

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Page not found" actionLabel="Back home" actionTo="/" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
      <h1 className="font-display mb-4 text-3xl font-extrabold lg:text-4xl">{page.title}</h1>
      <p className="mb-11 text-[15px] leading-relaxed text-ink/65 dark:text-cream/65">{page.intro}</p>
      <div className="flex flex-col gap-9">
        {page.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display mb-2.5 text-lg font-bold">{s.heading}</h2>
            <p className="text-[14.5px] leading-relaxed text-ink/70 dark:text-cream/70">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
