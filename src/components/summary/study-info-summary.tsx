'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserTransactionDetailResponseTransactionTypeEnum } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import ApplyGroupStudyModal from '@/components/modals/apply-group-study-modal';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_METHOD_LABELS,
  STUDY_STATUS_LABELS,
  STUDY_TYPE_LABELS,
} from '@/config/group-study-const';
import { useAuth } from '@/hooks/common/use-auth';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import { useGetMyTransactionsByGroupStudy } from '@/hooks/queries/payment-user-api';
import { useToastStore } from '@/stores/use-toast-store';
import { GroupStudyFullResponse } from '@/types/api/group-study.types';

interface SummaryStudyInfoProps {
  data: GroupStudyFullResponse;
}

type ApplyButtonAction =
  | 'OPEN_APPLY_MODAL'
  | 'REDIRECT_LOGIN'
  | 'REDIRECT_PAYMENT'
  | 'REDIRECT_PAYMENT_MANAGEMENT'
  | 'DISABLED';

interface ApplyButtonState {
  text: string;
  disabled: boolean;
  action: ApplyButtonAction;
}

export default function SummaryStudyInfo({ data }: SummaryStudyInfoProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, data: authData } = useAuth();
  const showToast = useToastStore((state) => state.showToast);

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

  const isLoggedIn = isAuthenticated;
  const isLeader = leader?.memberId === authData?.memberId;

  const { data: myApplicationStatus } = useGetGroupStudyMyStatus({
    groupStudyId,
    isLeader,
  });

  // open api로 결제 상태 조회 (유료 스터디일때만)
  const { data: paymentTransactionsData } = useGetMyTransactionsByGroupStudy({
    groupStudyId,
    page: 0,
    size: 1,
    enabled: price > 0 && isLoggedIn && !isLeader,
  });
  const latestPaymentType = paymentTransactionsData?.content?.[0]
    ?.transactionType as
    | UserTransactionDetailResponseTransactionTypeEnum
    | undefined;

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
      label: '스터디 기간',
      value: `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`,
    },
    {
      label: '참가비',
      value: price === 0 ? '무료' : `${price.toLocaleString()}원`,
    },
    {
      label: '모집인원',
      value: `${maxMembersCount}명`,
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
      label: '스터디 대상',
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
  ];

  const visibleItems = isExpanded ? infoItems : infoItems.slice(0, 4);

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('스터디 링크가 복사되었습니다!');
    } catch {
      showToast('클립보드 복사에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const handleApplySuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['groupStudyMemberStatus', groupStudyId],
    });
    if (price > 0) {
      router.push(`/payment/${groupStudyId}`);
    }
  };

  // 신청 마감 여부 체크 (스터디 시작일이 오늘 이전이거나 같은 경우)
  const isDeadlinePassed =
    !!startDate && !dayjs(startDate).isAfter(dayjs(), 'day');

  const getApplyButtonState = (): ApplyButtonState => {
    if (!isLoggedIn) {
      return {
        text: '신청하기',
        disabled: false,
        action: 'REDIRECT_LOGIN',
      };
    }

    if (isLeader) {
      return {
        text: '내가 개설한 스터디',
        disabled: true,
        action: 'DISABLED',
      };
    }

    if (
      isDeadlinePassed ||
      groupStudyStatus !== 'RECRUITING' ||
      approvedCount >= maxMembersCount
    ) {
      return {
        text: '모집 마감',
        disabled: true,
        action: 'DISABLED',
      };
    }

    if (myApplicationStatus?.status === 'NONE') {
      return {
        text: '신청하기',
        disabled: false,
        action: 'OPEN_APPLY_MODAL',
      };
    }

    if (myApplicationStatus?.status === 'APPROVED') {
      return {
        text: '참여 중인 스터디',
        disabled: true,
        action: 'DISABLED',
      };
    }

    if (myApplicationStatus?.status === 'PENDING') {
      // 유료 스터디이고 결제 완료된 경우
      if (
        price > 0 &&
        latestPaymentType ===
          UserTransactionDetailResponseTransactionTypeEnum.PaymentSuccess
      ) {
        return {
          text: '승인 대기중',
          disabled: true,
          action: 'DISABLED',
        };
      }

      // 유료 스터디이고 결제 취소 또는 실패한 경우 - 재결제 가능 (입금 대기중보다 우선)
      if (
        price > 0 &&
        (latestPaymentType ===
          UserTransactionDetailResponseTransactionTypeEnum.PaymentCanceled ||
          latestPaymentType ===
            UserTransactionDetailResponseTransactionTypeEnum.PaymentFailed)
      ) {
        return {
          text: '결제하기',
          disabled: false,
          action: 'REDIRECT_PAYMENT',
        };
      }

      // 유료 스터디이고 가상계좌 입금 대기 중
      if (
        price > 0 &&
        latestPaymentType ===
          UserTransactionDetailResponseTransactionTypeEnum.PaymentWaitingForDeposit
      ) {
        return {
          text: '입금 대기중',
          disabled: false,
          action: 'REDIRECT_PAYMENT_MANAGEMENT',
        };
      }

      // 유료 스터디인데 결제 이력이 없는 경우 (신청서만 제출하고 결제 안 함)
      if (price > 0 && latestPaymentType === undefined) {
        return {
          text: '결제하기',
          disabled: false,
          action: 'REDIRECT_PAYMENT',
        };
      }

      // 무료 스터디이거나 결제 이력이 없는 경우
      return {
        text: '승인 대기중',
        disabled: true,
        action: 'DISABLED',
      };
    }

    if (myApplicationStatus?.status === 'REJECTED') {
      return {
        text: '참여불가',
        disabled: true,
        action: 'DISABLED',
      };
    }

    if (price <= 0) {
      return {
        text: '신청하기',
        disabled: false,
        action: 'OPEN_APPLY_MODAL',
      };
    }

    if (
      latestPaymentType ===
      UserTransactionDetailResponseTransactionTypeEnum.PaymentWaitingForDeposit
    ) {
      return {
        text: '결제관리로 이동',
        disabled: false,
        action: 'REDIRECT_PAYMENT_MANAGEMENT',
      };
    }

    if (
      latestPaymentType ===
      UserTransactionDetailResponseTransactionTypeEnum.PaymentSuccess
    ) {
      return {
        text: '신청하기',
        disabled: false,
        action: 'OPEN_APPLY_MODAL',
      };
    }

    return {
      text: '결제하기',
      disabled: false,
      action: 'REDIRECT_PAYMENT',
    };
  };

  const applyButtonState = getApplyButtonState();

  const handleApplyAction = () => {
    switch (applyButtonState.action) {
      case 'REDIRECT_LOGIN':
        router.push('/login');
        break;
      case 'REDIRECT_PAYMENT':
        router.push(`/payment/${groupStudyId}`);
        break;
      case 'REDIRECT_PAYMENT_MANAGEMENT':
        router.push('/payment-management');
        break;
      default:
        break;
    }
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

        {applyButtonState.action === 'OPEN_APPLY_MODAL' ? (
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
                disabled={applyButtonState.disabled}
              >
                {applyButtonState.text}
              </Button>
            }
          />
        ) : (
          <Button
            size="large"
            color="primary"
            className="h-600"
            disabled={applyButtonState.disabled}
            onClick={handleApplyAction}
          >
            {applyButtonState.text}
          </Button>
        )}

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
