import Fuse from 'fuse.js';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export interface SearchIndexItem {
  title: string;
  description: string;
  slug: string;
  category: string;
}

// Define the blog post type
type BlogPost = CollectionEntry<'blog'>;

let searchIndex: Fuse<SearchIndexItem> | null = null;

const fuseOptions = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'description', weight: 0.5 },
  ],
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
};

export async function initializeSearchIndex() {
  if (searchIndex) return searchIndex;

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const searchItems: SearchIndexItem[] = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    category: post.data.category,
  }));

  searchIndex = new Fuse(searchItems, fuseOptions);
  return searchIndex;
}

export async function searchPosts(query: string): Promise<SearchIndexItem[]> {
  if (!query.trim()) return [];

  const index = await initializeSearchIndex();
  const results = index.search(query);

  return results
    .filter((result) => result.score && result.score < 0.6)
    .map((result) => result.item)
    .slice(0, 5);
}
