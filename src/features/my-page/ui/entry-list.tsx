'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import EntryCard from './entry-card';
import { getEntryList } from '../api/get-entry-list';

export default function EntryList() {
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['entryList'],
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

  console.log('data', data);

  return (
    <div className="flex w-full flex-col gap-500">
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((applicant) => (
            <EntryCard key={applicant.applyId} data={applicant} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
