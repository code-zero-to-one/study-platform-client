'use client';
import React from 'react';

import {
  useApplicantsByStatusQuery,
  useUpdateApplicantByStatusMutation,
} from '@/features/study/group/application/model/use-applicant-qeury';
import ProfileCard from './profile-card';

interface ApplicantListProps {
  studyId: string;
}

export default function ApplicantList(props: ApplicantListProps) {
  const { data, refetch } = useApplicantsByStatusQuery({
    groupStudyId: Number(props.studyId),
    status: 'PENDING',
  });

  const { mutate, isPending } = useUpdateApplicantByStatusMutation();

  const handleApprove = (studyId: number, applyId: number) => {
    mutate(
      {
        groupStudyId: studyId,
        applyId: applyId,
        status: 'APPROVED',
      },
      {
        onSuccess: async () => {
          console.log('승인완료');
          alert('승인이 완료되었습니다.');
          await refetch();
        },
        onError: (err) => console.log(err),
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-500">
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((applicant) => (
            <ProfileCard
              key={applicant.applyId}
              data={applicant}
              onClick={() =>
                handleApprove(Number(props.studyId), applicant.applyId)
              }
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
