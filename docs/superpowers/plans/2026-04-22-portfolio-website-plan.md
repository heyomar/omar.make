# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimalist portfolio with massive typographic category tabs that morph into horizontal-scrolling project galleries, using Astro + Tailwind v4 + GSAP + Netlify CMS.

**Architecture:** Single-page Astro app with content collections. Client-side GSAP controller orchestrates tab transitions. Horizontal scroll enhanced with ScrollTrigger on desktop only. All shared data lives in `src/lib/`. Components are single-responsibility.

**Tech Stack:** Astro 5, Tailwind CSS v4, GSAP + ScrollTrigger, Netlify CMS, Netlify

---

## File Structure

```
├── src/
│   ├── lib/
│   │   ├── categories.ts       # Shared category data (single source of truth)
│   │   ├── state.ts            # Lightweight reactive state store
│   │   ├── transitions.ts      # GSAP timeline factory functions
│   │   └── horizontalScroll.ts # ScrollTrigger setup (desktop-gated)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── CategoryTab.astro       # Individual tab markup
│   │   ├── CategoryIndex.astro     # Full stacked landing view
│   │   ├── SecondaryIndex.astro    # Compact secondary index
│   │   ├── ProjectCard.astro       # Image + title + year card
│   │   ├── ProjectStrip.astro      # Horizontal scroll container
│   │   ├── ScrollProgress.astro    # Progress bar
│   │   ├── BackToIndex.astro       # Floating button
│   │   └── TransitionController.astro  # client:load — orchestrates everything
│   ├── styles/
│   │   └── global.css
│   ├── content/
│   │   └── config.ts
│   └── pages/
│       ├── index.astro
│       └── admin.astro
├── public/
│   └── admin/
│       └── config.yml
├── astro.config.mjs
├── netlify.toml
└── package.json
```

---

### Task 1: Project Scaffolding

**Files:** `package.json`, `astro.config.mjs`, `netlify.toml`, `.gitignore`

