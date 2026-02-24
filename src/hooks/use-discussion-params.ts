import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  DiscussionTopic,
  SortOption,
} from '@/types/one-to-one-study/discussion';

export interface DiscussionParams {
  q: string;
  sort: SortOption;
  topic: DiscussionTopic;
}

/**
 * Discussion 페이지의 URL 쿼리스트링을 관리하는 훅
 * ?q=검색어&sort=latest&topic=all 형태로 동기화
 */
export function useDiscussionParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 파라미터 값 파싱
  const params = useMemo<DiscussionParams>(() => {
    return {
      q: searchParams.get('q') || '',
      sort: (searchParams.get('sort') as SortOption) || 'latest',
      topic: (searchParams.get('topic') as DiscussionTopic) || 'all',
    };
  }, [searchParams]);

  // URL 업데이트 함수
  const updateParams = useCallback(
    (updates: Partial<DiscussionParams>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === 'all' || value === 'latest') {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      const queryString = current.toString();
      const newUrl = queryString ? `?${queryString}` : '';
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router],
  );

  // 개별 업데이트 헬퍼 함수들
  const setSearch = useCallback(
    (q: string) => {
      updateParams({ q });
    },
    [updateParams],
  );

  const setSort = useCallback(
    (sort: SortOption) => {
      updateParams({ sort });
    },
    [updateParams],
  );

  const setTopic = useCallback(
    (topic: DiscussionTopic) => {
      updateParams({ topic });
    },
    [updateParams],
  );

  const resetParams = useCallback(() => {
    router.push('', { scroll: false });
  }, [router]);

  return {
    params,
    updateParams,
    setSearch,
    setSort,
    setTopic,
    resetParams,
  };
}
