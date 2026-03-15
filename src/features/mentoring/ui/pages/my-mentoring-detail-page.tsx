import { ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SectionShell from '@/components/common/ui/section-shell';
import {
  getMyMentoringStatusGuide,
  getMentoringIssuePlaybook,
  MENTORING_CHANGE_AND_NO_SHOW_GUIDE,
  MENTORING_REFUND_POLICY_DETAIL,
  MENTORING_REFUND_POLICY_GUIDE,
} from '@/features/mentoring/model/mentoring-flow-policy';
import {
  getMyMentoringSecondaryActionMeta,
  MENTORING_SESSION_GUIDE_LABEL,
  MY_MENTORING_METHOD_LABEL_MAP,
  MY_MENTORING_STATUS_META,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import type {
  MyMentoringItem,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';

const TEXT = {
  back: '나의 멘토링',
  mentor: '멘토',
  requestedAt: '신청일',
  statusUpdatedAt: '처리 기준',
  requestedPreferredSchedule: '신청 당시 희망 일정',
  sessionGuide: MENTORING_SESSION_GUIDE_LABEL,
  detailTitle: '멘토링 상세',
  paymentInfoTitle: '결제 정보',
  changePolicyTitle: '변경/취소 안내',
  requestInfoTitle: '신청 정보',
  paymentMethod: '결제 방식',
  paymentAmount: '결제 금액',
  paymentStatus: '결제 상태',
  progressStatus: '진행 상태',
  issueStatus: '운영 상태',
  refundStatus: '환불 상태',
  memoTitle: '멘토에게 전달한 내용',
  operationTitle: '운영 기록',
  currentPriorityTitle: '지금 먼저 할 일',
  nextStepsTitle: '다음으로 확인할 것',
  actionSectionTitle: '다음 행동',
  requestedTitle: '멘토가 신청 내용을 확인하고 있습니다.',
  pendingTitle: '일정 조율이 진행 중입니다.',
  confirmedTitle: '일정이 확정되었습니다.',
  completedTitle: '상담이 완료되었습니다.',
  noShowTitle: '노쇼 처리 결과가 등록되었습니다.',
  cancelledTitle: '확정된 일정이 취소되었습니다.',
  rejectedTitle: '신청이 거절되었습니다.',
  requestedFallback: '희망 일정 미입력',
  pendingFallback: '조율안 대기',
  confirmedFallback: '확정 일정 미입력',
  completedFallback: '진행 일정 기록 없음',
  noShowFallback: '처리 일정 기록 없음',
  cancelledFallback: '취소 일정 기록 없음',
  rejectedFallback: '희망 일정 미입력',
  sessionGuideFallback: '아직 안내 없음',
  rejectedReason: '거절 사유',
  cancelledReason: '취소 사유',
  completedReason: '진행 메모',
  noShowReason: '운영 메모',
};

const getImmediateActionCard = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'REQUESTED') {
    return {
      tone: 'orange' as const,
      title: '멘토 확인 결과를 먼저 기다리세요.',
      body: '보통 24시간 안에 확인이 시작됩니다. 수락/거절 결과는 알림함에서 먼저 확인하는 편이 가장 빠릅니다.',
    };
  }

  if (mentoring.status === 'PENDING') {
    return {
      tone: 'orange' as const,
      title: '멘토가 보낸 확정안이 있는지 확인하세요.',
      body: '시간, 진행 채널, 장소 제안은 이 화면과 알림함에 함께 반영됩니다. 조율 중이면 자주 열람하는 편이 안전합니다.',
    };
  }

  if (mentoring.status === 'CONFIRMED') {
    return {
      tone: 'green' as const,
      title: '확정 시간과 진행 채널 또는 장소를 다시 확인하세요.',
      body: mentoring.sessionGuide
        ? `현재 안내 기준: ${mentoring.sessionGuide}`
        : '진행 채널 또는 장소 안내가 비어 있다면 상담 전에 멘토 공지를 다시 확인하세요.',
    };
  }

  if (mentoring.status === 'COMPLETED') {
    return {
      tone: 'blue' as const,
      title: '후기와 다음 액션을 정리할 타이밍입니다.',
      body: '상담 직후일수록 후기 작성과 다음 액션 정리가 훨씬 쉽습니다.',
    };
  }

  if (mentoring.status === 'NO_SHOW' || mentoring.status === 'CANCELLED') {
    if (mentoring.refundStatus === 'PENDING') {
      return {
        tone: 'red' as const,
        title: '환불 진행 여부를 먼저 확인하세요.',
        body: '후속 안내는 알림함과 운영 기록에 같이 남습니다. 환불 완료 전에는 상태 확인을 우선하는 편이 안전합니다.',
      };
    }

    return {
      tone: 'orange' as const,
      title: '같은 주제가 급하면 재신청 여부를 결정하세요.',
      body: '취소 또는 노쇼 처리 결과를 확인한 뒤, 같은 멘토/같은 방식으로 다시 신청할지 판단하면 됩니다.',
    };
  }

  return {
    tone: 'red' as const,
    title: '거절 사유를 확인한 뒤 질문 범위를 다듬어 보세요.',
    body: '같은 주제가 급하면 다른 멘토를 비교해 바로 다시 신청하는 편이 빠릅니다.',
  };
};

const getNextSteps = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'REQUESTED') {
    return [
      '보통 24시간 안에 멘토 확인이 시작됩니다.',
      '수락/거절 결과는 알림함에서 먼저 확인하세요.',
    ];
  }

  if (mentoring.status === 'PENDING') {
    return [
      '멘토가 보낸 시간, 진행 채널, 장소 제안을 먼저 확인하세요.',
      '확정 결과는 알림과 이 화면에 함께 반영됩니다.',
    ];
  }

  if (mentoring.status === 'CONFIRMED') {
    return [
      '상담 전날에 확정 시간과 진행 채널 또는 장소를 다시 확인하세요.',
      '직전 변경이나 취소가 생기면 알림과 운영 기록에 함께 남습니다.',
    ];
  }

  if (mentoring.status === 'COMPLETED') {
    return [
      '상담 내용이 기억날 때 후기와 다음 액션을 정리해두는 편이 좋습니다.',
      '필요하면 같은 멘토에게 다른 방식의 상담을 다시 신청할 수 있습니다.',
    ];
  }

  if (mentoring.status === 'NO_SHOW') {
    if (mentoring.issueType === 'MENTOR_NO_SHOW') {
      return [
        '멘토 미입장 처리 결과와 환불 또는 재예약 안내를 먼저 확인하세요.',
        '후속 안내는 알림함과 운영 기록에 함께 반영됩니다.',
      ];
    }

    return [
      '노쇼 처리 결과를 확인한 뒤, 같은 상담이 필요하면 새로 신청하세요.',
      '환불 불가 또는 재예약 기준은 운영 기록과 알림을 함께 확인하세요.',
    ];
  }

  if (mentoring.status === 'CANCELLED') {
    if (mentoring.issueType === 'MENTOR_CANCELLED') {
      return [
        '멘토 취소 사유와 환불 상태를 먼저 확인하세요.',
        '같은 주제가 급하면 다른 멘토 또는 다른 일정으로 다시 신청하는 편이 안전합니다.',
      ];
    }

    return [
      '취소 처리 결과와 환불 기준을 먼저 확인하세요.',
      '다시 진행하려면 원하는 일정으로 새 신청을 넣는 편이 가장 빠릅니다.',
    ];
  }

  return [
    '거절 사유를 확인한 뒤, 상담 방식이나 질문 범위를 다듬어 다시 신청하세요.',
    '같은 주제가 급하면 다른 멘토를 비교해 바로 재신청할 수 있습니다.',
  ];
};

