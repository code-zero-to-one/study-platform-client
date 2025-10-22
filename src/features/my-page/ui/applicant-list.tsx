'use client';
import React from 'react';

import { useApplicantsByStatusQuery } from '@/features/study/group/application/model/use-applicant-qeury';
import ProfileCard from './profile-card';

export default function ApplicantList() {
  const { data } = useApplicantsByStatusQuery({
    groupStudyId: 1,
    status: 'PENDING',
  });

  return (
    <div className="flex w-full flex-col gap-500">
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((applicant) => (
            <ProfileCard key={applicant.applyId} data={applicant} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
