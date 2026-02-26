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
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/ui/avatar';
import {
  formatWon,
  getLowestPriceOption,
  getMentorSettings,
} from '@/mocks/mentoring-mock-data';
import type { MentorCardProps } from '@/types/mentoring/directory-view';
import type { MentoringMethodType } from '@/types/mentoring/domain';

const methodTextMap: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  phone: '15분 전화상담',
  online: '온라인상담',
  offline: '대면상담',
};

const METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'phone',
  'online',
  'offline',
];

const methodLabelMap: Record<MentoringMethodType, string> = {
  note: 'text-text-brand',
  phone: 'text-text-brand',
  online: 'text-text-brand',
  offline: 'text-text-brand',
};

const methodIconMap: Record<MentoringMethodType, typeof MessageCircle> = {
  note: MessageCircle,
  phone: Phone,
  online: Monitor,
  offline: Users,
};

const MENTOR_CARD_HEIGHT_CLASS = 'h-500px';
const MAX_KEYWORD_COUNT = 6;

export default function MentorCard({ mentor }: MentorCardProps) {
  const router = useRouter();
  const mentorSettings = getMentorSettings(mentor);
  const mentoringTitle = mentorSettings.mentoringTitle || mentor.headline;
  const appealLine =
    mentorSettings.appealLine || mentorSettings.companyCategory;
  const keywords = Array.from(
    new Set([...mentorSettings.skillTags, ...mentor.tags]),
  )
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .slice(0, MAX_KEYWORD_COUNT);
  const jobTitleLabel = mentorSettings.jobTitle || mentor.role || '직무 미입력';
  const careerLabel =
    mentorSettings.careerYears || mentor.career || '경력 미입력';
  const metMenteeCount = mentor.menteeCount ?? mentor.mentoringCount;
  const lowestPriceOption = getLowestPriceOption(mentor);
  const fallbackPrices = [
    mentorSettings.notePrice,
    mentorSettings.phonePrice,
    mentorSettings.onlinePrice,
    mentorSettings.offlinePrice,
  ].filter((price): price is number => Number.isFinite(price) && price > 0);
  const fallbackLowestPrice =
    fallbackPrices.length > 0 ? Math.min(...fallbackPrices) : null;
  const lowestPrice = lowestPriceOption?.price ?? fallbackLowestPrice;
  const availableMethods = {
    note: mentor.methods.note.enabled !== false,
    phone: mentor.methods.phone.enabled !== false,
    online: mentor.methods.online.enabled !== false,
    offline: mentor.methods.offline.enabled !== false,
  } as const;

  const navigateDetail = () => {
    sendGTMEvent({
      event: 'mentor_profile_click',
      mentor_id: mentor.id,
      mentor_nickname: mentor.nickname,
      mentor_field: mentor.role,
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
        'cursor-pointer self-start overflow-hidden border border-[#E5E7EB] bg-white',
        MENTOR_CARD_HEIGHT_CLASS,
        'transition-all',
      )}
      role="button"
      tabIndex={0}
      onClick={navigateDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-full flex-col justify-between px-300 py-300">
        <div>
          <div className="mb-125 h-[58px]">
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
              <div className="mb-75 flex flex-col gap-25">
                <div className="flex min-w-0 items-center gap-125">
                  <Briefcase className="text-text-subtlest h-160 w-160 shrink-0" />
                  <span className="font-designer-13m text-text-subtle line-clamp-1">
                    {jobTitleLabel}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-125">
                  <TrendingUp className="text-text-subtlest h-160 w-160 shrink-0" />
                  <span className="font-designer-13m text-text-subtle line-clamp-1">
                    {careerLabel}
                  </span>
                </div>
              </div>
              <div className="inline-flex min-w-0 items-center gap-125">
                <Building2 className="text-text-brand h-160 w-160 shrink-0" />
                <span className="font-designer-13m text-text-brand line-clamp-1">
                  {appealLine}
                </span>
              </div>
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
                  상담 {metMenteeCount.toLocaleString()}명
                </span>
              </span>
            </div>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="mt-auto mb-0">
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
            keywords.length > 0 ? 'mt-250' : 'mt-auto',
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
            <p className="font-designer-13b text-text-default">
              최저가 {formatWon(lowestPrice)}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