interface MyMentoringDetailPageProps {
  mentoring: MyMentoringItem;
}

const getStatusTitle = (status: MyMentoringStatus) => {
  if (status === 'REQUESTED') {
    return TEXT.requestedTitle;
  }

  if (status === 'PENDING') {
    return TEXT.pendingTitle;
  }

  if (status === 'CONFIRMED') {
    return TEXT.confirmedTitle;
  }

  if (status === 'COMPLETED') {
    return TEXT.completedTitle;
  }

  if (status === 'NO_SHOW') {
    return TEXT.noShowTitle;
  }

  if (status === 'CANCELLED') {
    return TEXT.cancelledTitle;
  }

  return TEXT.rejectedTitle;
};

const getScheduleLabel = (status: MyMentoringStatus) => {
  if (status === 'CONFIRMED') {
    return '확정 일정';
  }

  if (status === 'PENDING') {
    return '조율 예정 시간';
  }

  if (status === 'COMPLETED') {
    return '진행한 일정';
  }

  if (status === 'NO_SHOW') {
    return '처리된 일정';
  }

  if (status === 'CANCELLED') {
    return '취소된 일정';
  }

  return '희망 일정';
};

const getScheduleText = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'CONFIRMED') {
    return mentoring.mentoringTime ?? TEXT.confirmedFallback;
  }

  if (mentoring.status === 'PENDING') {
    return mentoring.pendingWindow ?? TEXT.pendingFallback;
  }

  if (mentoring.status === 'COMPLETED') {
    return mentoring.mentoringTime ?? TEXT.completedFallback;
  }

  if (mentoring.status === 'NO_SHOW') {
    return mentoring.mentoringTime ?? TEXT.noShowFallback;
  }

  if (mentoring.status === 'CANCELLED') {
    return mentoring.mentoringTime ?? TEXT.cancelledFallback;
  }

  if (mentoring.status === 'REJECTED') {
    return mentoring.preferredWindow ?? TEXT.rejectedFallback;
  }

  return mentoring.pendingWindow ?? TEXT.requestedFallback;
};

