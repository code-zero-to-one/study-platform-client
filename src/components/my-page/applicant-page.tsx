'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import {
  useApplicantsByStatusQuery,
  useUpdateApplicantByStatusMutation,
} from '@/hooks/queries/group-study/use-applicant-query';
import { useToastStore } from '@/stores/use-toast-store';
import { ApplyStatus } from '@/types/api/group-study-application.types';
import ProfileCard from './profile-card';

interface ApplicantListProps {
  studyId: string;
}

export default function ApplicantPage(props: ApplicantListProps) {
  const router = useRouter();
  const { data, refetch, isPending } = useApplicantsByStatusQuery({
    groupStudyId: Number(props.studyId),
    status: 'PENDING',
  });

  const isEmpty =
    !isPending && data?.pages.every((page) => page.content.length === 0);

  const { mutate } = useUpdateApplicantByStatusMutation();

  const showToast = useToastStore((state) => state.showToast);

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
          showToast('적용되었습니다.');
          await refetch();
        },
        onError: (err: unknown) => {
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('An unknown error occurred');
        },
      },
    );
  };

  return (
    <div className="m-auto flex w-full max-w-[720px] flex-col gap-300">
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
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-600">
          <p className="font-designer-16r text-text-subtle">
            아직 신청한 멘티가 없어요.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-500">
          {data?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.content
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime(),
                )
                .map((applicant) => (
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
      )}
    </div>
  );
}
