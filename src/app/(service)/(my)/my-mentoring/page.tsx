import { CalendarDays, ChevronRight, MessageCircle, UserRound } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import List from '@/components/ui/list';
import SectionHeader from '@/components/ui/section-header';
import SectionShell from '@/components/ui/section-shell';
import {
  type MyMentoringMockItem,
  myMentoringMockData,
} from '@/mocks/my-mentoring-mock-data';

const METHOD_LABEL: Record<'ONLINE' | 'OFFLINE' | 'CALL', string> = {
  ONLINE: '\uC628\uB77C\uC778',
  OFFLINE: '\uC624\uD504\uB77C\uC778',
  CALL: '\uC804\uD654',
};

const STATUS_META: Record<
  'CONFIRMED' | 'PENDING',
  { label: string; color: 'green' | 'orange' }
> = {
  CONFIRMED: { label: '\uC77C\uC815 \uD655\uC815', color: 'green' },
  PENDING: { label: '\uC77C\uC815 \uBBF8\uD655\uC815', color: 'orange' },
};

const TEXT = {
  pageTitle: '\uB098\uC758 \uBA58\uD1A0\uB9C1',
  pageDescription:
    '\uBA58\uD1A0\uB9C1 \uC77C\uC815, \uBA58\uD1A0, \uC9C4\uD589 \uC0C1\uD0DC\uB97C \uD55C \uBC88\uC5D0 \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.',
  confirmedTitle: '\uC608\uC815\uB41C \uBA58\uD1A0\uB9C1',
  confirmedDescription: '\uC2DC\uAC04\uC774 \uD655\uC815\uB41C \uBA58\uD1A0\uB9C1 \uC77C\uC815\uC785\uB2C8\uB2E4.',
  pendingTitle: '\uBBF8\uD655\uC815 \uC608\uC815',
  pendingDescription:
    '\uBA58\uD1A0\uC640 \uC2DC\uAC04 \uC870\uC728 \uC911\uC778 \uBA58\uD1A0\uB9C1\uB3C4 \uC5EC\uAE30\uC5D0\uC11C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
  noData: '\uD45C\uC2DC\uD560 \uBA58\uD1A0\uB9C1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  appliedAt: '\uC2E0\uCCAD\uC77C',
  mentor: '\uBA58\uD1A0',
  detail: '\uC0C1\uC138 \uBCF4\uAE30',
  pendingPrefix: '\uC870\uC728 \uC608\uC815',
  pendingFallback: '\uBA58\uD1A0\uC640 \uC2DC\uAC04 \uC870\uC728 \uC911',
  confirmedCount: '\uD655\uC815',
  pendingCount: '\uBBF8\uD655\uC815',
  noteConsultation: '\uCABD\uC9C0\uC0C1\uB2F4',
};

export default function MyMentoringPage() {
  const confirmedMentoring = myMentoringMockData.filter(
    (item) => item.status === 'CONFIRMED',
  );
  const pendingMentoring = myMentoringMockData.filter(
    (item) => item.status === 'PENDING',
  );

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
          <Link href="/note-consultation">
            <Button
              color="outlined"
              size="small"
              icon={<MessageCircle className="h-14 w-14" />}
            >
              {TEXT.noteConsultation}
            </Button>
          </Link>
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
  items: MyMentoringMockItem[];
  headerAction?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-150">
      <div>
        <div className="flex items-start justify-between gap-100">
          <h2 className="font-designer-16b text-text-default">{title}</h2>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        <p className="font-designer-13r text-text-subtle mt-25">{description}</p>
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
                : mentoring.pendingWindow
                  ? `${TEXT.pendingPrefix}: ${mentoring.pendingWindow}`
                  : TEXT.pendingFallback;

            return (
              <List.Item
                key={mentoring.id}
                className="h-auto min-h-0 items-stretch space-x-0 rounded-150 border border-border-subtle bg-background-default p-0 hover:bg-background-default active:bg-background-default"
              >
                <Link
                  href={`/my-mentoring/${mentoring.id}`}
                  className="group block w-full p-200"
                >
                  <div className="mb-125 flex items-start justify-between gap-100">
                    <div>
                      <h3 className="font-designer-16b text-text-default line-clamp-1">
                        {mentoring.title}
                      </h3>
                      <p className="font-designer-13r text-text-subtle mt-25">
                        {`${TEXT.appliedAt} ${mentoring.requestedAt}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-75">
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
                      <span className="font-designer-13m text-text-subtle inline-flex items-center gap-25 rounded-50 border border-border-subtle px-75 py-25 group-hover:text-text-default group-hover:border-border-brand">
                        {TEXT.detail}
                        <ChevronRight className="h-14 w-14" />
                      </span>
                    </div>
                  </div>

                  <div className="mb-75 flex items-center gap-75">
                    <UserRound className="text-text-subtle h-16 w-16" />
                    <span className="font-designer-14m text-text-default">
                      {`${TEXT.mentor} ${mentoring.mentorName}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-75">
                    <CalendarDays className="text-text-subtle h-16 w-16" />
                    <span className="font-designer-14m text-text-default">
                      {scheduleText}
                    </span>
                  </div>

                </Link>
              </List.Item>
            );
          })}
        </List>
      )}
    </section>
  );
}
