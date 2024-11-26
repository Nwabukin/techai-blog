import { searchPosts as searchIndexPosts } from './searchIndex';

export interface SearchResult {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  score: number;
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  const results = await searchIndexPosts(query);

  return results.map((item) => ({
    title: item.title,
    description: item.description,
    slug: item.slug,
    category: item.category,
    tags: item.tags,
    score: 1, // Maintained for backward compatibility
  }));
}
