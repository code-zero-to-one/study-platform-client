'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isFetching?: boolean;
  fetchNextPage: () => Promise<unknown>;
  threshold?: number;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  fetchNextPage,
  threshold = 0.1,
}: InfiniteScrollOptions) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetching
        ) {
          fetchNextPage().catch(() => {
            // 무한 스크롤 실패 시 무시
          });
        }
      },
      { threshold },
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, threshold]);

  return observerTarget;
};
