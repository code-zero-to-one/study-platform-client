'use client';

import {
  BriefcaseBusiness,
  ChevronRight,
  CircleCheck,
  MessageCircle,
  Monitor,
  Phone,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  hasAnyWeeklyScheduleSlots,
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
} from '@/features/mentoring/model/mentor-settings';
import {
  formatWon,
  getEnabledMentoringMethods,
  getMentorSettings,
  getMethodLabel,
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import ReviewStars from './review-stars';

interface MentorDetailPageProps {
  mentor: MentorProfile;
}

const methodIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-18 w-18" />,
  phone: <Phone className="h-18 w-18" />,
  online: <Monitor className="h-18 w-18" />,
  offline: <Users className="h-18 w-18" />,
};

const reviewMethodMap: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  phone: '15분 전화상담',
  online: '온라인상담',
  offline: '대면상담',
};

export default function MentorDetailPage({ mentor }: MentorDetailPageProps) {
  const mentorSettings = getMentorSettings(mentor);
  const enabledMethods = useMemo(() => {
    return getEnabledMentoringMethods(mentor);
  }, [mentor]);
  const scheduleDurationLabel = useMemo(() => {
    const labels = enabledMethods
      .map((method) => mentor.methods[method])
      .filter((method) => method.requiresSchedule)
      .map((method) => method.durationLabel);
    const uniqueLabels = Array.from(new Set(labels));

    if (uniqueLabels.length === 0) {
      return '비동기';
    }

    if (uniqueLabels.length === 1) {
      return uniqueLabels[0];
    }

    return '방식별 상이';
  }, [enabledMethods, mentor.methods]);
  const scheduleRows = useMemo(() => {
    return WEEKDAY_KEYS.flatMap((weekday) => {
      const slots = mentorSettings.schedule.weekly[weekday];
      if (slots.length === 0) {
        return [];
      }

      const sortedSlots = [...slots].sort((a, b) => a.localeCompare(b));
      const previewSlots = sortedSlots.slice(0, 4).join(', ');
      const remainCount = sortedSlots.length - 4;
      const suffix = remainCount > 0 ? ` 외 ${remainCount}개` : '';

      return [`${WEEKDAY_LABEL_MAP[weekday]} ${previewSlots}${suffix}`];
    });
  }, [mentorSettings.schedule.weekly]);
  const hasWeeklySchedule = hasAnyWeeklyScheduleSlots(mentorSettings.schedule);
  const interviewQuestions = mentorSettings.interviewQuestions.filter(
    (question) => question.trim().length > 0,
  );

  const [selectedMethod, setSelectedMethod] = useState<MentoringMethodType>(
    enabledMethods[0] ?? 'note',
  );

  const selectedOption = mentor.methods[selectedMethod];
  const acceptancePolicy =
    selectedMethod === 'note'
      ? {
          title: '쪽지상담 수락 정책',
          description:
            '결제 완료 후 멘토의 첫 답장이 수락으로 처리됩니다. 별도 수락 단계 없이 바로 진행됩니다.',
        }
      : {
          title: '예약형 상담 수락 정책',
          description:
            '결제 후 멘토가 48시간 내 수락/거절을 결정합니다. 48시간 내 응답이 없으면 자동 거절되며, 멘토는 거절 사유를 남길 수 있습니다.',
        };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <nav className="mb-250 flex items-center gap-75">
        <Link
          href="/mentoring"
          className="font-designer-14r text-text-subtle hover:text-text-default"
        >
          1:1 멘토링
        </Link>
        <ChevronRight className="text-text-subtlest h-14 w-14" />
        <span className="font-designer-14r text-text-default">
          {mentor.nickname}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-300 xl:grid-cols-[1fr_340px] xl:gap-500">
        <div className="min-w-0">
          <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
            <div className="flex items-start gap-200">
              <div className="bg-background-accent-rose-default relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full">
                {mentor.imageUrl ? (
                  <Image
                    src={mentor.imageUrl}
                    alt={mentor.nickname}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="font-designer-24b text-text-subtle flex h-full w-full items-center justify-center">
                    {mentor.avatarEmoji ?? mentor.nickname[0]}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="font-designer-24b text-text-strong mb-100">
                  {mentor.headline}
                </h1>
                <p className="font-designer-16b text-text-default mb-50">
                  {mentor.nickname}
                </p>
                <p className="font-designer-14r text-text-subtle mb-75">
                  {mentor.role} · {mentor.career}
                </p>
                <p className="font-designer-14b text-text-brand mb-150">
                  {mentor.company}
                </p>

                <div className="flex flex-wrap items-center gap-100">
                  <ReviewStars rating={Math.floor(mentor.rating)} />
                  <span className="font-designer-14b text-text-strong">
                    {mentor.rating.toFixed(1)}
                  </span>
                  <span className="font-designer-13r text-text-subtle">
                    리뷰 {mentor.reviewCount}개 · 멘토링 {mentor.mentoringCount}
                    건
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
            <h2 className="font-designer-18b text-text-strong mb-150">
              멘토 소개
            </h2>
            <p className="font-designer-14r text-text-default mb-200 leading-relaxed whitespace-pre-line">
              {mentorSettings.detailedDescription}
            </p>
            <div className="mb-200 flex flex-wrap gap-100">
              {mentorSettings.skillTags.map((tag) => (
                <Badge key={tag} color="blue" shape="round">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="rounded-150 bg-background-alternative p-200">
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                {mentorSettings.mentoringTitle}
              </p>
            </div>
          </section>

          {interviewQuestions.length > 0 && (
            <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
              <h2 className="font-designer-18b text-text-strong mb-150">
                상담 전 인터뷰 질문
              </h2>
              <ul className="flex flex-col gap-100">
                {interviewQuestions.map((question) => (
                  <li key={question} className="flex items-start gap-100">
                    <CircleCheck className="text-text-success mt-[2px] h-16 w-16 shrink-0" />
                    <span className="font-designer-14r text-text-default leading-relaxed">
                      {question}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
            <div className="mb-200 flex items-center gap-75">
              <BriefcaseBusiness className="text-text-brand h-18 w-18" />
              <h2 className="font-designer-18b text-text-strong">경력/강점</h2>
            </div>

            <ul className="mb-250 flex flex-col gap-100">
              {mentor.careerHistory.map((career) => (
                <li key={career} className="flex items-start gap-100">
                  <CircleCheck className="text-text-success mt-[2px] h-16 w-16 shrink-0" />
                  <span className="font-designer-14r text-text-default">
                    {career}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-100">
              {mentor.strengths.map((strength) => (
                <Badge key={strength} color="purple" shape="round">
                  {strength}
                </Badge>
              ))}
            </div>
          </section>

          <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
            <h2 className="font-designer-18b text-text-strong mb-150">
              멘토링 운영 정보
            </h2>

            <div className="mb-200 flex flex-wrap gap-100">
              {mentorSettings.categories.map((category) => (
                <Badge key={category} color="green" shape="round">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="mb-200 grid grid-cols-1 gap-100 sm:grid-cols-2">
              <div className="rounded-125 bg-background-alternative px-150 py-125">
                <p className="font-designer-12r text-text-subtle mb-50">
                  1회 시간
                </p>
                <p className="font-designer-14b text-text-default">
                  {scheduleDurationLabel}
                </p>
              </div>
              <div className="rounded-125 bg-background-alternative px-150 py-125">
                <p className="font-designer-12r text-text-subtle mb-50">
                  1회 최대 인원
                </p>
                <p className="font-designer-14b text-text-default">
                  {mentorSettings.maxParticipants}명
                </p>
              </div>
            </div>

            <div className="rounded-125 bg-background-alternative px-150 py-125">
              <p className="font-designer-12r text-text-subtle mb-75">
                멘토 스케줄
              </p>
              {hasWeeklySchedule ? (
                <ul className="flex flex-col gap-50">
                  {scheduleRows.map((row) => (
                    <li
                      key={row}
                      className="font-designer-13r text-text-default"
                    >
                      {row}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-designer-13r text-text-subtle">
                  공개된 정기 스케줄이 없어 신청 후 개별 조율로 진행됩니다.
                </p>
              )}
              {mentorSettings.holidays.length > 0 && (
                <p className="font-designer-12r text-text-warning mt-75">
                  등록된 휴가 {mentorSettings.holidays.length}건
                </p>
              )}
            </div>
          </section>

          {mentorSettings.preNotice.trim() && (
            <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
              <h2 className="font-designer-18b text-text-strong mb-125">
                멘토링 사전 안내
              </h2>
              <p className="font-designer-14r text-text-subtle leading-relaxed whitespace-pre-line">
                {mentorSettings.preNotice}
              </p>
            </section>
          )}

          <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300 sm:p-350">
            <h2 className="font-designer-18b text-text-strong mb-200">
              제공 중인 멘토링
            </h2>

            <div className="grid grid-cols-1 gap-150 sm:grid-cols-2">
              {enabledMethods.map((method) => {
                const option = mentor.methods[method];

                return (
                  <div
                    key={method}
                    className={cn(
                      'rounded-150 border-border-subtle border p-200',
                      selectedMethod === method &&
                        'border-border-brand bg-fill-brand-subtle-default',
                    )}
                  >
                    <div className="mb-100 flex items-center gap-75">
                      <span className="text-text-brand">
                        {methodIconMap[method]}
                      </span>
                      <p className="font-designer-14b text-text-strong">
                        {option.label}
                      </p>
                    </div>
                    <p className="font-designer-13r text-text-subtle mb-100">
                      {option.description}
                    </p>
                    <p className="font-designer-14b text-text-default">
                      {formatWon(option.price)} ({option.durationLabel})
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-200 border-border-subtle bg-background-default border p-300 sm:p-350">
            <div className="mb-200 flex items-center justify-between gap-200">
              <h2 className="font-designer-18b text-text-strong">
                멘토링 리뷰
              </h2>
              <div className="flex items-center gap-100">
                <ReviewStars rating={Math.floor(mentor.rating)} />
                <span className="font-designer-14b text-text-strong">
                  {mentor.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {mentor.reviews.length === 0 ? (
              <div className="rounded-150 bg-background-alternative px-200 py-300 text-center">
                <p className="font-designer-14r text-text-subtle">
                  아직 등록된 리뷰가 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-150">
                {mentor.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-150 border-border-subtle border p-200"
                  >
                    <div className="mb-100 flex items-center justify-between gap-100">
                      <div className="flex items-center gap-100">
                        <p className="font-designer-14b text-text-default">
                          {review.authorName}
                        </p>
                        <Badge color="gray" shape="round">
                          {reviewMethodMap[review.method]}
                        </Badge>
                      </div>
                      <p className="font-designer-12r text-text-subtlest">
                        {review.createdAt}
                      </p>
                    </div>

                    <div className="mb-75">
                      <ReviewStars rating={review.rating} />
                    </div>
                    <p className="font-designer-14r text-text-subtle leading-relaxed">
                      {review.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit xl:sticky xl:top-[88px]">
          <div className="rounded-200 border-border-subtle bg-background-default border p-250">
            <h2 className="font-designer-18b text-text-strong mb-200">
              멘토링 신청
            </h2>

            <div className="mb-200 flex flex-col gap-100">
              {enabledMethods.map((method) => {
                const option = mentor.methods[method];

                return (
                  <button
                    key={method}
                    type="button"
                    className={cn(
                      'rounded-125 border-border-subtle bg-background-default',
                      'flex w-full items-center justify-between border px-150 py-125 text-left',
                      selectedMethod === method &&
                        'border-border-brand bg-fill-brand-subtle-default',
                    )}
                    onClick={() => setSelectedMethod(method)}
                  >
                    <div>
                      <p className="font-designer-14b text-text-default">
                        {getMethodLabel(method)}
                      </p>
                      <p className="font-designer-12r text-text-subtle">
                        {option.durationLabel}
                      </p>
                    </div>
                    <p className="font-designer-14b text-text-strong">
                      {formatWon(option.price)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-125 bg-background-alternative mb-200 p-150">
              <p className="font-designer-13r text-text-subtle">
                선택한 방식: <b>{selectedOption.label}</b>
                <br />
                소요 시간: {selectedOption.durationLabel}
                <br />
                결제 금액: {formatWon(selectedOption.price)}
              </p>
            </div>

            <div className="rounded-125 bg-background-alternative mb-200 p-150">
              <p className="font-designer-13b text-text-default mb-50">
                {acceptancePolicy.title}
              </p>
              <p className="font-designer-12r text-text-subtle leading-relaxed">
                {acceptancePolicy.description}
              </p>
            </div>

            <Link href={`/mentoring/${mentor.id}/apply?type=${selectedMethod}`}>
              <Button color="primary" size="large" className="w-full">
                결제 페이지로 이동
              </Button>
            </Link>

            <div className="rounded-125 bg-background-accent-yellow-subtle mt-150 p-150">
              <p className="font-designer-12r text-text-subtle leading-relaxed">
                멘토링 환불은 멘토링 시작 시간 기준으로 진행되며,
                <br />
                120시간 전까지 전액 환불 가능합니다.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
