import { getCollection } from 'astro:content';

export interface PostLoaderOptions {
  page: number;
  limit: number;
  category?: string;
  tag?: string;
}

export async function loadPosts({ page, limit, category, tag }: PostLoaderOptions) {
  const posts = await getCollection('blog', ({ data }) => {
    if (data.draft) return false;
    if (category && data.category.toLowerCase() !== category.toLowerCase()) return false;
    if (tag && !data.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) return false;
    return true;
  });

  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = sortedPosts.slice(start, end);

  return {
    posts: paginatedPosts,
    total: posts.length,
    totalPages: Math.ceil(posts.length / limit),
    hasMore: end < posts.length,
  };
}

export function generatePostHtml(post: any) {
  return `
    <article class="blog-card bg-white dark:bg-secondary-800 rounded-2xl shadow-sm overflow-hidden">
      ${
        post.data.image
          ? `
        <div class="aspect-video w-full overflow-hidden">
          <img 
            src="${typeof post.data.image === 'string' ? post.data.image : post.data.image.src}" 
            alt="${post.data.title}"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      `
          : ''
      }
      <div class="p-6">
        <h3 class="text-xl font-bold text-secondary-900 dark:text-white mb-2">
          <a href="/blog/${post.slug}" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            ${post.data.title}
          </a>
        </h3>
        <p class="text-secondary-600 dark:text-secondary-400 mb-4">
          ${post.data.description}
        </p>
        <div class="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
          <time datetime="${post.data.pubDate.toISOString()}">
            ${new Date(post.data.pubDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>${post.data.readingTime || '5 min read'}</span>
        </div>
      </div>
    </article>
  `;
}
