import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersection(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  }: UseIntersectionOptions = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current;
    if (!node || frozen || typeof IntersectionObserver !== 'function') return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}