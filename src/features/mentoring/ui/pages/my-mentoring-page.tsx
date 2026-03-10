import {
  CalendarDays,
  ChevronRight,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import List from '@/components/common/ui/list';
import SectionHeader from '@/components/common/ui/section-header';
import SectionShell from '@/components/common/ui/section-shell';
import { isMentoringNoteConsultationEnabled } from '@/features/mentoring/model/mentoring-feature-flag';
import type { MyMentoringItem } from '@/types/mentoring/my-mentoring';

const METHOD_LABEL: Record<'ONLINE' | 'OFFLINE' | 'CALL', string> = {
  ONLINE: '심층상담',
  OFFLINE: '대면상담',
  CALL: '간편상담',
};

const STATUS_META: Record<
  'REQUESTED' | 'CONFIRMED' | 'PENDING',
  { label: string; color: 'green' | 'orange' }
> = {
  REQUESTED: { label: '멘토 확인 대기', color: 'orange' },
  CONFIRMED: { label: '일정 확정', color: 'green' },
  PENDING: { label: '일정 조율 중', color: 'orange' },
};

const TEXT = {
  pageTitle: '나의 멘토링',
  pageDescription: '멘토링 일정, 멘토, 진행 상태를 한 번에 확인할 수 있어요.',
  confirmedTitle: '예정된 멘토링',
  confirmedDescription: '시간이 확정된 멘토링 일정입니다.',
  pendingTitle: '진행 대기 중',
  pendingDescription:
    '멘토 확인과 일정 조율을 기다리는 멘토링을 모아볼 수 있어요.',
  noData: '표시할 멘토링이 없습니다.',
  appliedAt: '신청일',
  mentor: '멘토',
  detail: '상세 보기',
  requestedPrefix: '희망 일정',
  pendingPrefix: '조율 예정',
  requestedFallback: '멘토 확인을 기다리고 있습니다.',
  pendingFallback: '멘토와 시간 조율 중',
  confirmedCount: '확정',
  pendingCount: '진행 중',
  noteConsultation: '쪽지상담',
  previewLabel: '요청 메모',
};

export default function MyMentoringPage({
  items = [],
}: {
  items?: MyMentoringItem[];
}) {
  const isNoteConsultationEnabled = isMentoringNoteConsultationEnabled();
  const confirmedMentoring = items.filter(
    (item) => item.status === 'CONFIRMED',
  );
  const pendingMentoring = items.filter((item) => item.status !== 'CONFIRMED');

  return (
    <SectionShell className="gap-300">
      <SectionHeader
        title={TEXT.pageTitle}
        titleClassName="font-designer-24b text-text-default"
        description={TEXT.pageDescription}
        rightSlot={
          <div className="flex items-center gap-75">
            <Badge color="green" shape="round">
              {`${TEXT.confirmedCount} ${confirmedMentoring.length}`}
            </Badge>
            <Badge color="orange" shape="round">
              {`${TEXT.pendingCount} ${pendingMentoring.length}`}
            </Badge>
          </div>
        }
      />

      <MentoringListSection
        title={TEXT.confirmedTitle}
        description={TEXT.confirmedDescription}
        items={confirmedMentoring}
        headerAction={
          isNoteConsultationEnabled ? (
            <Link href="/note-consultation">
              <Button
                color="outlined"
                size="small"
                icon={<MessageCircle className="h-14 w-14" />}
              >
                {TEXT.noteConsultation}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <MentoringListSection
        title={TEXT.pendingTitle}
        description={TEXT.pendingDescription}
        items={pendingMentoring}
      />
    </SectionShell>
  );
}

function MentoringListSection({
  title,
  description,
  items,
  headerAction,
}: {
  title: string;
  description: string;
  items: MyMentoringItem[];
  headerAction?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-150">
      <div>
        <div className="flex items-start justify-between gap-100">
          <h2 className="font-designer-16b text-text-default">{title}</h2>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        <p className="font-designer-13r text-text-subtle mt-25">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
          <p className="font-designer-14m text-text-subtle">{TEXT.noData}</p>
        </div>
      ) : (
        <List className="flex flex-col gap-125">
          {items.map((mentoring) => {
            const scheduleText =
              mentoring.status === 'CONFIRMED'
                ? mentoring.mentoringTime
                : mentoring.status === 'REQUESTED'
                  ? mentoring.pendingWindow
                    ? `${TEXT.requestedPrefix}: ${mentoring.pendingWindow}`
                    : TEXT.requestedFallback
                  : mentoring.pendingWindow
                    ? `${TEXT.pendingPrefix}: ${mentoring.pendingWindow}`
                    : TEXT.pendingFallback;

            return (
              <List.Item
                key={mentoring.id}
                className="rounded-150 border-border-subtle bg-background-default hover:bg-background-default active:bg-background-default h-auto min-h-0 items-stretch space-x-0 border p-0"
              >
                <Link
                  href={`/my-mentoring/${mentoring.id}`}
                  className="group block w-full p-200"
                >
                  <div className="mb-125 flex items-start justify-between gap-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-50">
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
                      <h3 className="font-designer-16b text-text-default mt-75 line-clamp-1">
                        {`${mentoring.mentorName} 멘토`}
                      </h3>
                      <p className="font-designer-13r text-text-subtle mt-25">
                        {`${TEXT.appliedAt} ${mentoring.requestedAt}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-75">
                      <span className="font-designer-13m text-text-subtle rounded-50 border-border-subtle group-hover:text-text-default group-hover:border-border-brand inline-flex items-center gap-25 border px-75 py-25">
                        {TEXT.detail}
                        <ChevronRight className="h-14 w-14" />
                      </span>
                    </div>
                  </div>

                  <div className="mb-75 flex items-center gap-75">
                    <CalendarDays className="text-text-subtle h-16 w-16" />
                    <span className="font-designer-14b text-text-default">
                      {scheduleText}
                    </span>
                  </div>
                  <div className="mb-100 flex items-center gap-75">
                    <UserRound className="text-text-subtle h-16 w-16" />
                    <span className="font-designer-14m text-text-default">
                      {TEXT.previewLabel}
                    </span>
                    <Badge color={mentoring.paymentStatusTone} shape="round">
                      {mentoring.paymentStatusLabel}
                    </Badge>
                  </div>
                  <p className="font-designer-13r text-text-subtle line-clamp-2 leading-relaxed">
                    {mentoring.title}
                  </p>
                </Link>
              </List.Item>
            );
          })}
        </List>
      )}
    </section>
  );
}
