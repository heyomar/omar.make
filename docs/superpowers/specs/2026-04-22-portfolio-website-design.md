# Portfolio Website Design Spec

**Date:** 2026-04-22  
**Project:** Personal Portfolio for Creative Technologist  
**Tech Stack:** Astro, Tailwind CSS v4, GSAP + ScrollTrigger, Netlify CMS (Decap CMS), Netlify Hosting

---

## 1. Overview

A minimalist, type-and-imagery-focused portfolio for a Creative Technologist. The site uses a bold two-color scheme (near-black and vivid red-orange) with a large typographic index as its primary navigation. Clicking a category morphs the viewport into a horizontally scrolling project gallery, with smooth GSAP transitions and full Netlify CMS content management.

---

## 2. Design System

### 2.1 Color Palette (Max 2)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-void` | `#0A0A0A` | Primary background, primary text on accent |
| `--color-flame` | `#FF3B00` | Accent color — active states, hover, highlights, rules, progress bars |

No additional colors. Work imagery provides all chromatic variety.

### 2.2 Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | **Newsreader** (serif) | 400 / 700 | Category tab names, project titles in hero states |
| Body / UI | **Inter** (sans-serif) | 400 / 500 / 700 | Navigation labels, project metadata, body copy, buttons |

- Category names: `clamp(4rem, 12vw, 10rem)`
- Project titles: `clamp(1.5rem, 3vw, 3rem)`
- Body / metadata: `clamp(0.875rem, 1vw, 1rem)`
- Line height display: 0.95–1.0 (tight, editorial)
- Line height body: 1.6

### 2.3 Spacing & Rhythm

- Section padding: `clamp(2rem, 5vw, 6rem)` horizontal
- Tab gap / rule spacing: `4vh`
- Project card gap: `4vw`
- Border radii: `0px` (fully sharp, editorial)
- Max content width: none (full-bleed design)

---

## 3. Page Structure

### 3.1 Landing State — Category Index

```
┌──────────────────────────────────────────────┐
│  #0A0A0A background                           │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  Creative Coding                       │   │ ← Serif, 12vw, white
│  │  ───────────────────────────────────   │   │ ← Rule, #FF3B00 @ 20%
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  Physical Computing                    │   │
│  │  ───────────────────────────────────   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  Design Work                           │   │
│  │  ───────────────────────────────────   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ... (6 categories total)                     │
│                                               │
└──────────────────────────────────────────────┘
```

- Each tab is ~60–80vh tall, full viewport width.
- Category name centered or left-aligned within padding.
- Thin horizontal rule below each name.

#### Hover State
- Text shifts to `#FF3B00`
- Subtle `translateX(1vw)` nudge (CSS `transform`, not layout shift)
- Rule opacity increases to 50%
- Cursor changes to pointer

#### Click Transition (GSAP Timeline)
1. **0ms–400ms:** Clicked tab animates upward, scales name down to header size (~15vh height), translates to top of viewport.
2. **200ms–600ms:** Unclicked tabs slide downward and fade to `opacity: 0.3`, stacking into a compact secondary index (~8vh each).
3. **400ms–800ms:** Horizontal project strip fades in below the header with a slight `translateY(20px)` → `0` entrance.
4. **URL updates** to `/#<category-slug>` for deep-linking.
- **Direct deep-link behavior:** Visiting `/#<category-slug>` directly initializes the page in the active gallery state for that category (not the landing index). The GSAP transition controller reads the hash on mount and skips the landing→gallery entrance animation, rendering the target category's project strip immediately.

### 3.2 Active State — Project Gallery

