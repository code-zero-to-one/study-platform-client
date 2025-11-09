'use client';

import React from 'react';
import Button from '@/shared/ui/button';
import ApplyGroupStudyModal from './apply-group-study-modal';
import {
  GroupStudyDetailResponse,
  GroupStudyStatus,
} from '../api/group-study-types';
import { useGroupStudyMyStatusQuery } from '../model/use-group-study-my-status-query';

interface SummaryStudyInfoProps {
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
  memberId?: number;
}

export default function SummaryStudyInfo({
  data,
  title,
  groupStudyId,
  questions,
  isLeader,
  groupStudyStatus,
  approvedCount,
  maxMembersCount,
  memberId,
}: SummaryStudyInfoProps) {
  const { data: myApplicationStatus } = useGroupStudyMyStatusQuery({
    groupStudyId,
    isLeader,
  });

  const isLoggedIn = typeof memberId === 'number';

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

      <div className="mt-500 flex flex-col gap-100">
        {/* 신청 이전 => "신청하기" able */}
        {/* 신청 이후  => "신청하기" disabled */}
        {/* 승인 이후 => "참여 중인 스터디" 버튼 */}
        {/* 스터디 진행중 => "참여 중인 스터디" disabled */}
        {/* 스터디 종료 => "신청하기" disabled */}
        {/* 스터디 강퇴 => "신청하기" disabled */}
        {!isLeader && (
          <ApplyGroupStudyModal
            groupStudyId={groupStudyId}
            title={title}
            questions={questions}
            trigger={
              <Button
                size="large"
                color="primary"
                className="h-[48px]"
                disabled={
                  myApplicationStatus?.status !== 'NONE' ||
                  groupStudyStatus === 'IN_PROGRESS' ||
                  approvedCount >= maxMembersCount ||
                  !isLoggedIn
                }
              >
                {myApplicationStatus?.status === 'APPROVED' ||
                groupStudyStatus === 'IN_PROGRESS'
                  ? '참여 중인 스터디'
                  : '신청하기'}
              </Button>
            }
          />
        )}

        <Button
          color="secondary"
          size="large"
          className="font-designer-16b h-[48px]"
          disabled
        >
          공유하기
        </Button>
      </div>
    </div>
  );
}
