'use client';

import dayjs from 'dayjs';
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  MessageCircleMore,
  MonitorPlay,
} from 'lucide-react';
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
  MENTORING_DEFAULT_CHANNEL_GUIDE,
  MENTORING_PROGRESS_CHECK_GUIDE,
  getMentoringResponseGuide,
} from '@/features/mentoring/model/mentoring-flow-policy';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';

interface MentoringPaymentCompletePageClientProps {
  mentorId: number;
  requestId: string;
}

const PAYMENT_METHOD_LABEL = {
  CARD: '카드 결제',
  VIRTUAL_ACCOUNT: '가상계좌',
  MANUAL_TRANSFER: '수동 계좌이체',
} as const;

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
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const managementStoreHydrated = useMentoringManagementStore(
    (state) => state.hasHydrated,
  );
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const mentorDirectoryQuery = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });

  const mentors = [
    ...(mentorDirectoryQuery.data?.mentors ?? []),
    ...createdMentors,
  ];
  const mentor = mentors.find((item) => item.id === mentorId);
  const request = (requestsByMentor[mentorId] ?? []).find((item) => {
    return item.id === requestId && item.menteeMemberId === memberId;
  });
  const paymentAmount = request
    ? mentor?.methods[request.method]?.price
    : undefined;

  const isReady =
    isAuthHydrated && mentorStoreHydrated && managementStoreHydrated;

  return (
    <MentoringStateBoundary
      state={
        !isReady
          ? 'loading'
          : memberId
            ? request
              ? 'ready'
              : 'empty'
            : 'forbidden'
      }
      ready={
        request ? (
          <MentoringPaymentCompletePage
            mentorName={mentor?.nickname ?? `멘토 #${mentorId}`}
            methodLabel={getMethodLabel(request.method)}
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
              request.preferredDate
                ? `${dayjs(request.preferredDate).format('YYYY.MM.DD')}${request.preferredTime ? ` ${request.preferredTime}` : ''}`
                : '상담 방식에 따라 별도 조율'
            }
            isNoteConsultation={request.method === 'note'}
            detailHref={
              request.method === 'note'
                ? '/note-consultation'
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
          description="신청 내역이 없거나 이미 다른 상태로 이동했습니다. 나의 멘토링에서 최신 상태를 확인해주세요."
        />
      }
      forbidden={
        <CompletionFallback
          title="로그인이 필요합니다"
          description="결제 완료 후 신청 내역은 로그인한 상태에서만 확인할 수 있습니다."
        />
      }
    />
  );
}