```
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────┐      │
│  │  Creative Coding     (tab, compact)│      │ ← 15vh, serif, white
│  └────────────────────────────────────┘      │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │          │  │          │  │          │   │
│  │  Image   │  │  Image   │  │  Image   │   │ ← 70vw cards, 4:3 or 16:10
│  │          │  │          │  │          │   │
│  │  Title   │  │  Title   │  │  Title   │   │ ← Sans-serif, white
│  │  Year    │  │  Year    │  │  Year    │   │ ← Flame, sans-serif
│  └──────────┘  └──────────┘  └──────────┘   │
│                                               │
│  ─────────────────────────────────────────   │ ← Scroll progress, flame
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  Physical Computing   (30% opacity)    │   │
│  │  Design Work          (30% opacity)    │   │ ← Secondary index
│  │  ...                                   │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

#### Horizontal Scroll Strip
- Container: `overflow-x: auto`
- Each card: width `70vw` (desktop) / `85vw` (mobile)
- **Desktop:** GSAP ScrollTrigger handles inertia and programmatic snap-to-card. CSS `scroll-snap-type` is **disabled** on desktop to avoid conflict.
- **Mobile:** CSS `scroll-snap-type: x mandatory` with `scroll-snap-align: start` on each card. GSAP snap is **disabled** on mobile.
- Gap between cards: `4vw`
- Cards are vertical stacks: image → title → year
- **Card click behavior:** Cards with `externalUrl` navigate to that URL (new tab). Cards without `externalUrl` are non-interactive for MVP (detail pages deferred per Section 9).

#### Secondary Index
- Below the scroll strip, the remaining 5 categories are visible at 30% opacity
- Clicking any secondary tab swaps the active project strip with a matching GSAP transition (crossfade + slight horizontal slide). The horizontal scroll position resets to `scrollLeft = 0` on each category swap.
- **Hover on secondary tab:** text and rule shift to full opacity + flame color (same hover treatment as landing state). The clicked tab then animates to the header, and the previous header tab animates down into the secondary index.

#### Scroll Progress Indicator
- Thin horizontal line at bottom of scroll strip, full container width
- Filled portion = `#FF3B00`, track = `#FF3B00` at 10% opacity
- Updates on scroll

#### "↑ Index" Button
- Fixed position, bottom-right or top-right corner
- Sans-serif, `0.875rem`, `#FF3B00`
- Clicking triggers reverse of the landing-entry GSAP timeline, restoring full category index

---

## 4. Content Structure

### 4.1 Categories (6 total)

| # | Name | Slug |
|---|------|------|
| 1 | Creative Coding | `creative-coding` |
| 2 | Physical Computing | `physical-computing` |
| 3 | Design Work | `design-work` |
| 4 | Professional Work | `professional-work` |
| 5 | Student Projects | `student-projects` |
| 6 | Side Projects | `side-projects` |

### 4.2 Project Schema (per Netlify CMS collection)

```yaml
collections:
  - name: "projects"
    folder: "src/content/projects"
    fields:
      - { name: "title", widget: "string", required: true }
      - { name: "category", widget: "select", options: ["creative-coding", "physical-computing", "design-work", "professional-work", "student-projects", "side-projects"] }
      - { name: "year", widget: "number", required: true }
      - { name: "description", widget: "markdown", required: false }
      - { name: "featuredImage", widget: "image", required: true }
      - { name: "gallery", widget: "list", field: { name: "image", widget: "image" }, required: false }
      - { name: "externalUrl", widget: "string", required: false }
      - { name: "order", widget: "number", required: false }
```

Projects are ordered by `order` field ascending, then `year` descending.

---

## 5. Animation & Interaction Spec

### 5.1 Easing
- All transitions: `power3.inOut` (GSAP)
- Hover micro-interactions: `power2.out`
- Duration for major transitions: 600–800ms
- Stagger between elements: 50–100ms

### 5.2 Reduced Motion (`prefers-reduced-motion`)
- GSAP timelines disabled
- State changes are instant opacity swaps (no transforms)
- Scroll strip uses native scroll only (no inertia/snap enhancement)

