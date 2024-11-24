import { defineCollection, z } from 'astro:content';

// Define the schema for blog posts
const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      // Basic metadata
      title: z.string().min(1, 'Title is required'),
      description: z
        .string()
        .min(50, 'Description should be at least 50 characters')
        .max(160, 'Description should not exceed 160 characters'),
      pubDate: z.date(),
      updatedDate: z.date().optional(),

      // Author information
      author: z.object({
        name: z.string(),
        avatar: z.string().optional(),
        title: z.string().optional(),
      }),

      // Content organization
      category: z.enum(['AI', 'Technology', 'Programming', 'Machine Learning', 'Web Development']),
      tags: z.array(z.string()).min(1, 'At least one tag is required'),

      // SEO and display
      image: image().optional(),
      imageAlt: z.string().optional(),
      canonicalUrl: z.string().url().optional(),

      // Content settings
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),

      // Reading experience
      readingTime: z.string().optional(),
      tableOfContents: z.boolean().default(true),
    }),
});

// Export the collections
export const collections = {
  blog: blogCollection,
};
