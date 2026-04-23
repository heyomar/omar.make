import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum([
      'creative-coding', 'physical-computing', 'design-work',
      'professional-work', 'student-projects', 'side-projects'
    ]),
    year: z.number(),
    description: z.string().optional(),
    featuredImage: z.string(),
    gallery: z.array(z.string()).optional(),
    externalUrl: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const collections = { projects };
