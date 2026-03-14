'use client';

import dayjs from 'dayjs';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import PageContainer from '@/components/common/ui/page-container';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  formatWon,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  getMentoringChannelDisplayKindFromMethod,
  getMentoringChannelDisplayMeta,
} from '@/features/mentoring/model/mentoring-channel-display';
import {
  MENTORING_CHANGE_AND_NO_SHOW_GUIDE,
  MENTORING_REFUND_POLICY_GUIDE,
  getMentoringChannelGuide,
  getMentoringCompletionSteps,
  getMentoringCompletionSummary,
  getMentoringPendingPaymentGuide,
} from '@/features/mentoring/model/mentoring-flow-policy';
import { useMentoringRequestDetailQuery } from '@/features/mentoring/model/use-mentoring-request-detail-query';
import { MENTORING_NOTE_LABEL } from '@/features/mentoring/model/my-mentoring-display-meta';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringChannelGuideContent from '@/features/mentoring/ui/common/mentoring-channel-guide-content';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import { useAuthReady } from '@/hooks/common/use-auth';
import type { MentoringMethodType } from '@/types/mentoring/domain';

interface MentoringPaymentCompletePageClientProps {
  mentorId: number;
  requestId: string;
}

const PAYMENT_METHOD_LABEL = {
  CARD: '카드 결제',
  VIRTUAL_ACCOUNT: '가상계좌',
  MANUAL_TRANSFER: '수동 계좌이체',
} as const;

const getPaymentStatusMeta = (
  paymentStatus: 'PENDING_TRANSFER' | 'NOT_REQUIRED' | 'CONFIRMED',
) => {
  if (paymentStatus === 'CONFIRMED') {
    return {
      label: '결제 완료',
      tone: 'green' as const,
      title: '멘토링 신청이 완료되었어요',
    };
  }

  if (paymentStatus === 'NOT_REQUIRED') {
    return {
      label: '결제 없음',
      tone: 'blue' as const,
      title: '멘토링 신청이 접수되었어요',
    };
  }

  return {
    label: '입금 확인 대기',
    tone: 'orange' as const,
    title: '멘토링 신청이 접수되었어요',
  };
};

function CompletionFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <PageContainer spacing="fallback">
      <SurfacePanel radius="lg" className="px-300 py-500 text-center">
        <h1 className="font-designer-24b text-text-default mb-100">{title}</h1>
        <p className="font-designer-14r text-text-subtle mb-250">
          {description}
        </p>
        <Button asChild color="primary" size="large">
          <Link href="/mentoring">멘토링 목록으로 이동</Link>
        </Button>
      </SurfacePanel>
    </PageContainer>
  );
}

export default function MentoringPaymentCompletePageClient({
  mentorId,
  requestId,
}: MentoringPaymentCompletePageClientProps) {
  const { isHydrated: isAuthHydrated, memberId } = useAuthReady();
  const mentorDirectoryQuery = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });
  const requestDetailQuery = useMentoringRequestDetailQuery(
    requestId,
    isAuthHydrated && Boolean(memberId),
  );

  const mentors = mentorDirectoryQuery.data?.mentors ?? [];
  const mentor = mentors.find((item) => item.id === mentorId);
  const request =
    requestDetailQuery.data?.request &&
    requestDetailQuery.data.request.menteeMemberId === memberId
      ? requestDetailQuery.data.request
      : undefined;
  const paymentAmount = request
    ? typeof request.paymentAmount === 'number'
      ? request.paymentAmount
      : mentor?.methods[request.method]?.price
    : undefined;
  const paymentStatusMeta = request
    ? getPaymentStatusMeta(request.paymentStatus)
    : undefined;

  return (
    <MentoringStateBoundary
      state={
        !isAuthHydrated ||
        mentorDirectoryQuery.isLoading ||
        (memberId ? requestDetailQuery.isLoading : false)
          ? 'loading'
          : memberId
            ? mentorDirectoryQuery.isError || requestDetailQuery.isError
              ? 'error'
              : request
                ? 'ready'
                : 'empty'
            : 'forbidden'
      }
      ready={
        request ? (
          <MentoringPaymentCompletePage
            mentorName={
              request.mentorNickname?.trim() ??
              mentor?.nickname ??
              `멘토 #${mentorId}`
            }
            method={request.method}
            methodLabel={request.methodLabel ?? getMethodLabel(request.method)}
            durationLabel={
              request.durationLabel ??
              mentor?.methods[request.method]?.durationLabel
            }
            paymentMethodLabel={
              PAYMENT_METHOD_LABEL[
                request.paymentMethod ??
                  (request.paymentMode === 'MANUAL_TRANSFER'
                    ? 'MANUAL_TRANSFER'
                    : 'CARD')
              ]
            }
            paymentAmountLabel={
              typeof paymentAmount === 'number' ? formatWon(paymentAmount) : '-'
            }
            preferredScheduleLabel={
              request.method === 'note'
                ? '질문 접수 후 멘토 답장으로 진행'
                : request.preferredDate
                  ? `${dayjs(request.preferredDate).format('YYYY.MM.DD')}${request.preferredTime ? ` ${request.preferredTime}` : ''}`
                  : '상담 방식에 따라 별도 조율'
            }
            isNoteConsultation={request.method === 'note'}
            paymentStatusLabel={paymentStatusMeta?.label ?? '결제 확인 중'}
            paymentStatusTone={paymentStatusMeta?.tone ?? 'orange'}
            completionTitle={
              paymentStatusMeta?.title ?? '멘토링 신청 정보를 확인하고 있어요'
            }
            detailHref={
              request.method === 'note'
                ? `/note-consultation?channel=sent&requestId=${request.id}`
                : `/my-mentoring/${request.id}`
            }
          />
        ) : (
          <div />
        )
      }
      empty={
        <CompletionFallback
          title="신청 완료 정보를 찾을 수 없습니다"
          description="신청 내역이 없거나 상태가 바뀌었습니다. 나의 멘토링에서 확인해주세요."
        />
      }
      forbidden={
        <CompletionFallback
          title="로그인이 필요합니다"
          description="신청 내역은 로그인 후 확인할 수 있습니다."
        />
      }
    />
  );
}