const getReasonTitle = (status: MyMentoringStatus) => {
  if (status === 'REJECTED') {
    return TEXT.rejectedReason;
  }

  if (status === 'CANCELLED') {
    return TEXT.cancelledReason;
  }

  if (status === 'NO_SHOW') {
    return TEXT.noShowReason;
  }

  if (status === 'COMPLETED') {
    return TEXT.completedReason;
  }

  return null;
};

const getPrimaryAction = (mentoring: MyMentoringItem) => {
  return {
    href: mentoring.nextActionHref,
    label: mentoring.nextActionLabel,
    color: 'primary' as const,
  };
};

const getSecondaryAction = (mentoring: MyMentoringItem) => {
  const action = getMyMentoringSecondaryActionMeta(mentoring);

  return {
    href: action.href,
    label: action.label,
    color: 'outlined' as const,
  };
};

const getActionDescriptions = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'REQUESTED') {
    return {
      primary: '수락 또는 거절 결과가 먼저 반영되는 곳입니다.',
      secondary:
        '기다리는 동안 멘토 프로필과 상담 방식만 다시 확인해두면 충분합니다.',
    };
  }

  if (mentoring.status === 'PENDING') {
    return {
      primary:
        '멘토가 보낸 조율안이나 확정 결과를 가장 빨리 확인할 수 있습니다.',
      secondary: '준비물과 상담 기대치를 다시 맞출 때만 멘토 프로필을 보세요.',
    };
  }

  if (mentoring.status === 'CONFIRMED') {
    return {
      primary: '직전 변경이나 링크 안내는 알림함에서 가장 먼저 갱신됩니다.',
      secondary: '준비물과 상담 스타일을 다시 복기할 때 유용합니다.',
    };
  }

  if (mentoring.status === 'COMPLETED') {
    return {
      primary: '상담 직후에 남기는 후기가 가장 정확합니다.',
      secondary:
        '같은 흐름을 이어가고 싶다면 바로 다시 신청하는 편이 빠릅니다.',
    };
  }

  if (mentoring.status === 'NO_SHOW') {
    return mentoring.refundStatus === 'PENDING'
      ? {
          primary: '환불 또는 후속 안내가 먼저 오는 곳입니다.',
          secondary:
            '정리가 끝난 뒤에는 다른 멘토 후보를 바로 비교할 수 있습니다.',
        }
      : {
          primary: '같은 주제가 급하면 같은 방식으로 바로 다시 신청하세요.',
          secondary:
            '다른 멘토 후보를 같이 보고 싶다면 목록으로 돌아가면 됩니다.',
        };
  }

  if (mentoring.status === 'CANCELLED') {
    return mentoring.refundStatus === 'PENDING'
      ? {
          primary:
            '취소 후속과 환불 진행은 알림 기준으로 먼저 확인하는 편이 안전합니다.',
          secondary: '다음 후보를 비교하고 싶다면 멘토 목록으로 돌아가세요.',
        }
      : {
          primary:
            '같은 멘토와 다시 진행할 생각이면 같은 방식으로 재신청하는 편이 가장 빠릅니다.',
          secondary: '다른 멘토도 같이 비교하려면 멘토 목록으로 돌아가세요.',
        };
  }

  return {
    primary: '다른 멘토를 바로 비교해 새로 신청하는 편이 빠릅니다.',
    secondary: '같은 멘토를 다시 볼 필요가 있을 때만 프로필을 확인하세요.',
  };
};

