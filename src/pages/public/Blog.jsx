import { Link } from 'react-router-dom';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import AdBox from '../../components/ads/AdBox';
import { BLOG_POSTS } from '../../data/blog';
import { getListingPhoto } from '../../lib/photos';

export default function Blog() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
      <h1 className="font-display mb-2 text-3xl font-extrabold">The ROOMNRENT Blog</h1>
      <p className="mb-10 text-[15px] text-ink/55 dark:text-cream/55">Guides, tips, and neighborhood spotlights for renters and landlords.</p>

      <div className="mb-10">
        <AdBox placement="blog-content" variant="horizontal" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-[#1c1c1c] transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <ImagePlaceholder src={getListingPhoto(post.slug, 0)} alt={post.title} className="h-40" />
            <div className="p-5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-amber-text">{post.category}</div>
              <div className="font-display mb-1.5 text-[15px] font-bold leading-snug">{post.title}</div>
              <p className="mb-3 text-[13px] leading-relaxed text-ink/60 dark:text-cream/60">{post.excerpt}</p>
              <div className="text-[12px] text-ink/45 dark:text-cream/45">
                {new Date(post.date).toLocaleDateString()} · {post.readMinutes} min read
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
