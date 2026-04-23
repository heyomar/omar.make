export interface Category { name: string; slug: string; }

export const CATEGORIES: readonly Category[] = [
  { name: 'Creative Coding', slug: 'creative-coding' },
  { name: 'Physical Computing', slug: 'physical-computing' },
  { name: 'Design Work', slug: 'design-work' },
  { name: 'Professional Work', slug: 'professional-work' },
  { name: 'Student Projects', slug: 'student-projects' },
  { name: 'Side Projects', slug: 'side-projects' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
