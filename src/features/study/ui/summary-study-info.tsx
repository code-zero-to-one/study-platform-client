'use client';

import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { GroupStudyDetailResponse } from '../group/api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_METHOD_LABELS,
  STUDY_STATUS_LABELS,
  STUDY_TYPE_LABELS,
} from '../group/const/group-study-const';
import { useGroupStudyMyStatusQuery } from '../group/model/use-group-study-my-status-query';

interface Props {
  data: GroupStudyDetailResponse;
  memberId?: number;
}

export default function SummaryStudyInfo({ data, memberId }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const { basicInfo, detailInfo } = data;
  const {
    groupStudyId,
    hostType,
    status: groupStudyStatus,
    maxMembersCount,
    approvedCount,
    price,
    leader,
    method,
    startDate,
    endDate,
    regularMeeting,
    location,
    type,
    targetRoles,
    experienceLevels,
  } = basicInfo;
  const { title } = detailInfo;

  const isLeader = leader.memberId === memberId;
  const isLoggedIn = typeof memberId === 'number';
  const isPremium = hostType === 'ZEROONE' || hostType === 'METOR';

  const { data: myApplicationStatus } = useGroupStudyMyStatusQuery({
    groupStudyId,
    isLeader,
  });

  const getDurationText = (start: string, end: string): string => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    if (diffTime < 0) return '기간이 잘못되었습니다.';

    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffWeeks = diffDays / 7;
    const diffMonths = diffDays / 30;

    return diffMonths < 1
      ? `약 ${Math.round(diffWeeks)}주`
      : `약 ${Math.round(diffMonths)}개월`;
  };

  const infoItems = [
    { label: '유형', value: STUDY_TYPE_LABELS[type] },
    {
      label: '주제',
      value: targetRoles.map((role) => ROLE_LABELS[role]).join(', '),
    },
    {
      label: '진행 방식',
      value: STUDY_METHOD_LABELS[method],
    },
    {
      label: '상태',
      value: STUDY_STATUS_LABELS[groupStudyStatus],
    },
    {
      label: '현직자 참여 여부',
      value:
        experienceLevels
          .map((level) => EXPERIENCE_LEVEL_LABELS[level])
          .join(', ') || '무관',
    },
    {
      label: '진행 기간',
      value: getDurationText(startDate, endDate),
    },
    {
      label: '정기모임 유무',
      value: `${REGULAR_MEETING_LABELS[regularMeeting]}${location ? `, ${location}` : ''}`,
    },
    {
      label: '모집인원',
      value: `${maxMembersCount}명`,
    },
    {
      label: '스터디 기간',
      value: `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`,
    },
    {
      label: '참가비',
      value: price === 0 ? '무료' : `${price.toLocaleString()}원`,
    },
  ];

  const visibleItems = isExpanded ? infoItems : infoItems.slice(0, 4);

  const handleCopyURL = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert('스터디 링크가 복사되었습니다!');
  };

  const handleApplyClick = () => {
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
    <div className="rounded-150 flex w-[335px] flex-col self-start border border-[#D5D7DA] bg-white px-300 py-400">
      {/* 제목 */}
      <p className="font-designer-20b text-text-default mb-300">{title}</p>

      {/* 정보 리스트 */}
      <div className="flex flex-col gap-150">
        {visibleItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="font-designer-15m text-text-subtlest">
              {item.label}
            </span>
            <span className="font-designer-15m text-text-default">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-200 h-[1px] w-full bg-[#D5D7DA]" />

      {/* 더보기/접기 버튼 */}
      {infoItems.length > 4 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-designer-14m text-text-subtle hover:text-text-default mt-150 mb-300 flex items-center justify-center gap-50 transition-colors"
        >
          {isExpanded ? (
            <>
              접기
              <ChevronUp className="h-[16px] w-[16px]" />
            </>
          ) : (
            <>
              더보기
              <ChevronDown className="h-[16px] w-[16px]" />
            </>
          )}
        </button>
      )}

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-100">
        {/* 프리미엄(유료) 스터디: 결제 페이지로 이동 */}
        {isPremium && !isLeader && isLoggedIn && (
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

        {/* 무료 스터디: 모달로 신청 */}
        {/* {!isPremium && !isLeader && isLoggedIn && (
          <ApplyGroupStudyModal
            groupStudyId={groupStudyId}
            title={title}
            questions={questions}
            trigger={
              <Button
                size="large"
                color="primary"
                className="h-[48px]"
                disabled={isApplyDisabled}
              >
                {getButtonText()}
              </Button>
            }
          />
        )} */}

        {/* 비로그인 상태 */}
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
