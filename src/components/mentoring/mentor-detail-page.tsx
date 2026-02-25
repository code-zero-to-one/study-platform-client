'use client';

import {
  ChevronRight,
  CircleCheck,
  Info,
  MessageCircle,
  Monitor,
  Phone,
  RotateCcw,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Avatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  formatWon,
  getEnabledMentoringMethods,
  getMentorSettings,
  getMethodLabel,
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import { type MentorRegistrationPreviewHighlightSection } from '@/types/mentoring-registration';
import MentorMarkdownContent from './mentor-markdown-content';
import ReviewStars from './review-stars';

type PreviewHighlightSection = MentorRegistrationPreviewHighlightSection;

interface MentorDetailPageProps {
  mentor: MentorProfile;
  previewMode?: boolean;
  highlightedSections?: PreviewHighlightSection[];
}

const methodIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-18 w-18" />,
  phone: <Phone className="h-18 w-18" />,
  online: <Monitor className="h-18 w-18" />,
  offline: <Users className="h-18 w-18" />,
};

const methodSmallIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-16 w-16" />,
  phone: <Phone className="h-16 w-16" />,
  online: <Monitor className="h-16 w-16" />,
  offline: <Users className="h-16 w-16" />,
};

const methodDescriptionMap: Record<MentoringMethodType, string> = {
  note: '빠르게 질문하고\n싶을 때',
  phone: '간단하게 통화로\n상담하고 싶을 때',
  online: '화면 공유로\n심층 상담하고 싶을 때',
  offline: '직접 만나서\n깊이 상담하고 싶을 때',
};

const reviewMethodMap: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  phone: '전화상담',
  online: '온라인상담',
  offline: '대면상담',
};

