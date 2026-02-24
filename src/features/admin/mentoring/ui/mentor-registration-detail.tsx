import dayjs from 'dayjs';
import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import KeyValueRow from '@/components/ui/key-value-row';
import SurfacePanel from '@/components/ui/surface-panel';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import {
  type WeekdayKey,
  WEEKDAY_KEYS,
} from '@/features/mentoring/model/mentor-settings';
import { WEEKDAY_LABEL_MAP } from '@/features/mentoring/model/mentor-settings';
import { formatWon, getMethodLabel } from '@/mocks/mentoring-mock-data';
import type { AdminMentorItem } from '@/types/mentoring/admin-domain';
import type { MentoringMethodType } from '@/types/mentoring/domain';

const METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'phone',
  'online',
  'offline',
];

const formatDateTime = (value: string | undefined) => {
  if (!value) {
    return '-';
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return '-';
  }

  return parsed.format('YYYY.MM.DD HH:mm');
};

const getMethodMeta = (
  item: AdminMentorItem,
  method: MentoringMethodType,
): {
  enabled: boolean;
  price: number;
  durationLabel: string;
} => {
  const settings = item.mentor.mentorSettings;

  if (!settings) {
    return {
      enabled: false,
      price: 0,
      durationLabel: '-',
    };
  }

  if (method === 'note') {
    return {
      enabled: settings.noteEnabled,
      price: settings.notePrice,
      durationLabel: '비동기',
    };
  }

  if (method === 'phone') {
    return {
      enabled: settings.phoneEnabled,
      price: settings.phonePrice,
      durationLabel: '15분',
    };
  }

  if (method === 'online') {
    return {
      enabled: settings.onlineEnabled,
      price: settings.onlinePrice,
      durationLabel: `${settings.onlineDurationMinutes}분`,
    };
  }

  return {
    enabled: settings.offlineEnabled,
    price: settings.offlinePrice,
    durationLabel: `${settings.offlineDurationMinutes}분`,
  };
};

const getScheduleText = (
  weekly: Record<WeekdayKey, string[]> | undefined,
  day: WeekdayKey,
) => {
  if (!weekly) {
    return '-';
  }

  const slots = weekly[day] ?? [];
  if (slots.length === 0) {
    return '-';
  }

  return slots.join(', ');
};