### 5.3 Mobile Behavior
- Same stacked tab layout, but tabs are full-width touch targets
- Horizontal scroll strip uses native `overflow-x: scroll` with `-webkit-overflow-scrolling: touch`
- GSAP snap disabled; rely on CSS `scroll-snap-type`
- Tap-to-open, tap-elsewhere-to-close where appropriate

---

## 6. Technical Architecture

### 6.1 File Structure

```
├── src/
│   ├── content/
│   │   └── projects/           # Markdown + frontmatter (CMS-managed)
│   ├── pages/
│   │   ├── index.astro         # Landing + active state (single page app feel)
│   │   └── admin.astro         # Netlify CMS redirect
│   ├── components/
│   │   ├── CategoryTab.astro   # Individual tab component
│   │   ├── CategoryIndex.astro # Stacked index view
│   │   ├── ProjectStrip.astro  # Horizontal scroll container
│   │   ├── ProjectCard.astro   # Individual project card
│   │   ├── ScrollProgress.astro
│   │   └── BackToIndex.astro
│   ├── scripts/
│   │   ├── transitions.ts      # GSAP timeline definitions
│   │   └── horizontalScroll.ts # ScrollTrigger horizontal scroll logic
│   ├── styles/
│   │   └── global.css          # Tailwind v4 @theme, font imports
│   └── layouts/
│       └── BaseLayout.astro
├── public/
│   ├── admin/
│   │   └── config.yml          # Netlify CMS configuration
│   └── uploads/                # CMS image uploads
├── astro.config.mjs
├── src/styles/global.css       # Tailwind v4 with @theme (CSS-first, no tailwind.config.js)
├── netlify.toml
└── package.json
```

### 6.2 Astro Islands

- **CategoryIndex** — static Astro component, no hydration needed
- **ProjectStrip** — static shell, but inner scroll enhancement hydrates with `client:visible` (loads GSAP only when scrolled into view)
- **Transitions** — `client:load` on the root layout; lightweight GSAP controller that orchestrates tab click → state morph

### 6.3 Tailwind CSS v4 Configuration

Uses CSS-first `@theme` in `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-void: #0A0A0A;
  --color-flame: #FF3B00;
  --font-display: "Newsreader", serif;
  --font-body: "Inter", sans-serif;
}
```

**Note on palette:** White (`#FFFFFF`) is used only as default accessible text on the void background. It is not a "design color" — the intentional 2-color palette is void + flame. All expressive color comes from work imagery.

### 6.4 Netlify CMS Setup

- Git-gateway backend with Netlify Identity
- `public/admin/config.yml` defines collections
- Images uploaded to `public/uploads/`
- Editorial workflow disabled (single-user site)

### 6.5 Build & Deploy

- `astro build` → static output to `dist/`
- Netlify deploy with build command `npm run build`
- Hash-based routing is client-side only; no server fallback needed for `/#` routes

---

## 7. Responsive Breakpoints

| Name | Width | Adjustments |
|------|-------|-------------|
| Mobile | < 768px | Category names: `clamp(3rem, 10vw, 6rem)`; project cards: `85vw`; strip is native scroll only |
| Tablet | 768–1024px | Category names: `clamp(4rem, 11vw, 8rem)`; project cards: `75vw` |
| Desktop | > 1024px | Full spec as described; GSAP inertia enabled |

---

## 8. Performance Budget

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- No layout shift on tab transitions (all animations use `transform`/`opacity`)
- Images: Astro `<Image />` component with responsive srcsets, WebP/AVIF output
- GSAP loaded only on desktop; mobile uses native scroll + CSS transitions

---

## 9. Open Questions / Deferred

1. **Project detail pages:** Not in scope for initial build. Cards link to external URLs or show a lightbox overlay (future enhancement).
2. **About / Contact pages:** Could be a 7th tab or separate route. Deferred — landing + project browsing is MVP.
3. **SEO:** Astro handles basic meta; `robots.txt` and sitemap included. Structured data deferred.
