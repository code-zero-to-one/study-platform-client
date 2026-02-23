'use client';

import dayjs from 'dayjs';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  getMethodLabel,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import {
  type MentoringRequest,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';

import MentoringRequestDetailCard from './mentoring-request-detail-card';

interface MentoringRequestPanelProps {
  mentorId: number;
  methodDurations: Record<MentoringMethodType, number>;
  initialExpandedId?: string;
  /** 지정 시 해당 id 1건만 표시 */
  filterRequestId?: string;
}

const statusLabelMap = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
} as const;

const statusColorMap = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
} as const;

const getPreferredScheduleText = (request: MentoringRequest) => {
  if (!request.preferredDate) return '수락 후 확인가능';
  if (!request.preferredTime) return request.preferredDate;
  return `${dayjs(request.preferredDate).format('YY. MM. DD.')} ${request.preferredTime}`;
};

export default function MentoringRequestPanel({
  mentorId,
  methodDurations,
  initialExpandedId,
  filterRequestId,
}: MentoringRequestPanelProps) {
  const allRequests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentorId] ?? [],
  );
  const requests = useMemo(
    () =>
      filterRequestId
        ? allRequests.filter((r) => r.id === filterRequestId)
        : allRequests,
    [allRequests, filterRequestId],
  );
  
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'PENDING').length,
    [requests],
  );

  const urgentCount = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.status === 'PENDING' &&
          r.paymentMode === 'MANUAL_TRANSFER' &&
          r.paymentStatus === 'PENDING_TRANSFER',
      ).length,
    [requests],
  );

  // 상세 페이지 모드인 경우
  const isDetailMode = filterRequestId && requests.length === 1;

  return (
    <>
      {/* 긴급 배너 */}
      {urgentCount > 0 && !isDetailMode && (
        <div className="rounded-150 bg-background-accent-orange-subtle mb-200 flex items-center gap-100 px-200 py-125">
          <AlertCircle className="text-text-warning h-16 w-16 shrink-0" />
          <p className="font-designer-14m text-text-warning">
            <span className="font-designer-14b">{urgentCount}건</span>의 새로운 신청이 있어요
          </p>
          <p className="font-designer-14m text-text-subtle ml-auto">
            24시간 내에 수락/거절 되지 않을 때 재신청됩니다. 24시간 내 미승인 시 자동 재신청이 3회 작동하며 이후 자동 삭제됩니다.
          </p>
        </div>
      )}

      {/* 제목 및 안내 (목록 모드에서만) */}
      {!isDetailMode && (
        <div className="mb-100">
          <p className="font-designer-14m text-text-subtle mb-50">
            개별지
          </p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-200 border-border-subtle bg-background-default flex min-h-[360px] flex-col items-center justify-center border px-300 py-[60px] text-center">
          <div className="mb-200">
            <img src="/empty-mentoring.svg" alt="" className="h-[120px] w-[120px]" />
          </div>
          <h2 className="font-designer-18b text-text-default mb-75">
            멘토링 신청 내역이 없어요
          </h2>
          <p className="font-designer-14r text-text-subtle mb-150">
            멘토링 설정을 완료하면 다른 사람이 멘토링을 받을 수 있어요.
          </p>
          <Button color="primary" size="medium">
            멘토링 설정
          </Button>
        </div>
      ) : isDetailMode ? (
        /* 상세 보기 모드 - 단일 카드로 표시 */
        <MentoringRequestDetailCard
          request={requests[0]}
          mentorId={mentorId}
          methodDurations={methodDurations}
        />
      ) : (
        /* 목록 모드 - 테이블로 표시 */
        <div className="rounded-200 border-border-subtle overflow-hidden border bg-background-default">
          {/* 테이블 헤더 */}
          <div className="border-border-subtle grid grid-cols-[120px_200px_1fr_140px] gap-200 border-b bg-background-alternative px-300 py-150">
            <div className="font-designer-14b text-text-default">상태</div>
            <div className="font-designer-14b text-text-default">신청자</div>
            <div className="font-designer-14b text-text-default">멘토링 일정</div>
            <div className="font-designer-14b text-text-default text-right">
              신청 정보
            </div>
          </div>

          {/* 테이블 바디 */}
          <div className="divide-border-subtle divide-y">
            {requests.map((request) => {
              return (
                <div
                  key={request.id}
                  className="hover:bg-background-alternative grid grid-cols-[120px_200px_1fr_140px] gap-200 px-300 py-200 transition-colors"
                >
                  {/* 상태 */}
                  <div className="flex items-start pt-[2px]">
                    <Badge
                      color={statusColorMap[request.status]}
                      shape="round"
                    >
                      {statusLabelMap[request.status]}
                    </Badge>
                  </div>

                  {/* 신청자 */}
                  <div className="flex flex-col gap-50">
                    <p className="font-designer-15b text-text-default">
                      {request.menteeName}
                    </p>
                    <Badge color="blue" shape="round" className="w-fit">
                      {getMethodLabel(request.method)}
                    </Badge>
                    {request.menteeRole && (
                      <p className="font-designer-13r text-text-subtle">
                        {request.menteeRole}
                      </p>
                    )}
                  </div>

                  {/* 멘토링 일정 */}
                  <div className="flex flex-col gap-75">
                    <div className="flex items-center gap-75">
                      <span className="font-designer-13m text-text-subtle">
                        최근본
                      </span>
                      <span className="font-designer-14r text-text-default">
                        {dayjs(request.requestedAt).format('YYYY.MM.DD (ddd)')}
                      </span>
                    </div>
                    <div className="flex items-center gap-75">
                      <span className="font-designer-13m text-text-subtle">
                        수락일
                      </span>
                      <span className="font-designer-14r text-text-default">
                        {getPreferredScheduleText(request)}
                      </span>
                    </div>
                  </div>

                  {/* 신청 정보 버튼 */}
                  <div className="flex items-start justify-end pt-[2px]">
                    <Link href={`/mentoring-management/requests?id=${request.id}`}>
                      <Button size="small" color="outlined">
                        신청 상세
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
