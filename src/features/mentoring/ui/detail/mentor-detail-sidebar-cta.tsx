'use client';

import { MessageCircle, Monitor, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
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
import type {
  MentorProfile,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import ReviewStars from './review-stars';

interface MentorDetailSidebarCtaProps {
  mentor: MentorProfile;
  profileSummaryLine: string;
  metMenteeCount: number;
  enabledMethods: MentoringMethodType[];
  selectedMethod: MentoringMethodType;
  selectedOption: MentoringMethodOption;
  onSelectMethod: (method: MentoringMethodType) => void;
  headlineBadges: Array<{
    key: string;
    value: string;
    color: 'green' | 'gray';
  }>;
}

const methodSmallIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-16 w-16" />,
  simple: <Phone className="h-16 w-16" />,
  deep: <Monitor className="h-16 w-16" />,
  offline: <Users className="h-16 w-16" />,
};

export default function MentorDetailSidebarCta({
  mentor,
  profileSummaryLine,
  metMenteeCount,
  enabledMethods,
  selectedMethod,
  selectedOption,
  onSelectMethod,
  headlineBadges,
}: MentorDetailSidebarCtaProps) {
  const applyHref = `/mentoring/${mentor.id}/apply?type=${selectedMethod}`;
  const channelGuide = getMentoringChannelGuide(selectedMethod);
  const progressGuide = getMentoringProgressCheckGuide(selectedMethod);
  const primaryCtaLabel = '신청하기';
  const quickGuideItems = [
    {
      label: selectedMethod === 'note' ? '시작 기준' : '확인 기준',
      value: getMentoringResponseGuide(selectedMethod),
    },
    {
      label: '진행 채널',
      value: channelGuide,
    },
    {
      label: '진행 확인',
      value: progressGuide,
    },
  ];

  return (
    <div className="rounded-200 border-border-subtle bg-background-default shadow-1 overflow-hidden border">
      <div className="border-border-subtle border-b px-250 pt-250 pb-200">
        <div className="mb-150 flex items-center gap-150">
          <Avatar image={mentor.imageUrl} alt={mentor.nickname} size={48} />
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
          {profileSummaryLine}
        </p>
        {headlineBadges.length > 0 && (
          <div className="mb-150 flex flex-wrap items-center gap-75">
            {headlineBadges.map((badge) => (
              <Badge key={badge.key} color={badge.color} shape="round">
                {badge.value}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-50">
          <div className="flex items-center gap-75">
            <ReviewStars rating={Math.floor(mentor.rating)} />
            <span className="font-designer-13b text-text-strong">
              {mentor.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col gap-25">
            <span className="font-designer-12r text-text-subtle">
              리뷰 {mentor.reviewCount}개
            </span>
            <span className="font-designer-12r text-text-subtle">
              만난 멘티 {metMenteeCount}명
            </span>
            <span className="font-designer-12r text-text-subtle">
              멘토링 {mentor.mentoringCount}건
            </span>
          </div>
        </div>
      </div>

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

        <Button asChild color="primary" size="large" className="mb-150 w-full">
          <Link href={applyHref}>{primaryCtaLabel}</Link>
        </Button>

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
    </div>
  );
}