function MentoringPaymentCompletePage({
  mentorName,
  method,
  methodLabel,
  durationLabel,
  paymentMethodLabel,
  paymentAmountLabel,
  preferredScheduleLabel,
  isNoteConsultation,
  paymentStatusLabel,
  paymentStatusTone,
  completionTitle,
  detailHref,
}: {
  mentorName: string;
  method: MentoringMethodType;
  methodLabel: string;
  durationLabel?: string;
  paymentMethodLabel: string;
  paymentAmountLabel: string;
  preferredScheduleLabel: string;
  isNoteConsultation: boolean;
  paymentStatusLabel: string;
  paymentStatusTone: 'green' | 'orange' | 'blue';
  completionTitle: string;
  detailHref: string;
}) {
  const channelGuideMeta = getMentoringChannelDisplayMeta({
    kind: getMentoringChannelDisplayKindFromMethod(method),
    guide: getMentoringChannelGuide(method),
  });
  const defaultStatusDescription = getMentoringCompletionSummary(method);
  const nextSteps = getMentoringCompletionSteps(method);
  const isPaymentPending = paymentStatusTone === 'orange';
  const progressBadgeLabel = isPaymentPending
    ? '입금 확인 후 진행'
    : isNoteConsultation
      ? '첫 답변 대기'
      : '멘토 확인 대기';
  const requestOverviewLabel = isNoteConsultation
    ? '상담 시작'
    : method === 'offline'
      ? '희망 일정/장소'
      : '희망 일정';
  const requestOverviewValue = isNoteConsultation
    ? '멘토 첫 답변이 도착하면 이 상담방에서 내용을 확인할 수 있습니다.'
    : method === 'offline'
      ? `${preferredScheduleLabel} · 장소는 멘토 확인 후 안내됩니다.`
      : preferredScheduleLabel;
  const statusDescription = isPaymentPending
    ? getMentoringPendingPaymentGuide(method)
    : defaultStatusDescription;
  const primaryActionLabel = isPaymentPending
    ? isNoteConsultation
      ? '쪽지상담 상태 보기'
      : '신청 상태 보기'
    : isNoteConsultation
      ? `${MENTORING_NOTE_LABEL}으로 이동`
      : '신청 내역 보기';
  const secondaryActionHref = isPaymentPending
    ? '/my-mentoring'
    : isNoteConsultation
      ? '/my-mentoring'
      : '/my-mentoring';
  const secondaryActionLabel = isPaymentPending
    ? '나의 멘토링으로 이동'
    : isNoteConsultation
      ? '나의 멘토링 허브'
      : '나의 멘토링으로 이동';

  return (
    <PageContainer spacing="content" className="max-w-[960px]">
      <div className="space-y-250">
        <SurfacePanel radius="lg" overflow="hidden">
          <div className="bg-fill-success-subtle-default px-250 py-250">
            <div className="mb-125 flex items-center gap-100">
              <CheckCircle2 className="text-text-success h-24 w-24" />
              <h1 className="font-designer-28b text-text-default">
                {completionTitle}
              </h1>
            </div>
            <p className="font-designer-14r text-text-subtle leading-relaxed">
              {statusDescription}
            </p>
          </div>

          <div className="space-y-200 px-250 py-250">
            <div className="flex flex-wrap items-center gap-75">
              <Badge color={paymentStatusTone} shape="round">
                {paymentStatusLabel}
              </Badge>
              <Badge color="blue" shape="round">
                {methodLabel}
              </Badge>
              <Badge color="orange" shape="round">
                {progressBadgeLabel}
              </Badge>
            </div>

            <div className="rounded-150 bg-background-alternative p-175">
              <div className="space-y-125">
                <CompletionDetailRow label="멘토">{mentorName}</CompletionDetailRow>
                <CompletionDetailRow label="상담 방식">
                  {durationLabel
                    ? `${methodLabel} · ${durationLabel}`
                    : methodLabel}
                </CompletionDetailRow>
                <CompletionDetailRow label="결제 수단">
                  {paymentMethodLabel}
                </CompletionDetailRow>
                <CompletionDetailRow label="결제 금액" emphasize>
                  {paymentAmountLabel}
                </CompletionDetailRow>
                <CompletionDetailRow label={requestOverviewLabel} multiline>
                  {requestOverviewValue}
                </CompletionDetailRow>
                <CompletionDetailRow
                  label="진행 채널"
                  multiline
                >
                  <MentoringChannelGuideContent
                    description={channelGuideMeta.description}
                    actionHref={channelGuideMeta.actionHref}
                    actionLabel={channelGuideMeta.actionLabel}
                  />
                </CompletionDetailRow>
              </div>
            </div>

            {isPaymentPending ? (
              <div className="rounded-150 border-border-subtle bg-background-accent-orange-subtle border px-150 py-125">
                <p className="font-designer-13b text-text-default">
                  입금 확인이 끝난 뒤 다음 단계가 열립니다.
                </p>
                <p className="font-designer-12r text-text-subtle mt-25 leading-relaxed">
                  {statusDescription}
                </p>
              </div>
            ) : null}
          </div>
        </SurfacePanel>

        <SurfacePanel radius="lg" className="p-250">
          <div className="mb-150 flex items-center gap-75">
            <CalendarClock className="text-text-brand h-18 w-18" />
            <h2 className="font-designer-18b text-text-default">다음 단계</h2>
          </div>
          <div className="space-y-125">
            {nextSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-100">
                <div className="bg-fill-brand-subtle-default text-text-brand font-designer-13b flex h-24 w-24 shrink-0 items-center justify-center rounded-full">
                  {index + 1}
                </div>
                <p className="font-designer-14r text-text-default leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </SurfacePanel>

        <SurfacePanel radius="lg" className="p-250">
          <h2 className="font-designer-18b text-text-default mb-75">
            바로 할 수 있는 일
          </h2>
          <p className="font-designer-13r text-text-subtle mb-150 leading-relaxed">
            신청 직후 자주 확인하는 화면만 아래에 모았습니다.
          </p>
          <div className="space-y-100">
            <Button asChild color="primary" size="large" className="w-full">
              <Link href={detailHref}>{primaryActionLabel}</Link>
            </Button>
            <Button asChild color="outlined" size="large" className="w-full">
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
            <Button asChild color="outlined" size="large" className="w-full">
              <Link href="/mentoring">멘토링 더 보기</Link>
            </Button>
          </div>
        </SurfacePanel>

        <SurfacePanel radius="lg" className="p-225">
          <h2 className="font-designer-16b text-text-default mb-100">
            변경/취소 안내
          </h2>
          <div className="space-y-75">
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              {MENTORING_REFUND_POLICY_GUIDE}
            </p>
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              {MENTORING_CHANGE_AND_NO_SHOW_GUIDE}
            </p>
          </div>
        </SurfacePanel>
      </div>
    </PageContainer>
  );
}

function CompletionDetailRow({
  label,
  children,
  multiline = false,
  emphasize = false,
}: {
  label: string;
  children: ReactNode;
  multiline?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="border-border-subtle flex flex-col gap-50 border-b pb-125 last:border-b-0 last:pb-0 md:flex-row md:items-start md:justify-between md:gap-150">
      <p className="font-designer-12m text-text-subtle shrink-0 md:w-[120px]">
        {label}
      </p>
      <div
        className={
          multiline
            ? 'font-designer-14r text-text-default leading-relaxed whitespace-pre-line'
            : emphasize
              ? 'font-designer-18b text-text-default leading-relaxed whitespace-pre-line'
              : 'font-designer-16b text-text-default leading-relaxed whitespace-pre-line'
        }
      >
        {children}
      </div>
    </div>
  );
}