function MentoringPaymentCompletePage({
  mentorName,
  methodLabel,
  paymentMethodLabel,
  paymentAmountLabel,
  preferredScheduleLabel,
  isNoteConsultation,
  detailHref,
}: {
  mentorName: string;
  methodLabel: string;
  paymentMethodLabel: string;
  paymentAmountLabel: string;
  preferredScheduleLabel: string;
  isNoteConsultation: boolean;
  detailHref: string;
}) {
  const responseGuide = getMentoringResponseGuide(
    isNoteConsultation ? 'note' : 'deep',
  );
  const statusDescription = isNoteConsultation
    ? '결제가 완료되었고, 이제 멘토의 첫 답장을 기다리는 단계입니다.'
    : '결제가 완료되었고, 보통 24시간 안에 멘토 확인과 일정 조율이 시작됩니다.';
  const nextSteps = isNoteConsultation
    ? [
        '결제가 완료되면 쪽지상담 요청이 즉시 접수됩니다.',
        '멘토의 첫 답장이 도착하면 상담이 바로 시작됩니다.',
        '추가 자료 전달과 후속 질문은 쪽지 상담 화면에서 이어서 진행할 수 있습니다.',
      ]
    : [
        '결제가 완료되면 예약 요청이 즉시 접수됩니다.',
        '보통 24시간 안에 멘토 확인이 시작되며, 일정 조율 또는 수락 결과가 알림으로 안내됩니다.',
        '확정 시간과 진행 링크는 알림과 멘토링 상세 화면에서 확인할 수 있습니다.',
      ];

  return (
    <PageContainer spacing="content">
      <div className="grid gap-250 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-250">
          <SurfacePanel radius="lg" overflow="hidden">
            <div className="bg-fill-success-subtle-default px-250 py-250">
              <div className="mb-125 flex items-center gap-100">
                <CheckCircle2 className="text-text-success h-24 w-24" />
                <h1 className="font-designer-28b text-text-default">
                  멘토링 신청이 완료되었어요
                </h1>
              </div>
              <p className="font-designer-14r text-text-subtle leading-relaxed">
                {statusDescription}
              </p>
            </div>

            <div className="space-y-200 px-250 py-250">
              <div className="flex flex-wrap items-center gap-75">
                <Badge color="green" shape="round">
                  결제 완료
                </Badge>
                <Badge color="blue" shape="round">
                  {methodLabel}
                </Badge>
                {!isNoteConsultation && (
                  <Badge color="orange" shape="round">
                    멘토 확인 대기
                  </Badge>
                )}
              </div>

              <div className="grid gap-125 md:grid-cols-2">
                <InfoCard label="멘토" value={mentorName} />
                <InfoCard label="결제 수단" value={paymentMethodLabel} />
                <InfoCard label="결제 금액" value={paymentAmountLabel} />
                <InfoCard label="희망 일정" value={preferredScheduleLabel} />
              </div>

              <div className="rounded-125 bg-background-alternative p-150">
                <p className="font-designer-13b text-text-default mb-25">
                  다음 안내
                </p>
                <p className="font-designer-13r text-text-subtle leading-relaxed">
                  {responseGuide}
                </p>
              </div>
            </div>
          </SurfacePanel>

          <SurfacePanel radius="lg" className="p-250">
            <div className="mb-150 flex items-center gap-75">
              <CalendarClock className="text-text-brand h-18 w-18" />
              <h2 className="font-designer-18b text-text-default">
                다음 진행 단계
              </h2>
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
            <div className="mb-150 flex items-center gap-75">
              <MonitorPlay className="text-text-brand h-18 w-18" />
              <h2 className="font-designer-18b text-text-default">진행 안내</h2>
            </div>
            <div className="space-y-100">
              <GuideRow
                icon={<MessageCircleMore className="h-16 w-16" />}
                title="기본 진행 채널"
                description={MENTORING_DEFAULT_CHANNEL_GUIDE}
              />
              <GuideRow
                icon={<BellRing className="h-16 w-16" />}
                title="진행 확인"
                description={MENTORING_PROGRESS_CHECK_GUIDE}
              />
            </div>
          </SurfacePanel>
        </div>

        <aside className="space-y-175 xl:sticky xl:top-[96px] xl:self-start">
          <SurfacePanel radius="lg" className="p-225">
            <h2 className="font-designer-18b text-text-default mb-150">
              바로 이동
            </h2>
            <div className="space-y-100">
              <Button asChild color="primary" size="large" className="w-full">
                <Link href={detailHref}>
                  {isNoteConsultation
                    ? '쪽지 상담으로 이동'
                    : '예약 내역 바로 보기'}
                  <ChevronRight className="h-16 w-16" />
                </Link>
              </Button>
              <Button asChild color="outlined" size="large" className="w-full">
                <Link href="/my-mentoring">나의 멘토링으로 이동</Link>
              </Button>
              <Button asChild color="outlined" size="large" className="w-full">
                <Link href="/mentoring">멘토링 목록 더 보기</Link>
              </Button>
            </div>
          </SurfacePanel>
        </aside>
      </div>
    </PageContainer>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-150 bg-background-alternative p-150">
      <p className="font-designer-12r text-text-subtlest mb-50">{label}</p>
      <p className="font-designer-16b text-text-default">{value}</p>
    </div>
  );
}

function GuideRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background-alternative flex items-start gap-100 rounded-150 p-150">
      <div className="text-text-brand mt-[2px] shrink-0">{icon}</div>
      <div>
        <p className="font-designer-13b text-text-default mb-25">{title}</p>
        <p className="font-designer-12r text-text-subtle leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
