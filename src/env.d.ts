/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@astrojs/mdx/client" />
/// <reference types="astro/content/static" />

declare module 'astro:content' {
  interface Render {
    '.md': Promise<{
      Content: import('astro').MarkdownInstance<{}>['Content'];
      headings: import('astro').MarkdownHeading[];
      remarkPluginFrontmatter: Record<string, any>;
    }>;
  }
}

declare module 'astro:content' {
  export { z } from 'astro/zod';

  type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

  export type CollectionEntry<C extends keyof AnyEntryMap> = Flatten<AnyEntryMap[C]>;

  export type ContentCollectionKey = keyof AnyEntryMap;

  export type AnyEntryMap = {
    blog: {
      id: string;
      slug: string;
      body: string;
      collection: 'blog';
      data: {
        title: string;
        description: string;
        pubDate: Date;
        updatedDate?: Date;
        author: {
          name: string;
          avatar?: string;
          title?: string;
        };
        category: 'AI' | 'Technology' | 'Programming' | 'Machine Learning' | 'Web Development';
        tags: string[];
        image?: import('astro').ImageMetadata;
        imageAlt?: string;
        canonicalUrl?: string;
        draft: boolean;
        featured: boolean;
        readingTime?: string;
        tableOfContents: boolean;
      };
    };
  };

  export function getCollection<C extends keyof AnyEntryMap>(
    collection: C,
    filter?: (entry: CollectionEntry<C>) => boolean
  ): Promise<CollectionEntry<C>[]>;

  export function getEntry<
    C extends keyof AnyEntryMap,
    E extends keyof AnyEntryMap[C] | (string & {}),
  >(collection: C, entryKey: E): Promise<CollectionEntry<C>>;
}
