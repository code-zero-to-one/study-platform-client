'use client';

import {
  ArrowRight,
  Info,
  Lock,
  MessageCircle,
  Monitor,
  Phone,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import {
  formatWon,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  MENTORING_CHANGE_AND_NO_SHOW_GUIDE,
  MENTORING_REFUND_POLICY_GUIDE,
  getMentoringChannelGuide,
  getMentoringProgressCheckGuide,
  getMentoringResponseGuide,
} from '@/features/mentoring/model/mentoring-flow-policy';
import { getMentorPublicReadiness } from '@/features/mentoring/model/mentor-public-readiness';
import MentorProfileMetaList from '@/features/mentoring/ui/common/mentor-profile-meta-list';
import type {
  MentorProfile,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import ReviewStars from './review-stars';

interface MentorDetailSidebarCtaProps {
  mentor: MentorProfile;
  appealLine: string;
  companyLabel: string;
  jobTitleLabel: string;
  careerLabel: string;
  metMenteeCount?: number;
  displayReviewCount: number;
  enabledMethods: MentoringMethodType[];
  selectedMethod: MentoringMethodType;
  selectedOption: MentoringMethodOption;
  onSelectMethod: (method: MentoringMethodType) => void;
  previewMode?: boolean;
  detailLocked?: boolean;
}

const methodSmallIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-16 w-16" />,
  simple: <Phone className="h-16 w-16" />,
  deep: <Monitor className="h-16 w-16" />,
  offline: <Users className="h-16 w-16" />,
};

export default function MentorDetailSidebarCta({
  mentor,
  appealLine,
  companyLabel,
  jobTitleLabel,
  careerLabel,
  metMenteeCount,
  displayReviewCount,
  enabledMethods,
  selectedMethod,
  selectedOption,
  onSelectMethod,
  previewMode,
  detailLocked = false,
}: MentorDetailSidebarCtaProps) {
  const publicReadiness = getMentorPublicReadiness(mentor);
  const isApplicationReady = publicReadiness.isApplicationReady;
  const shouldShowMethodSelection = !detailLocked && enabledMethods.length > 0;
  const applyHref = `/mentoring/${mentor.id}/apply?type=${selectedMethod}`;
  const quickGuideItems = [
    {
      label: selectedMethod === 'note' ? '시작 기준' : '확인 기준',
      value: getMentoringResponseGuide(selectedMethod),
    },
    {
      label: '진행 채널',
      value: getMentoringChannelGuide(selectedMethod),
    },
    {
      label: '진행 확인',
      value: getMentoringProgressCheckGuide(selectedMethod),
    },
  ];

  return (
    <div className="rounded-200 border-border-subtle bg-background-default shadow-1 overflow-hidden border">
      <div className="border-border-subtle border-b px-250 pt-250 pb-200">
        <div className="flex items-start gap-225">
          <Avatar image={mentor.imageUrl} alt={mentor.nickname} size={80} />
          <div className="min-w-0 flex-1">
            <p className="font-designer-18b text-text-strong">
              {mentor.nickname}
            </p>
            <MentorProfileMetaList
              variant="sidebar"
              appealLine={appealLine}
              companyLabel={companyLabel}
              jobTitleLabel={jobTitleLabel}
              careerLabel={careerLabel}
              className="mt-75"
            />
          </div>
        </div>
        <div className="mt-125 flex flex-col gap-75">
          <div className="flex items-center gap-75">
            <ReviewStars rating={mentor.rating} />
            <span className="font-designer-13b text-text-strong">
              {mentor.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-75">
            <span className="font-designer-14b text-text-subtle">
              리뷰 {displayReviewCount}개
            </span>
            <span className="font-designer-12r text-text-subtlest">|</span>
            {metMenteeCount !== undefined ? (
              <>
                <span className="font-designer-14b text-text-subtle">
                  만난 멘티 {metMenteeCount}명
                </span>
                <span className="font-designer-12r text-text-subtlest">|</span>
              </>
            ) : null}
            <span className="font-designer-14b text-text-subtle">
              멘토링 {mentor.mentoringCount}건
            </span>
          </div>
        </div>
      </div>

      {shouldShowMethodSelection ? (
        <>
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
                    onClick={() => onSelectMethod(method)}
                    aria-pressed={isSelected}
                    style={
                      previewMode === true
                        ? { pointerEvents: 'auto' }
                        : undefined
                    }
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

          <div className="p-250">
            <div className="mb-200">
              <p className="font-designer-12r text-text-subtlest mb-75">
                {selectedOption.label} · {selectedOption.durationLabel}
              </p>
              <p className="font-designer-22b text-text-strong">
                {formatWon(selectedOption.price)}
              </p>
            </div>

            {isApplicationReady && previewMode !== true ? (
              <Button
                asChild
                color="primary"
                size="large"
                className="mb-150 w-full"
              >
                <Link href={applyHref}>
                  <ArrowRight className="h-16 w-16 shrink-0" />
                  신청/결제 진행하기
                </Link>
              </Button>
            ) : (
              <Button
                color={isApplicationReady ? 'primary' : 'secondary'}
                size="large"
                className="mb-150 w-full"
                disabled
              >
                {!isApplicationReady ? (
                  <Lock className="mr-75 h-16 w-16 shrink-0" />
                ) : null}
                {isApplicationReady
                  ? '신청/결제 진행하기'
                  : publicReadiness.ctaLabel}
              </Button>
            )}

            {!isApplicationReady ? (
              <div className="mb-150 flex items-start gap-75">
                <Info className="text-text-subtlest mt-[2px] h-14 w-14 shrink-0" />
                <p className="font-designer-12r text-text-subtlest leading-relaxed">
                  {publicReadiness.applyUnavailableMessage}
                </p>
              </div>
            ) : null}

            <div className="bg-background-alternative mb-150 rounded-150 p-150">
              <p className="font-designer-12b text-text-default mb-75">
                신청 전에 확인할 내용
              </p>
              <div className="space-y-75">
                {quickGuideItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-75">
                    <span className="font-designer-11m text-text-subtle mt-[1px] w-[48px] shrink-0">
                      {item.label}
                    </span>
                    <p className="font-designer-11r text-text-subtlest leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border-subtlest border-t pt-150">
              <p className="font-designer-11r text-text-subtlest text-center leading-relaxed">
                {MENTORING_REFUND_POLICY_GUIDE}
              </p>
              <p className="font-designer-11r text-text-subtlest mt-50 text-center leading-relaxed">
                {MENTORING_CHANGE_AND_NO_SHOW_GUIDE}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="p-250">
          <div className="rounded-150 border-border-subtle bg-background-alternative mb-200 border px-200 py-175">
            <p className="font-designer-14b text-text-default mb-50">
              {detailLocked
                ? publicReadiness.detailOverlayTitle
                : publicReadiness.applyUnavailableTitle}
            </p>
            <p className="font-designer-12r text-text-subtle leading-relaxed">
              {detailLocked
                ? publicReadiness.detailOverlayDescription
                : publicReadiness.applyUnavailableMessage}
            </p>
          </div>

          <Button color="secondary" size="large" className="w-full" disabled>
            <Lock className="mr-75 h-16 w-16 shrink-0" />
            {publicReadiness.ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
