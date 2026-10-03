import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

/**
 * Custom hook to detect clicks or keypresses (Escape) outside a specified DOM node.
 * Automatically closes floating menus, modals, and drawers like professional SaaS platforms.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: AnyEvent | KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: AnyEvent) => {
      const el = ref.current;
      // Do nothing if clicking ref's element or descendant elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    document.addEventListener('keydown', keyListener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keydown', keyListener);
    };
  }, [ref, handler, enabled]);
}