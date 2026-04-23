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