export default function MentorDetailPage({
  mentor,
  previewMode,
  highlightedSections,
}: MentorDetailPageProps) {
  const isHighlighted = (section: PreviewHighlightSection) =>
    previewMode === true && (highlightedSections?.includes(section) ?? false);
  const mentorSettings = getMentorSettings(mentor);
  const jobTitleLabel = mentorSettings.jobTitle || mentor.role || '직무 미입력';
  const careerLabel = mentorSettings.careerYears || mentor.career || '경력 미입력';
  const enabledMethods = useMemo(() => {
    return getEnabledMentoringMethods(mentor);
  }, [mentor]);
  const interviewQuestions = mentorSettings.interviewQuestions.filter(
    (question) => question.trim().length > 0,
  );
  const metMenteeCount = mentor.menteeCount ?? mentor.mentoringCount;

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
    <div
      className={cn(
        'mx-auto w-full px-200 py-300 sm:px-300',
        !previewMode && 'max-w-[1280px] sm:py-500 xl:px-400 xl:py-600',
        previewMode && 'py-400',
      )}
    >
      {/* Breadcrumb */}
      <nav className="mb-400 flex items-center gap-75">
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

      <div
        className={cn(
          'grid grid-cols-1 gap-500',
          !previewMode && 'xl:grid-cols-[1fr_360px]',
        )}
      >
        {/* ─── 메인 컨텐츠 ─── */}
        <div className="min-w-0">
          {/* 헤드라인 + 기본 정보 */}
          <section
            className={cn(
              'border-border-subtle mb-500 border-b pb-500',
              isHighlighted('headline') && 'preview-section-highlight',
            )}
          >
            <h1 className="font-designer-24b text-text-strong mb-300 leading-snug sm:text-[30px]">
              {mentor.headline}
            </h1>

            <div className="flex flex-col gap-250 sm:flex-row sm:items-start sm:gap-400">
              {/* 좌: 프로필 이미지 + 이름 + 통계 */}
              <div className="flex-1">
                <div className="mb-75 flex items-start gap-200">
                  <Avatar
                    image={mentor.imageUrl}
                    alt={mentor.nickname}
                    size={48}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-designer-18b text-text-strong">
                      {mentor.nickname}
                    </p>
                    <p className="font-designer-14b text-text-brand mt-50">
                      {mentor.company}
                    </p>
                    <p className="font-designer-13r text-text-subtle mt-25">
                      {jobTitleLabel} · {careerLabel}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-100">
                  <ReviewStars rating={Math.floor(mentor.rating)} />
                  <span className="font-designer-14b text-text-strong">
                    {mentor.rating.toFixed(1)}
                  </span>
                  <span className="font-designer-12r text-text-subtlest">
                    ·
                  </span>
                  <span className="font-designer-13r text-text-subtle">
                    리뷰 {mentor.reviewCount}개
                  </span>
                  <span className="font-designer-12r text-text-subtlest">
                    ·
                  </span>
                  <span className="font-designer-13r text-text-subtle">
                    만난 멘티 {metMenteeCount}명
                  </span>
                  <span className="font-designer-12r text-text-subtlest">
                    ·
                  </span>
                  <span className="font-designer-13r text-text-subtle">
                    멘토링 {mentor.mentoringCount}건
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 멘토 소개 */}
          <section
            className={cn(
              'border-border-subtle mb-500 border-b pb-500',
              isHighlighted('description') && 'preview-section-highlight',
            )}
          >
            <h2 className="font-designer-18b text-text-strong mb-200">
              멘토 소개
            </h2>
            <MentorMarkdownContent
              content={mentorSettings.detailedDescription}
              className="mb-250"
              emptyMessage="멘토 소개가 아직 등록되지 않았습니다."
            />
            <div className="mb-200 flex flex-wrap gap-100">
              {mentorSettings.skillTags.map((tag) => (
                <Badge key={tag} color="blue" shape="round">
                  #{tag}
                </Badge>
              ))}
            </div>
            {mentorSettings.mentoringTitle && (
              <div className="rounded-150 bg-background-alternative p-200">
                <p className="font-designer-13r text-text-subtle leading-relaxed">
                  {mentorSettings.mentoringTitle}
                </p>
              </div>
            )}
          </section>

          {/* 상담 전 준비사항 */}
          {interviewQuestions.length > 0 && (
            <section
              className={cn(
                'border-border-subtle mb-500 border-b pb-500',
                isHighlighted('interview') && 'preview-section-highlight',
              )}
            >
              <h2 className="font-designer-18b text-text-strong mb-200">
                상담 전 준비사항
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

          {/* 상담 방법 선택 */}
          <section
            className={cn(
              'border-border-subtle mb-500 border-b pb-500',
              isHighlighted('methods') && 'preview-section-highlight',
            )}
          >
            <h2 className="font-designer-18b text-text-strong mb-75">
              상담을 통해 문제를 해결하세요.
            </h2>
            <p className="font-designer-13r text-text-subtlest mb-250">
              원하는 상담 방식을 선택하세요
            </p>

            {/* 개별 카드 */}
            <div className="flex flex-col gap-150">
              {enabledMethods.map((method) => {
                const option = mentor.methods[method];

                return (
                  <div
                    key={method}
                    className="rounded-150 border-border-subtle bg-background-default hover:bg-background-alternative flex items-center gap-200 border px-250 py-200 transition-colors"
                  >
                    {/* 아이콘 박스 */}
                    <div className="rounded-150 bg-background-alternative shrink-0 p-150">
                      <span className="text-text-brand flex">
                        {methodIconMap[method]}
                      </span>
                    </div>

                    {/* 유형명 + 설명 */}
                    <div className="min-w-0 flex-1">
                      <p className="font-designer-14b text-text-strong">
                        {option.label}
                      </p>
                      <p className="font-designer-12r text-text-subtlest mt-25">
                        {methodDescriptionMap[method].replaceAll('\n', ' ')} ·{' '}
                        {option.durationLabel}
                      </p>
                    </div>

                    {/* 가격 */}
                    <div className="flex shrink-0 items-center gap-200">
                      <p className="font-designer-16b text-text-strong">
                        {formatWon(option.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </section>

          {/* 사전 안내 */}
          {mentorSettings.preNotice.trim() && (
            <section
              className={cn(
                'border-border-subtle mb-500 border-b pb-500',
                isHighlighted('notice') && 'preview-section-highlight',
              )}
            >
              <h2 className="font-designer-18b text-text-strong mb-200">
                멘토링 사전 안내
              </h2>
              <p className="font-designer-14r text-text-subtle leading-loose whitespace-pre-line">
                {mentorSettings.preNotice}
              </p>
            </section>
          )}

          {/* 리뷰 */}
          <section>
            <div className="mb-75 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">
                멘토링 리뷰
              </h2>
              <div className="flex items-center gap-75">
                <ReviewStars rating={Math.floor(mentor.rating)} />
                <span className="font-designer-14b text-text-strong ml-50">
                  {mentor.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="font-designer-13r text-text-subtlest mb-250">
              리뷰 {mentor.reviewCount}개
            </p>

            {mentor.reviews.length === 0 ? (
              <div className="rounded-150 bg-background-alternative px-200 py-400 text-center">
                <p className="font-designer-14r text-text-subtle">
                  아직 등록된 리뷰가 없습니다.
                </p>
              </div>
            ) : (
              <div className="rounded-150 border-border-subtle overflow-hidden border">
                {mentor.reviews.map((review, idx) => (
                  <article
                    key={review.id}
                    className={cn(
                      'p-250',
                      idx !== 0 && 'border-border-subtle border-t',
                    )}
                  >
                    <div className="mb-150 flex items-start justify-between gap-100">
                      <div>
                        <div className="mb-100 flex items-center gap-100">
                          <p className="font-designer-14b text-text-default">
                            {review.authorName}
                          </p>
                          <Badge color="gray" shape="round">
                            {reviewMethodMap[review.method]}
                          </Badge>
                        </div>
                        <ReviewStars rating={review.rating} />
                      </div>
                      <p className="font-designer-12r text-text-subtlest shrink-0">
                        {review.createdAt}
                      </p>
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

        {/* ─── 우측 사이드바 ─── */}
        <aside
          className={cn(
            'h-fit',
            !previewMode && 'lg:sticky lg:top-[88px] lg:self-start',
          )}
        >
          <div className="rounded-200 border-border-subtle bg-background-default shadow-1 overflow-hidden border">
            {/* 이름 + 기본 정보 */}
            <div className="border-border-subtle border-b px-250 pt-250 pb-200">
              <div className="mb-150 flex items-center gap-150">
                <Avatar
                  image={mentor.imageUrl}
                  alt={mentor.nickname}
                  size={48}
                />
                <div className="min-w-0">
                  <p className="font-designer-16b text-text-strong truncate">
                    {mentor.nickname}
                  </p>
                  <p className="font-designer-13b text-text-brand truncate">
                    {mentor.company}
                  </p>
                </div>
              </div>
              <p className="font-designer-13r text-text-subtle mb-150">
                {jobTitleLabel} · {careerLabel}
              </p>
              <div className="flex flex-wrap items-center gap-75">
                <ReviewStars rating={Math.floor(mentor.rating)} />
                <span className="font-designer-13b text-text-strong">
                  {mentor.rating.toFixed(1)}
                </span>
                <span className="font-designer-12r text-text-subtlest">·</span>
                <span className="font-designer-12r text-text-subtle">
                  리뷰 {mentor.reviewCount}개
                </span>
                <span className="font-designer-12r text-text-subtlest">·</span>
                <span className="font-designer-12r text-text-subtle">
                  만난 멘티 {metMenteeCount}명
                </span>
                <span className="font-designer-12r text-text-subtlest">·</span>
                <span className="font-designer-12r text-text-subtle">
                  멘토링 {mentor.mentoringCount}건
                </span>
              </div>
            </div>

            {/* 직무 / 소속 / 경력 */}
            <div className="border-border-subtle border-b px-250 py-200">
              <div className="flex flex-col gap-100">
                <div className="grid grid-cols-[68px_1fr] items-start gap-75">
                  <span className="font-designer-12r text-text-subtlest pt-[2px]">
                    직무
                  </span>
                  <span className="font-designer-12r text-text-default">
                    {jobTitleLabel}
                  </span>
                </div>
                <div className="grid grid-cols-[68px_1fr] items-start gap-75">
                  <span className="font-designer-12r text-text-subtlest pt-[2px]">
                    소속
                  </span>
                  <span className="font-designer-12r text-text-default">
                    {mentor.company}
                  </span>
                </div>
                <div className="grid grid-cols-[68px_1fr] items-start gap-75">
                  <span className="font-designer-12r text-text-subtlest pt-[2px]">
                    경력
                  </span>
                  <span className="font-designer-12r text-text-default">
                    {careerLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* 방법 선택 */}
            <div className="border-border-subtle border-b p-250">
              <p className="font-designer-12r text-text-subtlest mb-150">
                상담 방식을 선택하세요
              </p>
              <div className="flex flex-col gap-100">
                {enabledMethods.map((method) => {
                  const option = mentor.methods[method];
                  const isSelected = selectedMethod === method;

                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={cn(
                        'rounded-150 flex w-full items-center justify-between border px-150 py-150 text-left transition-colors',
                        isSelected
                          ? 'border-border-brand bg-fill-brand-subtle-default'
                          : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
                      )}
                    >
                      <div className="flex items-center gap-75">
                        <span
                          className={cn(
                            'text-text-subtle shrink-0',
                            isSelected && 'text-text-brand',
                          )}
                        >
                          {methodSmallIconMap[method]}
                        </span>
                        <div>
                          <p className="font-designer-13b text-text-default">
                            {getMethodLabel(method)}
                          </p>
                          <p className="font-designer-11r text-text-subtlest">
                            {option.durationLabel}
                          </p>
                        </div>
                      </div>
                      <p className="font-designer-14b text-text-strong">
                        {formatWon(option.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 결제 CTA */}
            <div className="p-250">
              {/* 선택 요약 + 가격 강조 */}
              <div className="mb-200">
                <p className="font-designer-12r text-text-subtlest mb-75">
                  {selectedOption.label} · {selectedOption.durationLabel}
                </p>
                <p className="font-designer-22b text-text-strong">
                  {formatWon(selectedOption.price)}
                </p>
              </div>

              <Button
                color="primary"
                size="large"
                className="mb-200 w-full"
                onClick={(e) => {
                  e.preventDefault();
                  alert('아직 준비중인 기능입니다.');
                }}
              >
                결제 페이지로 이동
              </Button>

              {/* 수락 정책 */}
              <div className="mb-150 flex items-start gap-75">
                <Info className="text-text-subtlest mt-[2px] h-14 w-14 shrink-0" />
                <div>
                  <p className="font-designer-12b text-text-subtle mb-25">
                    {acceptancePolicy.title}
                  </p>
                  <p className="font-designer-11r text-text-subtlest leading-relaxed">
                    {acceptancePolicy.description}
                  </p>
                </div>
              </div>

              {/* 환불 안내 */}
              <div className="border-border-subtlest border-t pt-150">
                <div className="flex items-center justify-center gap-75">
                  <RotateCcw className="text-text-subtlest h-12 w-12 shrink-0" />
                  <p className="font-designer-11r text-text-subtlest leading-relaxed">
                    멘토링 시작 120시간 전까지 전액 환불 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
