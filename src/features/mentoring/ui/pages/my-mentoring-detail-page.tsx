import { ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SectionShell from '@/components/common/ui/section-shell';
import {
  getMyMentoringStatusGuide,
  MENTORING_DEFAULT_CHANNEL_GUIDE,
  MENTORING_PROGRESS_CHECK_GUIDE,
} from '@/features/mentoring/model/mentoring-flow-policy';
import type {
  MyMentoringItem,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';

const METHOD_LABEL: Record<'ONLINE' | 'OFFLINE' | 'CALL', string> = {
  ONLINE: '심층상담',
  OFFLINE: '대면상담',
  CALL: '간편상담',
};

const STATUS_META: Record<
  MyMentoringStatus,
  { label: string; color: 'green' | 'orange' }
> = {
  REQUESTED: { label: '멘토 확인 대기', color: 'orange' },
  CONFIRMED: { label: '일정 확정', color: 'green' },
  PENDING: { label: '일정 조율 중', color: 'orange' },
};

const TEXT = {
  back: '나의 멘토링',
  mentor: '멘토',
  preferredSchedule: '희망 일정',
  confirmedSchedule: '확정 일정',
  requestedAt: '신청일',
  requestedTitle: '멘토가 신청 내용을 확인하고 있습니다.',
  requestedDescription:
    '결제는 완료되었고, 보통 24시간 안에 멘토 확인이 시작됩니다.',
  pendingTitle: '일정 조율이 진행 중입니다.',
  pendingDescription:
    '멘토가 보낸 조율안이나 확정 결과를 알림으로 바로 확인할 수 있어요.',
  pendingWindow: '조율 예정',
  pendingFallback: '멘토와 시간 조율 중',
  requestInfoTitle: '멘토링 요청 정보',
  paymentInfoTitle: '결제 정보',
  paymentMethod: '결제 방식',
  paymentAmount: '결제 금액',
  paymentStatus: '결제 상태',
  progressStatus: '진행 상태',
  nextUpdate: '다음 안내',
  requestMessage: '요청 메시지',
  memoTitle: '멘토링 요청 메모',
  detailTitle: '멘토링 상세',
  detailDescription:
    '신청한 멘토링 정보를 확인하고 진행 상태를 한 눈에 볼 수 있어요.',
  moveToList: '목록으로',
  moveToMentoring: '멘토링 목록',
  guideTitle: '멘토링 안내',
  requestedFooterFirst:
    '멘토가 신청 내용을 확인하면 일정 조율 단계로 넘어갑니다.',
  requestedFooterSecond:
    '알림을 켜두면 수락/조율 요청을 바로 확인할 수 있습니다.',
  pendingFooterFirst: '일정 확정 전까지는 멘토 조율 요청 상태로 표시됩니다.',
  pendingFooterSecond:
    '확정 후 알림에서 최종 시간과 진행 방식을 확인할 수 있습니다.',
};

interface MyMentoringDetailPageProps {
  mentoring: MyMentoringItem;
}

export default function MyMentoringDetailPage({
  mentoring,
}: MyMentoringDetailPageProps) {
  const pendingTitle =
    mentoring.status === 'REQUESTED' ? TEXT.requestedTitle : TEXT.pendingTitle;
  const pendingDescription =
    mentoring.status === 'REQUESTED'
      ? TEXT.requestedDescription
      : TEXT.pendingDescription;
  const nextUpdateText = getMyMentoringStatusGuide(mentoring.status);
  const scheduleText =
    mentoring.status === 'CONFIRMED'
      ? (mentoring.mentoringTime ?? '-')
      : mentoring.pendingWindow
        ? `${TEXT.pendingWindow}: ${mentoring.pendingWindow}`
        : TEXT.pendingFallback;
  const guideLines = [
    MENTORING_DEFAULT_CHANNEL_GUIDE,
    nextUpdateText,
    MENTORING_PROGRESS_CHECK_GUIDE,
  ];

  return (
    <SectionShell className="gap-300">
      <Link
        href="/my-mentoring"
        className="font-designer-14m text-text-subtle hover:text-text-default inline-flex w-fit items-center gap-75 transition-colors"
      >
        <ArrowLeft className="h-14 w-14" />
        {TEXT.back}
      </Link>

      <div className="text-center">
        <div className="mb-100 inline-flex items-center gap-100">
          <ClipboardList className="text-text-brand h-24 w-24" />
          <h1 className="font-designer-24b text-text-default">
            {TEXT.detailTitle}
          </h1>
        </div>
        <p className="font-designer-14r text-text-subtle">
          {TEXT.detailDescription}
        </p>
      </div>

      <div className="rounded-200 border-border-subtle bg-background-default overflow-hidden border shadow-sm">
        {mentoring.status !== 'CONFIRMED' && (
          <div className="bg-background-accent-orange-subtle px-300 py-150">
            <p className="font-designer-14m text-background-accent-orange-strong">
              {pendingTitle}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              {pendingDescription}
            </p>
          </div>
        )}

        <div className="px-300 py-300">
          <section className="mb-300">
            <div className="mb-150 flex items-center justify-between gap-100">
              <h2 className="font-designer-16b text-text-default">
                {TEXT.requestInfoTitle}
              </h2>
              <div className="flex shrink-0 items-center gap-50">
                <Badge color="blue" shape="round">
                  {METHOD_LABEL[mentoring.method]}
                </Badge>
                <Badge
                  color={STATUS_META[mentoring.status].color}
                  shape="round"
                >
                  {STATUS_META[mentoring.status].label}
                </Badge>
              </div>
            </div>

            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border">
              <InfoRow label={TEXT.requestMessage}>{mentoring.title}</InfoRow>
              <InfoRow label={TEXT.mentor}>{mentoring.mentorName}</InfoRow>
              <InfoRow label={TEXT.requestedAt}>
                {mentoring.requestedAt}
              </InfoRow>
              <InfoRow label={TEXT.preferredSchedule}>{scheduleText}</InfoRow>
              <InfoRow label={TEXT.confirmedSchedule}>
                {mentoring.mentoringTime ?? '-'}
              </InfoRow>
            </div>
          </section>

          <section className="mb-300">
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.memoTitle}
            </h2>
            <p className="font-designer-14r rounded-150 border-border-subtle bg-background-alternative text-text-default min-h-[120px] border px-150 py-125">
              {mentoring.description}
            </p>
          </section>

          <section className="mb-300">
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
              <InfoRow label={TEXT.progressStatus}>
                {STATUS_META[mentoring.status].label}
              </InfoRow>
              <InfoRow label={TEXT.nextUpdate}>{nextUpdateText}</InfoRow>
            </div>
          </section>

          <section className="mb-300">
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.guideTitle}
            </h2>
            <ul className="font-designer-14r text-text-subtle rounded-150 bg-background-alternative space-y-75 p-200">
              {guideLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          {mentoring.status !== 'CONFIRMED' && (
            <section>
              <div className="flex gap-100">
                <Link href="/my-mentoring" className="flex-1">
                  <Button size="medium" color="outlined" className="w-full">
                    {TEXT.moveToList}
                  </Button>
                </Link>
                <Link href="/mentoring" className="flex-1">
                  <Button size="medium" color="primary" className="w-full">
                    {TEXT.moveToMentoring}
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>

        {mentoring.status !== 'CONFIRMED' && (
          <div className="border-border-subtle bg-background-alternative border-t px-300 py-150 text-center">
            <p className="font-designer-13r text-text-subtlest">
              {mentoring.status === 'REQUESTED'
                ? TEXT.requestedFooterFirst
                : TEXT.pendingFooterFirst}
              <br />
              {mentoring.status === 'REQUESTED'
                ? TEXT.requestedFooterSecond
                : TEXT.pendingFooterSecond}
            </p>
          </div>
        )}
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
