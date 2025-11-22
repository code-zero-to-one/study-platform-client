import { useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

/**
 * targetRef를 관찰하여, 교차 상태가 바뀔 때마다 onIntersect 콜백을 실행합니다.
 * @param onIntersect 교차 상태가 바뀔 때 실행할 콜백
 * @param options IntersectionObserver 옵션
 * @returns targetRef (관찰할 DOM에 연결)
 */
export function useIntersectionObserver(
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {},
) {
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!options.enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry);
        }
      });
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [onIntersect, options]);

  return targetRef;
}
