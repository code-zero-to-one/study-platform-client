'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

export default function ApplicantPage(props: ApplicantListProps) {
  const router = useRouter();
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
    <div className="m-auto flex w-[720px] flex-col gap-300">
      <div className="font-designer-20b flex items-center">
        <Image
          src="/icons/arrow-left-line.svg"
          alt="arrow-left"
          width={40}
          height={40}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
        <div className="flex-1 text-center">새로운 신청자 확인하기</div>
      </div>
      <div className="flex w-full flex-col gap-500">
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.content.map((applicant) => (
              <ProfileCard
                key={applicant.applyId}
                data={applicant}
                onClick={(status: ApplyStatus) =>
                  handleApprove(
                    Number(props.studyId),
                    applicant.applyId,
                    status,
                  )
                }
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
