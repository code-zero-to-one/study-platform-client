'use client';

import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { useUserStore } from '@/stores/useUserStore';
import { GroupStudyFullResponse } from '@/features/study/group/api/group-study-types';
import ApplyGroupStudyModal from '@/features/study/group/ui/apply-group-study-modal';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_METHOD_LABELS,
  STUDY_STATUS_LABELS,
  STUDY_TYPE_LABELS,
} from '../../features/study/group/const/group-study-const';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';

interface Props {
  data: GroupStudyFullResponse;
}

export default function SummaryStudyInfo({ data }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const memberId = useUserStore((state) => state.memberId);

  const { basicInfo, detailInfo, interviewPost } = data;
  const {
    groupStudyId,
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
  } = basicInfo ?? {};
  const { title } = detailInfo ?? {};
  const { interviewPost: questions } = interviewPost ?? {};

  const isLeader = leader?.memberId === memberId;

  const { data: myApplicationStatus } = useGetGroupStudyMyStatus({
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

  const handleApplySuccess = () => {
    if (price > 0) {
      router.push(`/payment/${groupStudyId}`);
    }
  };

  const isApplyDisabled =
    isLeader ||
    myApplicationStatus?.status !== 'NONE' ||
    groupStudyStatus === 'IN_PROGRESS' ||
    approvedCount >= maxMembersCount;

  const getButtonText = () => {
    if (
      myApplicationStatus?.status === 'APPROVED' &&
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

      <div className="mt-200 h-px w-full bg-[#D5D7DA]" />

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
              <ChevronUp className="h-200 w-200" />
            </>
          ) : (
            <>
              더보기
              <ChevronDown className="h-200 w-200" />
            </>
          )}
        </button>
      )}

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-100">
        {/* 스터디 신청 모달 (유료/무료 공통) */}

        <ApplyGroupStudyModal
          groupStudyId={groupStudyId}
          title={title}
          questions={questions}
          onSuccess={handleApplySuccess}
          trigger={
            <Button
              size="large"
              color="primary"
              className="h-600"
              disabled={isApplyDisabled}
            >
              {getButtonText()}
            </Button>
          }
        />

        <Button
          color="secondary"
          size="large"
          className="font-designer-16b h-600"
          onClick={handleCopyURL}
        >
          공유하기
        </Button>
      </div>
    </div>
  );
}