```json
// package.json
{
  "name": "portfolio",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/netlify": "^6.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "gsap": "^3.12.0"
  }
}
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  vite: { plugins: [tailwindcss()] },
});
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

```
# .gitignore
node_modules/
dist/
.astro/
.env
public/uploads/*
!public/uploads/.gitkeep
```

- [ ] Run `npm install`
- [ ] Commit

---

### Task 2: Global Styles & Tailwind v4 Theme

**File:** `src/styles/global.css`

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Newsreader:wght@400;700&display=swap');

@theme {
  --color-void: #0A0A0A;
  --color-flame: #FF3B00;
  --font-display: "Newsreader", serif;
  --font-body: "Inter", sans-serif;
}

@layer base {
  html {
    background-color: #0A0A0A;
    color: #FFFFFF;
    font-family: "Inter", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::selection {
    background-color: #FF3B00;
    color: #0A0A0A;
  }
}
```

- [ ] Run `npm run build` — verify no errors
- [ ] Commit

---

### Task 3: Base Layout

**File:** `src/layouts/BaseLayout.astro`

```astro
---
interface Props { title?: string; }
const { title = "Portfolio" } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
</head>
<body class="bg-void text-white min-h-screen">
  <slot />
</body>
</html>
```

- [ ] Commit

---

### Task 4: Content Collection Config

**File:** `src/content/config.ts`

```ts
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
```

- [ ] Commit

---

### Task 5: Shared Category Data

**File:** `src/lib/categories.ts`

```ts
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
```

- [ ] Commit

---

### Task 6: State Store

**File:** `src/lib/state.ts`

```ts
import type { CategorySlug } from './categories';

type ViewMode = 'landing' | 'gallery';

interface State { view: ViewMode; activeCategory: CategorySlug | null; }

const state: State = { view: 'landing', activeCategory: null };
const listeners = new Set<(s: State) => void>();

export const getState = (): Readonly<State> => Object.freeze({ ...state });
export const setView = (v: ViewMode) => { state.view = v; notify(); };
export const setActiveCategory = (s: CategorySlug | null) => { state.activeCategory = s; notify(); };
export const subscribe = (l: (s: State) => void) => { listeners.add(l); return () => listeners.delete(l); };

function notify() { const snap = getState(); listeners.forEach(l => l(snap)); }
```

- [ ] Commit

---

### Task 7: CategoryTab Component

**File:** `src/components/CategoryTab.astro`

```astro
---
import type { Category } from '../lib/categories';
interface Props { category: Category; isSecondary?: boolean; }
const { category, isSecondary = false } = Astro.props;
---

<div
  class:list={[
    'category-tab group cursor-pointer border-b border-flame/20 transition-all duration-300',
    'flex items-center px-[clamp(2rem,5vw,6rem)]',
    isSecondary ? 'h-[8vh] opacity-30 hover:opacity-100' : 'min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]',
  ]}
  data-category={category.slug}
  role="button" tabindex="0"
>
  <h2
    class:list={[
      'font-display transition-all duration-300 group-hover:text-flame group-hover:translate-x-[1vw]',
      isSecondary ? 'text-[clamp(1.5rem,4vw,3rem)]' : 'text-[clamp(4rem,12vw,10rem)] leading-[0.95]',
    ]}
  >{category.name}</h2>
</div>

<style>
  .category-tab:hover {
    border-color: rgba(255, 59, 0, 0.5);
  }
</style>
```

- [ ] Commit

---

### Task 8: CategoryIndex Component

**File:** `src/components/CategoryIndex.astro`

```astro
---
import { CATEGORIES } from '../lib/categories';
import CategoryTab from './CategoryTab.astro';
---

<section id="category-index" class="flex flex-col w-full">
  {CATEGORIES.map((cat) => <CategoryTab category={cat} />)}
</section>
```

- [ ] Commit

---

### Task 9: SecondaryIndex Component

**File:** `src/components/SecondaryIndex.astro`

```astro
---
import { CATEGORIES } from '../lib/categories';
import CategoryTab from './CategoryTab.astro';
interface Props { activeSlug: string; }
const { activeSlug } = Astro.props;
---

<section id="secondary-index" class="flex flex-col w-full">
  {CATEGORIES.filter(c => c.slug !== activeSlug).map((cat) => (
    <CategoryTab category={cat} isSecondary />
  ))}
</section>
```

- [ ] Commit

---

### Task 10: ProjectCard Component

**File:** `src/components/ProjectCard.astro`

```astro
---
interface Props {
  title: string;
  year: number;
  featuredImage: string;
  externalUrl?: string;
}
const { title, year, featuredImage, externalUrl } = Astro.props;
---

<article class="project-card flex-shrink-0 w-[85vw] md:w-[75vw] lg:w-[70vw]">
  {externalUrl ? (
    <a href={externalUrl} target="_blank" rel="noopener noreferrer" class="block group">
      <div class="aspect-[4/3] overflow-hidden bg-void">
        <img
          src={featuredImage} alt={title}
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div class="mt-4 flex items-baseline justify-between px-1">
        <h3 class="font-body text-[clamp(1.5rem,3vw,3rem)] font-medium leading-tight">{title}</h3>
        <span class="font-body text-flame text-[clamp(0.875rem,1vw,1rem)] ml-4">{year}</span>
      </div>
    </a>
  ) : (
    <div class="block">
      <div class="aspect-[4/3] overflow-hidden bg-void">
        <img
          src={featuredImage} alt={title}
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="mt-4 flex items-baseline justify-between px-1">
        <h3 class="font-body text-[clamp(1.5rem,3vw,3rem)] font-medium leading-tight">{title}</h3>
        <span class="font-body text-flame text-[clamp(0.875rem,1vw,1rem)] ml-4">{year}</span>
      </div>
    </div>
  )}
</article>
```

- [ ] Commit

---

### Task 11: ProjectStrip Component

**File:** `src/components/ProjectStrip.astro`

```astro
---
import type { CollectionEntry } from 'astro:content';
import ProjectCard from './ProjectCard.astro';
interface Props {
  id: string;
  projects: CollectionEntry<'projects'>[];
}
const { id, projects } = Astro.props;
---

<section
  id={id}
  class="project-strip w-full overflow-x-auto"
  style="-webkit-overflow-scrolling: touch;"
>
  <div class="project-strip-inner flex gap-[4vw] px-[clamp(2rem,5vw,6rem)] pb-8">
    {projects.map((p) => (
      <ProjectCard
        title={p.data.title}
        year={p.data.year}
        featuredImage={p.data.featuredImage}
        externalUrl={p.data.externalUrl}
      />
    ))}
  </div>
</section>
```

- [ ] Commit

---

### Task 12: ScrollProgress Component

**File:** `src/components/ScrollProgress.astro`

```astro
---
interface Props { id?: string; }
const { id = 'scroll-progress' } = Astro.props;
---

<div id={id} class="w-full px-[clamp(2rem,5vw,6rem)]">
  <div class="h-[2px] w-full bg-flame/10 relative overflow-hidden">
    <div id={`${id}-fill`} class="h-full bg-flame absolute left-0 top-0" style="width: 0%;" />
  </div>
</div>
```

- [ ] Commit

---

### Task 13: BackToIndex Component

**File:** `src/components/BackToIndex.astro`

```astro
<button
  id="back-to-index"
  class="fixed bottom-8 right-8 z-50 font-body text-flame text-sm uppercase tracking-wider hover:underline"
  aria-label="Back to index"
>↑ Index</button>
```

- [ ] Commit

---

### Task 14: GSAP Timeline Factories

**File:** `src/lib/transitions.ts`

```ts
import gsap from 'gsap';

export function createCategorySwapTimeline(
  outgoing: HTMLElement,
  incoming: HTMLElement,
  onComplete?: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete });
  tl.to(outgoing, { opacity: 0, x: -50, duration: 0.3 });
  tl.set(outgoing, { display: 'none', x: 0 });
  tl.set(incoming, { display: 'flex', opacity: 0, x: 50 });
  tl.to(incoming, { opacity: 1, x: 0, duration: 0.4 });
  return tl;
}
```

- [ ] Commit

---

### Task 15: Horizontal Scroll Logic

**File:** `src/lib/horizontalScroll.ts`

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHorizontalScroll(stripId: string, progressId?: string): () => void {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop) return () => {};

  const strip = document.querySelector<HTMLElement>(`#${stripId}`);
  if (!strip) return () => {};

  const inner = strip.querySelector<HTMLElement>('.project-strip-inner');
  if (!inner) return () => {};

  // Disable CSS snap on desktop (GSAP handles it)
  strip.style.scrollSnapType = 'none';

  const cards = inner.querySelectorAll<HTMLElement>('.project-card');
  if (cards.length === 0) return () => {};

  const totalWidth = inner.scrollWidth - strip.clientWidth;

  const tween = gsap.to(inner, {
    x: -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: strip,
      start: 'top top',
      end: () => `+=${totalWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      snap: {
        snapTo: (progress: number) => {
          const step = 1 / (cards.length - 1);
          return Math.round(progress / step) * step;
        },
        duration: { min: 0.2, max: 0.5 },
        delay: 0,
        ease: 'power2.out',
      },
    },
  });

  let progressST: ScrollTrigger | null = null;

  if (progressId) {
    const progressFill = document.querySelector<HTMLElement>(`#${progressId}-fill`);
    if (progressFill) {
      progressST = ScrollTrigger.create({
        trigger: strip,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        onUpdate: (self) => { progressFill.style.width = `${self.progress * 100}%`; },
      });
    }
  }

  return () => {
    if (progressST) progressST.kill();
    tween.kill();
    ScrollTrigger.getAll().forEach((st) => st.kill());
  };
}
```

- [ ] Commit

---

### Task 16: TransitionController Component

**File:** `src/components/TransitionController.astro`

```astro
<script>
  import gsap from 'gsap';
  import { getState, setView, setActiveCategory } from '../lib/state';
  import { CATEGORIES, type CategorySlug } from '../lib/categories';
  import { createCategorySwapTimeline } from '../lib/transitions';
  import { initHorizontalScroll } from '../lib/horizontalScroll';

  const landingView = document.getElementById('landing-view')!;
  const galleryViews = Array.from(document.querySelectorAll<HTMLElement>('.gallery-view'));
  const tabs = Array.from(document.querySelectorAll<HTMLElement>('.category-tab'));
  const backBtn = document.getElementById('back-to-index')!;

  let currentCleanup: (() => void) | null = null;
  let isAnimating = false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getGalleryView(slug: string): HTMLElement {
    return document.getElementById(`gallery-${slug}`)!;
  }

  function showGalleryView(view: HTMLElement, animate: boolean): void {
    if (prefersReduced || !animate) {
      galleryViews.forEach(v => v.classList.add('hidden'));
      view.classList.remove('hidden');
      return;
    }
    gsap.set(view, { display: 'flex', opacity: 0, y: 20 });
    gsap.to(view, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }

  function hideGalleryView(view: HTMLElement, animate: boolean): void {
    if (prefersReduced || !animate) {
      view.classList.add('hidden');
      return;
    }
    gsap.to(view, {
      opacity: 0, y: 20, duration: 0.3, ease: 'power3.in',
      onComplete: () => { view.classList.add('hidden'); },
    });
  }

  function openCategory(slug: CategorySlug, animate = true): void {
    if (isAnimating) return;
    const state = getState();
    const targetView = getGalleryView(slug);

    if (state.view === 'gallery' && state.activeCategory && state.activeCategory !== slug) {
      const outgoing = getGalleryView(state.activeCategory);
      isAnimating = true;
      if (currentCleanup) { currentCleanup(); currentCleanup = null; }

      if (prefersReduced) {
        outgoing.classList.add('hidden');
        targetView.classList.remove('hidden');
        setActiveCategory(slug);
        window.location.hash = slug;
        currentCleanup = initHorizontalScroll(`strip-${slug}`, `progress-${slug}`);
        isAnimating = false;
      } else {
        createCategorySwapTimeline(outgoing, targetView, () => {
          isAnimating = false;
          setActiveCategory(slug);
          window.location.hash = slug;
          currentCleanup = initHorizontalScroll(`strip-${slug}`, `progress-${slug}`);
        });
      }
      return;
    }

    // Landing → Gallery
    isAnimating = true;
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }

    if (prefersReduced) {
      landingView.classList.add('hidden');
      targetView.classList.remove('hidden');
      backBtn.classList.remove('hidden');
      setView('gallery');
      setActiveCategory(slug);
      window.location.hash = slug;
      currentCleanup = initHorizontalScroll(`strip-${slug}`, `progress-${slug}`);
      isAnimating = false;
    } else {
      gsap.to(landingView, {
        opacity: 0, y: -30, duration: 0.4, ease: 'power3.in',
        onComplete: () => {
          landingView.classList.add('hidden');
          showGalleryView(targetView, true);
          gsap.set(backBtn, { display: 'block' });
          isAnimating = false;
          setView('gallery');
          setActiveCategory(slug);
          window.location.hash = slug;
          currentCleanup = initHorizontalScroll(`strip-${slug}`, `progress-${slug}`);
        },
      });
    }
  }

  function backToLanding(): void {
    if (isAnimating) return;
    const state = getState();
    if (state.view !== 'gallery' || !state.activeCategory) return;

    const currentView = getGalleryView(state.activeCategory);
    isAnimating = true;
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }

    if (prefersReduced) {
      currentView.classList.add('hidden');
      landingView.classList.remove('hidden');
      backBtn.classList.add('hidden');
      setView('landing');
      setActiveCategory(null);
      window.location.hash = '';
      isAnimating = false;
    } else {
      hideGalleryView(currentView, true);
      landingView.classList.remove('hidden');
      gsap.fromTo(landingView,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
          onComplete: () => {
            backBtn.classList.add('hidden');
            isAnimating = false;
            setView('landing');
            setActiveCategory(null);
            window.location.hash = '';
          },
        }
      );
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => openCategory(tab.dataset.category as CategorySlug));
  });

  backBtn.addEventListener('click', backToLanding);

  // Deep-link init
  const hash = window.location.hash.slice(1) as CategorySlug;
  if (CATEGORIES.some(c => c.slug === hash)) {
    openCategory(hash, false);
  }
</script>
```

- [ ] Commit

---

### Task 17: Index Page Assembly

**File:** `src/pages/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import CategoryIndex from '../components/CategoryIndex.astro';
import SecondaryIndex from '../components/SecondaryIndex.astro';
import ProjectStrip from '../components/ProjectStrip.astro';
import ScrollProgress from '../components/ScrollProgress.astro';
import BackToIndex from '../components/BackToIndex.astro';
import TransitionController from '../components/TransitionController.astro';
import { CATEGORIES } from '../lib/categories';
import '../styles/global.css';

const allProjects = await getCollection('projects');

function sortProjects(projects: typeof allProjects) {
  return [...projects].sort((a, b) => {
    const orderA = a.data.order ?? Infinity;
    const orderB = b.data.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return b.data.year - a.data.year;
  });
}

const byCategory = Object.fromEntries(
  CATEGORIES.map(cat => [
    cat.slug,
    sortProjects(allProjects.filter(p => p.data.category === cat.slug)),
  ])
);
---

<BaseLayout>
  <main class="relative">
    <!-- Landing view -->
    <div id="landing-view">
      <CategoryIndex />
    </div>

    <!-- Gallery views — one per category, full-screen overlays -->
    {CATEGORIES.map((cat) => (
      <div
        id={`gallery-${cat.slug}`}
        class="gallery-view hidden fixed inset-0 bg-void z-10 flex-col"
      >
        <!-- Compact header -->
        <div class="h-[15vh] flex items-center px-[clamp(2rem,5vw,6rem)] border-b border-flame/20 shrink-0">
          <h2 class="font-display text-[clamp(1.5rem,4vw,3rem)]">{cat.name}</h2>
        </div>

        <!-- Project strip -->
        <div class="flex-1 flex items-center min-h-0 overflow-hidden">
          <ProjectStrip id={`strip-${cat.slug}`} projects={byCategory[cat.slug]} />
        </div>

        <!-- Scroll progress -->
        <div class="shrink-0">
          <ScrollProgress id={`progress-${cat.slug}`} />
        </div>

        <!-- Secondary index -->
        <div class="shrink-0 border-t border-flame/20">
          <SecondaryIndex activeSlug={cat.slug} />
        </div>
      </div>
    ))}

    <BackToIndex />
    <TransitionController />
  </main>
</BaseLayout>
```

- [ ] Commit

---

### Task 18: Admin Page

**File:** `src/pages/admin.astro`

```astro
---
---
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] Commit

---

### Task 19: Netlify CMS Config

**File:** `public/admin/config.yml`

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: "projects"
    label: "Projects"
    folder: "src/content/projects"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - label: "Category"
        name: "category"
        widget: "select"
        options:
          - { label: "Creative Coding", value: "creative-coding" }
          - { label: "Physical Computing", value: "physical-computing" }
          - { label: "Design Work", value: "design-work" }
          - { label: "Professional Work", value: "professional-work" }
          - { label: "Student Projects", value: "student-projects" }
          - { label: "Side Projects", value: "side-projects" }
      - { label: "Year", name: "year", widget: "number" }
      - { label: "Description", name: "description", widget: "markdown", required: false }
      - { label: "Featured Image", name: "featuredImage", widget: "image" }
      - label: "Gallery"
        name: "gallery"
        widget: "list"
        field: { label: "Image", name: "image", widget: "image" }
        required: false
      - { label: "External URL", name: "externalUrl", widget: "string", required: false }
      - { label: "Order", name: "order", widget: "number", required: false }
```

- [ ] Commit

---

### Task 20: Sample Content

**Files:** Create 2–3 sample project markdown files in `src/content/projects/`

```markdown
---
title: "Generative Typography"
category: "creative-coding"
year: 2024
featuredImage: "/uploads/generative-type.jpg"
externalUrl: "https://example.com"
order: 1
---

Exploring parametric letterforms using p5.js and Perlin noise fields.
```

- [ ] Create sample files
- [ ] Commit

---

### Task 21: Build & Verify

- [ ] Run `npm run build`
- [ ] Expected: Build succeeds, no errors, `dist/` generated
- [ ] Verify `dist/index.html` exists and contains correct markup
- [ ] Commit

---

## Post-Implementation Notes

1. **Netlify Identity:** Enable in Netlify dashboard → Identity → Enable. Add Git Gateway.
2. **Invite-only:** Configure registration to invite-only for personal use.
3. **CMS Access:** Visit `/admin` after deploy to manage projects.
4. **Images:** Upload via CMS or place directly in `public/uploads/` before build.
