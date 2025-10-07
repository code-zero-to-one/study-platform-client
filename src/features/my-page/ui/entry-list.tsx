'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { getEntryList } from '../api/get-entry-list';
import EntryCard from './entry-card';

export default function EntryList() {
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['groupStudies'],
    queryFn: async ({ pageParam }) => {
      const response = await getEntryList({
        groupStudyId: 1,
        page: pageParam,
        size: 20,
        status: 'PENDING',
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }

      return null;
    },
    initialPageParam: 0,
    maxPages: 3,
  });

  return (
    <div className="flex w-full flex-col gap-500">
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((entry) => (
            <EntryCard key={entry.memberId} entry={entry} />
          ))}
        </React.Fragment>
      ))}
      {data?.pages[data.pages.length - 1].hasNext && (
        <button
          onClick={() => fetchNextPage()}
          className="rounded-4 mt-500 bg-blue-600 px-300 py-200 text-white"
        >
          더 불러오기
        </button>
      )}
    </div>
  );
}
