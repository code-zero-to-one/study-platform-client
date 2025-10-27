'use client';
import React from 'react';

import { ApplyStatus } from '@/features/study/group/application/api/type';
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

  const handleApprove = (
    studyId: number,
    applyId: number,
    status: ApplyStatus,
  ) => {
    mutate(
      {
        groupStudyId: studyId,
        applyId: applyId,
        status: status,
      },
      {
        onSuccess: async () => {
          alert('적용되었습니다.');
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
              onClick={(status: ApplyStatus) =>
                handleApprove(Number(props.studyId), applicant.applyId, status)
              }
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
