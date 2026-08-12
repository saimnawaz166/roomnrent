import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import EmptyState from '../../components/ui/EmptyState';
import AdBox from '../../components/ads/AdBox';
import { getBlogPostBySlug } from '../../data/blog';
import { getListingPhoto } from '../../lib/photos';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState title="Post not found" actionLabel="Back to Blog" actionTo="/blog" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 lg:px-10">
      <Link to="/blog" className="mb-6 inline-block text-sm font-bold text-ink/55 dark:text-cream/55 hover:text-amber-dark">
        ← Back to Blog
      </Link>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-amber-text">{post.category}</div>
      <h1 className="font-display mb-3 text-2xl font-extrabold lg:text-[32px]">{post.title}</h1>
      <div className="mb-7 text-[13px] text-ink/45 dark:text-cream/45">
        {new Date(post.date).toLocaleDateString()} · {post.readMinutes} min read
      </div>
      <ImagePlaceholder src={getListingPhoto(post.slug, 0)} alt={post.title} className="mb-8 h-56" />

      <div className="flex flex-col gap-5">
        {post.body.map((block, i) => (
          <div key={i}>
            {block.heading && <div className="font-display mb-1.5 font-bold">{block.heading}</div>}
            <p className="text-[15px] leading-relaxed text-ink/75 dark:text-cream/75">{block.text}</p>
          </div>
        ))}
      </div>

      {post.ctas?.length > 0 && (
        <div className="mt-9 flex flex-wrap gap-3">
          {post.ctas.map((cta) => (
            <Button key={cta.label} to={cta.to}>
              {cta.label}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-10">
        <AdBox placement="blog-content" neighborhoodSlug={post.neighborhoodSlug} />
      </div>
    </div>
  );
}
