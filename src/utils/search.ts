import { getCollection } from 'astro:content';

export interface SearchResult {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  score: number;
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter((term) => term.length > 0);

  return posts
    .map((post) => {
      let score = 0;
      const postTitle = post.data.title.toLowerCase();
      const postDescription = post.data.description.toLowerCase();
      const postTags = post.data.tags.map((tag) => tag.toLowerCase());

      // Score exact matches in title highest
      if (postTitle.includes(query.toLowerCase())) score += 10;

      // Score individual term matches
      searchTerms.forEach((term) => {
        if (postTitle.includes(term)) score += 5;
        if (postDescription.includes(term)) score += 3;
        if (postTags.some((tag) => tag.includes(term))) score += 2;
      });

      return {
        title: post.data.title,
        description: post.data.description,
        slug: post.slug,
        category: post.data.category,
        tags: post.data.tags,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Limit to top 10 results
}