export default function MentorRegistrationDetail({
  item,
}: {
  item: AdminMentorItem;
}) {
  const settings = item.mentor.mentorSettings;
  const screeningMeta = MENTOR_SCREENING_STATUS_META[item.screening.status];
  const settlementDraft = settings?.settlementDraft;

  return (
    <SurfacePanel className="p-200">
      <header className="border-border-subtle mb-150 border-b pb-150">
        <div className="flex flex-wrap items-start justify-between gap-100">
          <div>
            <h2 className="font-designer-18b text-text-default line-clamp-2">
              {settings?.mentoringTitle ?? item.mentor.headline}
            </h2>
            <p className="font-designer-13r text-text-subtle mt-50">
              멘토 ID #{item.mentorId} · 연결 사용자{' '}
              {item.memberId ? `#${item.memberId}` : '없음'}
            </p>
          </div>
          <Badge color={screeningMeta.color} shape="rectangle">
            {screeningMeta.label}
          </Badge>
        </div>

        <div className="mt-125 flex flex-wrap gap-75">
          <Link href={`/mentoring/${item.mentorId}`}>
            <Button color="outlined" size="xsmall">
              멘토 프로필 보기
            </Button>
          </Link>
          {item.memberId ? (
            <Link href={`/admin/detail/${item.memberId}/profile`}>
              <Button color="outlined" size="xsmall">
                사용자 상세 보기
              </Button>
            </Link>
          ) : null}
        </div>
      </header>

      <div className="space-y-200">
        <Section title="기본 정보">
          <KeyValueRow
            label="직군 / 직무"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {(settings?.jobGroup ?? '-') + ' / ' + (settings?.jobTitle ?? '-')}
          </KeyValueRow>
          <KeyValueRow
            label="경력"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.careerYears ?? '-'}
          </KeyValueRow>
          <KeyValueRow
            label="카테고리"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.categories?.join(', ') || '-'}
          </KeyValueRow>
          <KeyValueRow
            label="스킬 태그"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.skillTags?.map((tag) => `#${tag}`).join(', ') || '-'}
          </KeyValueRow>
          <KeyValueRow
            label="회사 카테고리"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.companyCategory ?? '-'}
          </KeyValueRow>
          <KeyValueRow
            label="회사명"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.hideCompanyName
              ? '비공개'
              : settings?.companyName?.trim() || '-'}
          </KeyValueRow>
          <KeyValueRow
            label="최대 인원"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {`${settings?.maxParticipants ?? 1}명`}
          </KeyValueRow>
        </Section>

        <Section title="연락처">
          <KeyValueRow
            label="전화"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {(settings?.contactCountryCode ?? '') +
              ' ' +
              (settings?.contactPhone ?? '-')}
          </KeyValueRow>
          <KeyValueRow
            label="이메일"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {settings?.contactEmail ?? '-'}
          </KeyValueRow>
        </Section>

        <Section title="상담 방식 / 가격">
          <div className="space-y-100">
            {METHOD_ORDER.map((method) => {
              const meta = getMethodMeta(item, method);

              return (
                <div
                  key={method}
                  className="rounded-100 border-border-subtle bg-background-alternative grid grid-cols-[120px_96px_120px_1fr] gap-75 border px-125 py-100"
                >
                  <p className="font-designer-14b text-text-default">
                    {getMethodLabel(method)}
                  </p>
                  <Badge
                    color={meta.enabled ? 'green' : 'gray'}
                    shape="rectangle"
                  >
                    {meta.enabled ? '활성' : '비활성'}
                  </Badge>
                  <p className="font-designer-14r text-text-default">
                    {formatWon(meta.price)}
                  </p>
                  <p className="font-designer-13r text-text-subtle">
                    {meta.durationLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="주간 스케줄">
          <div className="space-y-75">
            {WEEKDAY_KEYS.map((day) => (
              <KeyValueRow
                key={day}
                label={WEEKDAY_LABEL_MAP[day]}
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {getScheduleText(settings?.schedule.weekly, day)}
              </KeyValueRow>
            ))}
          </div>
        </Section>

        <Section title="휴가">
          {settings?.holidays && settings.holidays.length > 0 ? (
            <div className="space-y-75">
              {settings.holidays.map((holiday) => (
                <p
                  key={holiday.id}
                  className="font-designer-13r text-text-default"
                >
                  {holiday.startDate} ~ {holiday.endDate} · {holiday.memo}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-designer-13r text-text-subtle">
              등록된 휴가가 없습니다.
            </p>
          )}
        </Section>

        <Section title="정산 정보">
          {settlementDraft ? (
            <div className="space-y-75">
              <KeyValueRow
                label="정산자 타입"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.payerType}
              </KeyValueRow>
              <KeyValueRow
                label="계약자명"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.contractName}
              </KeyValueRow>
              <KeyValueRow
                label="예금주"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.accountHolder}
              </KeyValueRow>
              <KeyValueRow
                label="은행"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.bankCode}
              </KeyValueRow>
              <KeyValueRow
                label="계좌번호"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.accountNumber}
              </KeyValueRow>
              <KeyValueRow
                label="인증 상태"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {settlementDraft.verified ? '완료' : '미완료'}
              </KeyValueRow>
            </div>
          ) : (
            <p className="font-designer-13r text-text-subtle">
              정산 정보가 등록되지 않았습니다.
            </p>
          )}
        </Section>

        <Section title="멘토 소개">
          <p className="font-designer-14r text-text-default whitespace-pre-wrap">
            {settings?.detailedDescription || '-'}
          </p>
        </Section>

        <Section title="상담 전 준비사항">
          {settings?.interviewQuestions &&
          settings.interviewQuestions.length > 0 ? (
            <div className="space-y-50">
              {settings.interviewQuestions.map((question) => (
                <p
                  key={question}
                  className="font-designer-14r text-text-default"
                >
                  - {question}
                </p>
              ))}
            </div>
          ) : (
            <p className="font-designer-13r text-text-subtle">
              등록된 준비사항이 없습니다.
            </p>
          )}
        </Section>

        <Section title="멘티 사전 안내">
          <p className="font-designer-14r text-text-default whitespace-pre-wrap">
            {settings?.preNotice || '-'}
          </p>
        </Section>

        <Section title="운영 지표">
          <KeyValueRow
            label="신청 상태"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            대기 {item.counts.pendingRequests} / 수락{' '}
            {item.counts.acceptedRequests} / 거절 {item.counts.rejectedRequests}
          </KeyValueRow>
          <KeyValueRow
            label="일정 상태"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            예정 {item.counts.scheduledSessions} / 완료{' '}
            {item.counts.completedSessions} / 취소{' '}
            {item.counts.cancelledSessions}
          </KeyValueRow>
          <KeyValueRow
            label="후기 수"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {`${item.counts.reviews}건`}
          </KeyValueRow>
          <KeyValueRow
            label="최종 업데이트"
            columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
          >
            {formatDateTime(settings?.updatedAt)}
          </KeyValueRow>
        </Section>
      </div>
    </SurfacePanel>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-designer-14b text-text-default mb-75">{title}</h3>
      <SurfacePanel className="p-125">{children}</SurfacePanel>
    </div>
  );
}
