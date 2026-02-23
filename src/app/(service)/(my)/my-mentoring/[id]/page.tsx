import { ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SectionShell from '@/components/ui/section-shell';
import {
  getMyMentoringById,
  type MyMentoringStatus,
} from '@/mocks/my-mentoring-mock-data';

const METHOD_LABEL: Record<'ONLINE' | 'OFFLINE' | 'CALL', string> = {
  ONLINE: '\uC628\uB77C\uC778',
  OFFLINE: '\uC624\uD504\uB77C\uC778',
  CALL: '\uC804\uD654',
};

const STATUS_META: Record<
  MyMentoringStatus,
  { label: string; color: 'green' | 'orange' }
> = {
  CONFIRMED: { label: '\uC77C\uC815 \uD655\uC815', color: 'green' },
  PENDING: { label: '\uC77C\uC815 \uBBF8\uD655\uC815', color: 'orange' },
};

const PAYMENT_META: Record<
  MyMentoringStatus,
  { label: string; color: 'green' | 'orange' }
> = {
  CONFIRMED: { label: '\uACB0\uC81C \uC644\uB8CC', color: 'green' },
  PENDING: { label: '\uACB0\uC81C \uB300\uAE30', color: 'orange' },
};

const TEXT = {
  back: '\uB098\uC758 \uBA58\uD1A0\uB9C1',
  mentor: '\uBA58\uD1A0',
  preferredSchedule: '\uD76C\uB9DD \uC77C\uC815',
  confirmedSchedule: '\uD655\uC815 \uC77C\uC815',
  requestedAt: '\uC2E0\uCCAD\uC77C',
  pendingTitle: '\uC77C\uC815\uC774 \uC544\uC9C1 \uBBF8\uD655\uC815 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.',
  pendingDescription:
    '\uBA58\uD1A0\uC640 \uC870\uC728\uC774 \uC644\uB8CC\uB418\uBA74 \uC54C\uB9BC\uC744 \uD1B5\uD574 \uD655\uC815 \uC2DC\uAC04\uC744 \uC548\uB0B4\uD574\uB4DC\uB824\uC694.',
  pendingWindow: '\uC870\uC728 \uC608\uC815',
  pendingFallback: '\uBA58\uD1A0\uC640 \uC2DC\uAC04 \uC870\uC728 \uC911',
  requestInfoTitle: '\uBA58\uD1A0\uB9C1 \uC694\uCCAD \uC815\uBCF4',
  paymentInfoTitle: '\uACB0\uC81C \uC815\uBCF4',
  paymentMethod: '\uACB0\uC81C \uBC29\uC2DD',
  paymentAmount: '\uACB0\uC81C \uAE08\uC561',
  paymentStatus: '\uACB0\uC81C \uC0C1\uD0DC',
  paymentMethodValue: '\uCE74\uB4DC \uACB0\uC81C',
  paymentAmountValue: '33,000\uC6D0',
  requestMessage: '\uC694\uCCAD \uBA54\uC2DC\uC9C0',
  memoTitle: '\uBA58\uD1A0\uB9C1 \uBA54\uBAA8',
  detailTitle: '\uBA58\uD1A0\uB9C1 \uC0C1\uC138',
  detailDescription:
    '\uC2E0\uCCAD\uD55C \uBA58\uD1A0\uB9C1 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uC9C4\uD589 \uC0C1\uD0DC\uB97C \uD55C \uB208\uC5D0 \uBCFC \uC218 \uC788\uC5B4\uC694.',
  moveToNoteConsultation: '\uCABD\uC9C0\uC0C1\uB2F4 \uC774\uB3D9',
  moveToList: '\uBAA9\uB85D\uC73C\uB85C',
  guideTitle: '\uBA58\uD1A0\uB9C1 \uC548\uB0B4',
  pendingFooterFirst:
    '\uC77C\uC815 \uD655\uC815 \uC804\uAE4C\uC9C0\uB294 \uBA58\uD1A0 \uC870\uC728 \uC694\uCCAD \uC0C1\uD0DC\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
  pendingFooterSecond:
    '\uD655\uC815 \uD6C4 \uC54C\uB9BC\uC5D0\uC11C \uCD5C\uC885 \uC2DC\uAC04\uACFC \uC9C4\uD589 \uBC29\uC2DD\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
};

interface MyMentoringDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MyMentoringDetailPage({
  params,
}: MyMentoringDetailPageProps) {
  const { id } = await params;
  const mentoringId = Number(id);

  if (!Number.isInteger(mentoringId) || mentoringId <= 0) {
    notFound();
  }

  const mentoring = getMyMentoringById(mentoringId);

  if (!mentoring) {
    notFound();
  }

  const scheduleText =
    mentoring.status === 'CONFIRMED'
      ? mentoring.mentoringTime ?? '-'
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

      <div className="rounded-200 border-border-subtle overflow-hidden border bg-background-default shadow-sm">
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
                <Badge color={STATUS_META[mentoring.status].color} shape="round">
                  {STATUS_META[mentoring.status].label}
                </Badge>
              </div>
            </div>

            <div className="border-border-subtle divide-border-subtle divide-y rounded-150 border">
              <InfoRow label={TEXT.requestMessage}>{mentoring.title}</InfoRow>
              <InfoRow label={TEXT.mentor}>{mentoring.mentorName}</InfoRow>
              <InfoRow label={TEXT.requestedAt}>{mentoring.requestedAt}</InfoRow>
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

            <div className="border-border-subtle divide-border-subtle divide-y rounded-150 border px-150">
              <InfoRow label={TEXT.paymentMethod}>{TEXT.paymentMethodValue}</InfoRow>
              <InfoRow label={TEXT.paymentAmount}>{TEXT.paymentAmountValue}</InfoRow>
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

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-200 px-150 py-150">
      <span className="font-designer-14m text-text-subtle w-[100px] shrink-0">
        {label}
      </span>
      <div className="font-designer-14r text-text-default flex-1">{children}</div>
    </div>
  );
}
