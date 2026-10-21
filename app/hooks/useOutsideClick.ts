import { useEffect, useRef, type RefObject } from "react";

/**
 * Invokes `onOutsideClick` when a `mousedown` happens outside `ref`.
 * The DOM listener is registered once; the latest callback is kept in a
 * ref so callers can pass inline closures without re-subscribing.
 */
const useOutsideClick = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: (event: MouseEvent) => void,
) => {
  const callbackRef = useRef(onOutsideClick);

  useEffect(() => {
    callbackRef.current = onOutsideClick;
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const element = ref.current;

      if (element && !element.contains(event.target as Node)) {
        callbackRef.current(event);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [ref]);

  return ref;
};

export default useOutsideClick;
