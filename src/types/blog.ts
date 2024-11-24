import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export type Author = {
  name: string;
  avatar?: string;
  title?: string;
};

export type Category = 'AI' | 'Technology' | 'Programming' | 'Machine Learning' | 'Web Development';

export interface BlogPostMetadata {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author: Author;
  category: Category;
  tags: string[];
  image?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  draft: boolean;
  featured: boolean;
  readingTime?: string;
  tableOfContents: boolean;
}