export default function MyMentoringDetailPage({
  mentoring,
}: MyMentoringDetailPageProps) {
  const immediateAction = getImmediateActionCard(mentoring);
  const nextUpdateText = getMyMentoringStatusGuide(mentoring.status);
  const scheduleText = getScheduleText(mentoring);
  const scheduleLabel = getScheduleLabel(mentoring.status);
  const sessionGuideText =
    mentoring.sessionGuide ??
    (mentoring.status === 'PENDING' || mentoring.status === 'CONFIRMED'
      ? TEXT.sessionGuideFallback
      : undefined);
  const reasonTitle = getReasonTitle(mentoring.status);
  const primaryAction = getPrimaryAction(mentoring);
  const secondaryAction = getSecondaryAction(mentoring);
  const actionDescriptions = getActionDescriptions(mentoring);
  const nextSteps = getNextSteps(mentoring);
  const issuePlaybook = getMentoringIssuePlaybook({
    viewer: 'mentee',
    issueType: mentoring.issueType,
    refundStatus: mentoring.refundStatus,
  });
  const shouldShowOperationGuide =
    mentoring.status === 'CONFIRMED' ||
    mentoring.status === 'CANCELLED' ||
    mentoring.status === 'NO_SHOW';
  const shouldShowRequestedScheduleComparison =
    mentoring.status === 'CONFIRMED' &&
    mentoring.preferredWindow !== undefined &&
    mentoring.preferredWindow !== '' &&
    mentoring.preferredWindow !== mentoring.mentoringTime;

  return (
    <SectionShell className="gap-300">
      <Link
        href="/my-mentoring"
        className="font-designer-14m text-text-subtle hover:text-text-default inline-flex w-fit items-center gap-75 transition-colors"
      >
        <ArrowLeft className="h-14 w-14" />
        {TEXT.back}
      </Link>

      <div className="flex items-center gap-100">
        <ClipboardList className="text-text-brand h-24 w-24" />
        <h1 className="font-designer-24b text-text-default">
          {TEXT.detailTitle}
        </h1>
      </div>

      <div className="rounded-200 border-border-subtle bg-background-default overflow-hidden border shadow-sm">
        <div className="border-border-subtle bg-background-alternative border-b px-300 py-200">
          <div className="mb-75 flex flex-wrap items-center gap-75">
            <Badge color="blue" shape="round">
              {MY_MENTORING_METHOD_LABEL_MAP[mentoring.method]}
            </Badge>
            <Badge
              color={MY_MENTORING_STATUS_META[mentoring.status].color}
              shape="round"
            >
              {MY_MENTORING_STATUS_META[mentoring.status].label}
            </Badge>
            <Badge color={mentoring.paymentStatusTone} shape="round">
              {mentoring.paymentStatusLabel}
            </Badge>
            {mentoring.issueStatusLabel && mentoring.issueStatusTone ? (
              <Badge color={mentoring.issueStatusTone} shape="round">
                {mentoring.issueStatusLabel}
              </Badge>
            ) : null}
            {mentoring.refundStatusLabel && mentoring.refundStatusTone ? (
              <Badge color={mentoring.refundStatusTone} shape="round">
                {mentoring.refundStatusLabel}
              </Badge>
            ) : null}
          </div>
          <p className="font-designer-14b text-text-default">
            {getStatusTitle(mentoring.status)}
          </p>
          <p className="font-designer-13r text-text-subtle mt-50">
            {nextUpdateText}
          </p>
        </div>

        <div className="space-y-300 px-300 py-300">
          <section>
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.currentPriorityTitle}
            </h2>
            <div
              className={`rounded-150 border px-200 py-150 ${
                immediateAction.tone === 'red'
                  ? 'border-border-error bg-background-accent-red-subtle'
                  : immediateAction.tone === 'orange'
                    ? 'border-border-warning bg-background-accent-orange-subtle'
                    : immediateAction.tone === 'green'
                      ? 'border-border-success bg-background-accent-green-subtle'
                      : 'border-border-information bg-background-accent-blue-subtle'
              }`}
            >
              <p className="font-designer-14b text-text-default">
                {immediateAction.title}
              </p>
              <p className="font-designer-13r text-text-subtle mt-50 leading-relaxed">
                {immediateAction.body}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.requestInfoTitle}
            </h2>

            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border">
              <InfoRow label={TEXT.mentor}>{mentoring.mentorName}</InfoRow>
              <InfoRow label={TEXT.requestedAt}>
                {mentoring.requestedAt}
              </InfoRow>
              {mentoring.historyDateLabel ? (
                <InfoRow label={TEXT.statusUpdatedAt}>
                  {mentoring.historyDateLabel}
                </InfoRow>
              ) : null}
              {shouldShowRequestedScheduleComparison ? (
                <InfoRow label={TEXT.requestedPreferredSchedule}>
                  {mentoring.preferredWindow}
                </InfoRow>
              ) : null}
              <InfoRow label={scheduleLabel}>{scheduleText}</InfoRow>
              {sessionGuideText ? (
                <InfoRow label={TEXT.sessionGuide}>{sessionGuideText}</InfoRow>
              ) : null}
            </div>
          </section>

          {reasonTitle && mentoring.statusReason ? (
            <section>
              <h2 className="font-designer-16b text-text-default mb-150">
                {reasonTitle}
              </h2>
              <p className="font-designer-14r rounded-150 border-border-subtle bg-background-alternative text-text-default min-h-[96px] border px-150 py-125 leading-relaxed whitespace-pre-line">
                {mentoring.statusReason}
              </p>
            </section>
          ) : null}

          <section>
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.memoTitle}
            </h2>
            <p className="font-designer-14r rounded-150 border-border-subtle bg-background-alternative text-text-default min-h-[120px] border px-150 py-125 leading-relaxed whitespace-pre-line">
              {mentoring.description}
            </p>
          </section>

          <section>
            <div className="mb-150 flex items-center justify-between gap-100">
              <h2 className="font-designer-16b text-text-default">
                {TEXT.paymentInfoTitle}
              </h2>
              <Badge color={mentoring.paymentStatusTone} shape="round">
                {mentoring.paymentStatusLabel}
              </Badge>
            </div>

            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border px-150">
              <InfoRow label={TEXT.paymentMethod}>
                {mentoring.paymentMethodLabel}
              </InfoRow>
              <InfoRow label={TEXT.paymentAmount}>
                {mentoring.paymentAmountLabel}
              </InfoRow>
              <InfoRow label={TEXT.paymentStatus}>
                {mentoring.paymentStatusLabel}
              </InfoRow>
              {mentoring.issueStatusLabel ? (
                <InfoRow label={TEXT.issueStatus}>
                  {mentoring.issueStatusLabel}
                </InfoRow>
              ) : null}
              {mentoring.refundStatusLabel ? (
                <InfoRow label={TEXT.refundStatus}>
                  {mentoring.refundStatusLabel}
                </InfoRow>
              ) : null}
              <InfoRow label={TEXT.progressStatus}>
                {MY_MENTORING_STATUS_META[mentoring.status].label}
              </InfoRow>
            </div>
          </section>

          {mentoring.refundStatusLabel || mentoring.issueStatusLabel ? (
            <section>
              <h2 className="font-designer-16b text-text-default mb-150">
                {TEXT.operationTitle}
              </h2>
              <div className="rounded-150 border-border-subtle bg-background-alternative space-y-75 border px-150 py-125">
                {mentoring.issueStatusLabel ? (
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    운영 상태: {mentoring.issueStatusLabel}
                  </p>
                ) : null}
                {mentoring.refundStatusLabel ? (
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    환불 상태: {mentoring.refundStatusLabel}
                  </p>
                ) : null}
                {mentoring.refundNote ? (
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    환불 안내: {mentoring.refundNote}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.nextStepsTitle}
            </h2>
            <div className="rounded-150 border-border-subtle bg-background-alternative space-y-100 border px-150 py-125">
              {nextSteps.map((step, index) => (
                <div key={step} className="flex items-start gap-100">
                  <span className="bg-fill-brand-subtle-default text-text-brand font-designer-12b inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
                    {index + 1}
                  </span>
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {shouldShowOperationGuide ? (
            <section>
              <h2 className="font-designer-16b text-text-default mb-150">
                {mentoring.status === 'CONFIRMED'
                  ? TEXT.changePolicyTitle
                  : issuePlaybook.title}
              </h2>
              <div className="rounded-150 border-border-subtle bg-background-alternative space-y-75 border px-150 py-125">
                {issuePlaybook.items.map((item, index) => (
                  <div key={item} className="flex items-start gap-100">
                    <span className="bg-fill-brand-subtle-default text-text-brand font-designer-12b inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
                      {index + 1}
                    </span>
                    <p className="font-designer-13r text-text-subtle leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
                <div className="border-border-subtle space-y-75 border-t pt-100">
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    {MENTORING_REFUND_POLICY_GUIDE}
                  </p>
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    {MENTORING_REFUND_POLICY_DETAIL}
                  </p>
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    {MENTORING_CHANGE_AND_NO_SHOW_GUIDE}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.actionSectionTitle}
            </h2>
            <div className="grid gap-100 md:grid-cols-2">
              <DetailActionCard
                title={primaryAction.label}
                description={actionDescriptions.primary}
                href={primaryAction.href}
                buttonColor={primaryAction.color}
                tone="brand"
              />
              <DetailActionCard
                title={secondaryAction.label}
                description={actionDescriptions.secondary}
                href={secondaryAction.href}
                buttonColor={secondaryAction.color}
                tone="subtle"
              />
            </div>
          </section>
        </div>
      </div>
    </SectionShell>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-200 px-150 py-150">
      <span className="font-designer-14m text-text-subtle w-[100px] shrink-0">
        {label}
      </span>
      <div className="font-designer-14r text-text-default flex-1">
        {children}
      </div>
    </div>
  );
}

function DetailActionCard({
  title,
  description,
  href,
  buttonColor,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  buttonColor: 'primary' | 'outlined';
  tone: 'brand' | 'subtle';
}) {
  return (
    <div
      className={`rounded-150 border px-150 py-150 ${
        tone === 'brand'
          ? 'border-border-brand bg-background-accent-blue-subtle'
          : 'border-border-subtle bg-background-alternative'
      }`}
    >
      <p
        className={`font-designer-13m ${
          tone === 'brand' ? 'text-text-brand' : 'text-text-subtle'
        }`}
      >
        {title}
      </p>
      <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
        {description}
      </p>
      <Link href={href} className="mt-125 block">
        <Button size="medium" color={buttonColor} className="w-full">
          {title}
        </Button>
      </Link>
    </div>
  );
}
