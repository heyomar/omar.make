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
