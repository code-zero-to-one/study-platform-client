'use client';
import React from 'react';
import { useEntryListInfiniteQuery } from '../model/use-get-entry-list';
import EntryCard from './entry-card';

export default function EntryList() {
  const { data } = useEntryListInfiniteQuery({ groupStudyId: 1 });

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
