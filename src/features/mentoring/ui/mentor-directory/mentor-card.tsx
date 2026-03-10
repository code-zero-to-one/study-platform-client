'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import {
  Briefcase,
  Building2,
  MessageCircle,
  Monitor,
  Phone,
  Star,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import {
  formatWon,
  getMentorDisplayTitle,
  getLowestPriceOption,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
import type { MentorCardProps } from '@/types/mentoring/directory-view';
import type { MentoringMethodType } from '@/types/mentoring/domain';

const methodTextMap: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  simple: '간편상담',
  deep: '심층상담',
  offline: '대면상담',
};

const METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'simple',
  'deep',
  'offline',
];

const methodLabelMap: Record<MentoringMethodType, string> = {
  note: 'text-text-brand',
  simple: 'text-text-brand',
  deep: 'text-text-brand',
  offline: 'text-text-brand',
};

const methodIconMap: Record<MentoringMethodType, typeof MessageCircle> = {
  note: MessageCircle,
  simple: Phone,
  deep: Monitor,
  offline: Users,
};

const MAX_KEYWORD_COUNT = 6;

export default function MentorCard({ mentor }: MentorCardProps) {
  const router = useRouter();
  const mentorSettings = getMentorSettings(mentor);
  const mentoringTitle = getMentorDisplayTitle(mentor);
  const appealLine = mentorSettings.appealLine.trim();
  const jobGroupLabel = mentorSettings.jobGroup.trim();
  const jobTitleLabel = mentorSettings.jobTitle.trim();
  const topHeadlineBadgeLabel = jobGroupLabel;
  const keywords = Array.from(
    new Set([...mentorSettings.skillTags, ...mentor.tags]),
  )
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .slice(0, MAX_KEYWORD_COUNT);
  const careerLabel = mentorSettings.careerYears.trim();
  const lowestPriceOption = getLowestPriceOption(mentor);
  const lowestPrice = lowestPriceOption?.price ?? null;
  const availableMethods = {
    note: mentor.methods.note.enabled === true,
    simple: mentor.methods.simple.enabled === true,
    deep: mentor.methods.deep.enabled === true,
    offline: mentor.methods.offline.enabled === true,
  } as const;

  const navigateDetail = () => {
    sendGTMEvent({
      event: 'mentor_profile_click',
      mentor_id: mentor.id,
      mentor_nickname: mentor.nickname,
      mentor_field: jobGroupLabel,
      location: 'mentoring_page',
    });

    router.push(`/mentoring/${mentor.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    navigateDetail();
  };

  return (
    <article
      className={cn(
        'hover:shadow-2 hover:border-border-brand rounded-150',
        'h-full cursor-pointer overflow-hidden border border-[#E5E7EB] bg-white',
        'transition-all',
      )}
      role="button"
      tabIndex={0}
      onClick={navigateDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-full flex-col justify-center px-300 py-300">
        <div>
          {topHeadlineBadgeLabel.length > 0 && (
            <div className="mb-100">
              <Badge
                color="primary"
                shape="round"
                className="font-designer-12b px-125 py-75"
              >
                {topHeadlineBadgeLabel}
              </Badge>
            </div>
          )}
          <div className="mb-125">
            <h3 className="font-designer-18b text-text-default line-clamp-2 break-words">
              {mentoringTitle}
            </h3>
          </div>

          <div className="mb-150 flex items-start gap-125">
            <UserAvatar
              image={mentor.imageUrl?.trim()}
              alt={mentor.nickname}
              size={86}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-designer-16m text-text-default mb-50 line-clamp-1">
                {mentor.nickname}
              </p>
              {jobTitleLabel.length > 0 && (
                <div className="flex min-w-0 items-center gap-125">
                  <Briefcase className="text-text-subtlest h-160 w-160 shrink-0" />
                  <span className="font-designer-13m text-text-subtle line-clamp-1">
                    {jobTitleLabel}
                  </span>
                </div>
              )}
              <div className="mt-75">
                <div className="flex min-w-0 items-center gap-125">
                  <TrendingUp className="text-text-subtlest h-160 w-160 shrink-0" />
                  <span className="font-designer-13m text-text-subtle line-clamp-1">
                    {careerLabel}
                  </span>
                </div>
              </div>
              {appealLine.length > 0 && (
                <div className="mt-75 inline-flex min-w-0 items-center gap-125">
                  <Building2 className="text-text-brand h-160 w-160 shrink-0" />
                  <span className="font-designer-13m text-text-brand line-clamp-1">
                    {appealLine}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-125 border-border-subtle bg-background-default px-150 py-100">
            <div className="grid grid-cols-2 items-center">
              <span className="inline-flex items-center justify-center gap-50 whitespace-nowrap">
                <Star className="text-text-warning h-[14px] w-[14px] fill-current" />
                <span className="font-designer-15m text-text-default">
                  {mentor.rating.toFixed(1)} · 후기{' '}
                  {mentor.reviewCount.toLocaleString()}
                </span>
              </span>
              <span className="inline-flex items-center justify-center gap-50 pl-100 whitespace-nowrap">
                <UserRound className="text-text-subtle h-[14px] w-[14px]" />
                <span className="font-designer-15m text-text-default">
                  상담 {mentor.mentoringCount.toLocaleString()}건
                </span>
              </span>
            </div>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="mt-150 mb-0">
            <div className="rounded-125 bg-background-alternative px-150 py-125">
              <div className="flex max-h-[50px] flex-wrap gap-x-200 gap-y-75 overflow-hidden">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    title={`#${keyword}`}
                    className="font-designer-14m text-text-subtle max-w-[130px] truncate"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            'mb-250 grid grid-cols-2 gap-x-200 gap-y-100',
            keywords.length > 0 ? 'mt-150' : 'mt-200',
          )}
        >
          {METHOD_ORDER.map((method) => {
            const Icon = methodIconMap[method];
            const isEnabled = availableMethods[method];

            return (
              <div key={method} className="flex items-center gap-100">
                <Icon
                  className={cn(
                    'h-[20px] w-[20px]',
                    isEnabled ? methodLabelMap[method] : 'text-text-subtlest',
                  )}
                />
                <span
                  className={cn(
                    'font-designer-12r',
                    isEnabled ? 'text-text-default' : 'text-text-subtlest',
                  )}
                >
                  {methodTextMap[method]}
                </span>
              </div>
            );
          })}
        </div>

        {lowestPrice !== null && (
          <div className="rounded-100 bg-background-alternative px-125 py-100">
            <p className="font-designer-13b text-text-subtlest">
              최저가 {formatWon(lowestPrice)}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
