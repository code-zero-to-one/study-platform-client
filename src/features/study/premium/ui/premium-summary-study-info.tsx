'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Button from '@/components/ui/button';
import {
  GroupStudyDetailResponse,
  GroupStudyStatus,
} from '../../group/api/group-study-types';
import { useGroupStudyMyStatusQuery } from '../../group/model/use-group-study-my-status-query';

interface PremiumSummaryStudyInfoProps {
  data: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  title: string;
  groupStudyId: number;
  questions: GroupStudyDetailResponse['interviewPost']['interviewPost'];
  isLeader: boolean;
  groupStudyStatus: GroupStudyStatus;
  approvedCount: GroupStudyDetailResponse['basicInfo']['approvedCount'];
  maxMembersCount: GroupStudyDetailResponse['basicInfo']['maxMembersCount'];
  price: number;
  memberId?: number;
}

export default function PremiumSummaryStudyInfo({
  data,
  title,
  groupStudyId,
  isLeader,
  groupStudyStatus,
  approvedCount,
  maxMembersCount,
  price,
  memberId,
}: PremiumSummaryStudyInfoProps) {
  const router = useRouter();
  const { data: myApplicationStatus } = useGroupStudyMyStatusQuery({
    groupStudyId,
    isLeader,
  });

  const isLoggedIn = typeof memberId === 'number';

  const handleCopyURL = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert('스터디 링크가 복사되었습니다!');
  };

  const handleApplyClick = () => {
    // 결제 페이지로 이동 (groupStudyId를 전달)
    router.push(`/payment/${groupStudyId}`);
  };

  const isApplyDisabled =
    myApplicationStatus?.status !== 'NONE' ||
    groupStudyStatus === 'IN_PROGRESS' ||
    approvedCount >= maxMembersCount;

  const getButtonText = () => {
    if (
      myApplicationStatus?.status === 'APPROVED' ||
      groupStudyStatus === 'IN_PROGRESS'
    ) {
      return '참여 중인 스터디';
    }
    if (myApplicationStatus?.status === 'PENDING') {
      return '승인 대기중';
    }
    return '신청하기';
  };

  return (
    <div className="rounded-150 flex w-[335px] flex-col self-start border-[1px] border-[#D5D7DA] p-300">
      <p className="font-designer-18b">{title}</p>
      <div className="my-300 h-[1px] w-full bg-[#D5D7DA]" />
      <div className="grid grid-cols-2 grid-rows-2 gap-200">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-100 border-[#E7E8EA]"
          >
            <div className="flex items-center">{item.icon}</div>
            <span className="font-designer-15m text-text-subtle truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 가격 표시 */}
      <div className="mt-400 flex items-center justify-between">
        <span className="font-designer-16r text-text-subtle">참가비</span>
        <span className="font-designer-20b text-[#EF4444]">
          {price === 0 ? '무료' : `${price.toLocaleString()}원`}
        </span>
      </div>

      <div className="mt-300 flex flex-col gap-100">
        {!isLeader && isLoggedIn && (
          <Button
            size="large"
            color="primary"
            className="h-[48px]"
            disabled={isApplyDisabled}
            onClick={handleApplyClick}
          >
            {getButtonText()}
          </Button>
        )}
        {!isLoggedIn && (
          <Button
            size="large"
            color="primary"
            className="h-[48px]"
            disabled={
              groupStudyStatus === 'IN_PROGRESS' ||
              approvedCount >= maxMembersCount
            }
            onClick={() => {
              router.push('/login');
            }}
          >
            {groupStudyStatus === 'IN_PROGRESS'
              ? '참여 중인 스터디'
              : '신청하기'}
          </Button>
        )}

        <Button
          color="secondary"
          size="large"
          className="font-designer-16b h-[48px]"
          onClick={handleCopyURL}
        >
          공유하기
        </Button>
      </div>
    </div>
  );
}
