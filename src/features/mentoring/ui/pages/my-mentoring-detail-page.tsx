import { ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SectionShell from '@/components/ui/section-shell';
import type {
  MyMentoringMockItem,
  MyMentoringStatus,
} from '@/mocks/my-mentoring-mock-data';

const METHOD_LABEL: Record<'ONLINE' | 'OFFLINE' | 'CALL', string> = {
  ONLINE: '심층상담',
  OFFLINE: '대면상담',
  CALL: '간편상담',
};

const STATUS_META: Record<
  MyMentoringStatus,
  { label: string; color: 'green' | 'orange' }
> = {
  CONFIRMED: { label: '일정 확정', color: 'green' },
  PENDING: { label: '일정 미확정', color: 'orange' },
};

const PAYMENT_META: Record<
  MyMentoringStatus,
  { label: string; color: 'green' | 'orange' }
> = {
  CONFIRMED: { label: '결제 완료', color: 'green' },
  PENDING: { label: '결제 대기', color: 'orange' },
};

const TEXT = {
  back: '나의 멘토링',
  mentor: '멘토',
  preferredSchedule: '희망 일정',
  confirmedSchedule: '확정 일정',
  requestedAt: '신청일',
  pendingTitle: '일정이 아직 미확정 상태입니다.',
  pendingDescription:
    '멘토와 조율이 완료되면 알림을 통해 확정 시간을 안내해드려요.',
  pendingWindow: '조율 예정',
  pendingFallback: '멘토와 시간 조율 중',
  requestInfoTitle: '멘토링 요청 정보',
  paymentInfoTitle: '결제 정보',
  paymentMethod: '결제 방식',
  paymentAmount: '결제 금액',
  paymentStatus: '결제 상태',
  paymentMethodValue: '카드 결제',
  paymentAmountValue: '33,000원',
  requestMessage: '요청 메시지',
  memoTitle: '멘토링 메모',
  detailTitle: '멘토링 상세',
  detailDescription:
    '신청한 멘토링 정보를 확인하고 진행 상태를 한 눈에 볼 수 있어요.',
  moveToNoteConsultation: '쪽지상담 이동',
  moveToList: '목록으로',
  guideTitle: '멘토링 안내',
  pendingFooterFirst: '일정 확정 전까지는 멘토 조율 요청 상태로 표시됩니다.',
  pendingFooterSecond:
    '확정 후 알림에서 최종 시간과 진행 방식을 확인할 수 있습니다.',
};

interface MyMentoringDetailPageProps {
  mentoring: MyMentoringMockItem;
}

export default function MyMentoringDetailPage({
  mentoring,
}: MyMentoringDetailPageProps) {
  const scheduleText =
    mentoring.status === 'CONFIRMED'
      ? (mentoring.mentoringTime ?? '-')
      : mentoring.pendingWindow
        ? `${TEXT.pendingWindow}: ${mentoring.pendingWindow}`
        : TEXT.pendingFallback;

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
        {mentoring.status === 'PENDING' && (
          <div className="bg-background-accent-orange-subtle px-300 py-150">
            <p className="font-designer-14m text-background-accent-orange-strong">
              {TEXT.pendingTitle}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              {TEXT.pendingDescription}
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
              <Badge color={PAYMENT_META[mentoring.status].color} shape="round">
                {PAYMENT_META[mentoring.status].label}
              </Badge>
            </div>

            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border px-150">
              <InfoRow label={TEXT.paymentMethod}>
                {TEXT.paymentMethodValue}
              </InfoRow>
              <InfoRow label={TEXT.paymentAmount}>
                {TEXT.paymentAmountValue}
              </InfoRow>
              <InfoRow label={TEXT.paymentStatus}>
                {PAYMENT_META[mentoring.status].label}
              </InfoRow>
            </div>
          </section>

          <section className="mb-300">
            <h2 className="font-designer-16b text-text-default mb-150">
              {TEXT.guideTitle}
            </h2>
            <p className="font-designer-14r text-text-subtle rounded-150 bg-background-alternative p-200">
              {mentoring.description}
            </p>
          </section>

          {mentoring.status === 'PENDING' && (
            <section>
              <div className="flex gap-100">
                <Link href="/my-mentoring" className="flex-1">
                  <Button size="medium" color="outlined" className="w-full">
                    {TEXT.moveToList}
                  </Button>
                </Link>
                <Link href="/note-consultation" className="flex-1">
                  <Button size="medium" color="primary" className="w-full">
                    {TEXT.moveToNoteConsultation}
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>

        {mentoring.status === 'PENDING' && (
          <div className="border-border-subtle bg-background-alternative border-t px-300 py-150 text-center">
            <p className="font-designer-13r text-text-subtlest">
              {TEXT.pendingFooterFirst}
              <br />
              {TEXT.pendingFooterSecond}
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
