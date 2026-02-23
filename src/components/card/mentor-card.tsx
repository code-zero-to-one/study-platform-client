'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import {
  CalendarCheck2,
  MessageCircle,
  MessageSquareText,
  Monitor,
  Phone,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import {
  formatWon,
  getLowestPriceOption,
  getMentorSettings,
} from '@/mocks/mentoring-mock-data';
import type {
  MentorCardProps,
  MentoringMethodType,
} from '@/types/mentoring';

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
    .slice(0, 5);
  const jobTitleLabel = mentorSettings.jobTitle || mentor.role || '직무 미입력';
  const careerLabel =
    mentorSettings.careerYears || mentor.career || '경력 미입력';
  const metMenteeCount = mentor.menteeCount ?? mentor.mentoringCount;
  const lowestPriceOption = getLowestPriceOption(mentor);
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
        'transition-all',
      )}
      role="button"
      tabIndex={0}
      onClick={navigateDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="px-300 py-225">
        <div className="mb-125">
          <h3 className="font-designer-18b text-text-default break-words">
            {mentoringTitle}
          </h3>
        </div>

        <div className="mb-150 flex items-start gap-125">
          <UserAvatar
            image={mentor.imageUrl?.trim()}
            alt={mentor.nickname}
            size={52}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-designer-14m text-text-subtle mb-25 line-clamp-1">
              {mentor.nickname}
            </p>
            <p className="font-designer-13r text-text-subtle mb-75 line-clamp-1">
              {jobTitleLabel} · {careerLabel}
            </p>
            <Badge color="green" shape="round">
              {appealLine}
            </Badge>
          </div>
        </div>

        <div className="mb-150 flex flex-wrap items-center gap-x-150 gap-y-75">
          <span className="inline-flex items-center gap-50">
            <Star className="text-text-warning h-14 w-14 fill-current" />
            <span className="font-designer-15b text-text-default">
              {mentor.rating.toFixed(1)}
            </span>
          </span>
          <span className="inline-flex items-center gap-50">
            <MessageSquareText className="text-text-subtle h-14 w-14" />
            <span className="font-designer-15b text-text-default">
              {mentor.reviewCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-50">
            <UserRound className="text-text-subtle h-14 w-14" />
            <span className="font-designer-15b text-text-default">
              {metMenteeCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-50">
            <CalendarCheck2 className="text-text-subtle h-14 w-14" />
            <span className="font-designer-15b text-text-default">
              {mentor.mentoringCount}
            </span>
          </span>
        </div>

        {keywords.length > 0 && (
          <div className="rounded-125 bg-background-alternative mb-200 flex flex-wrap gap-x-200 gap-y-75 px-150 py-125">
            {keywords.map((keyword) => (
              <span key={keyword} className="font-designer-12r text-text-subtle">
                #{keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mb-200 grid grid-cols-2 gap-x-200 gap-y-100">
          {METHOD_ORDER.map((method) => {
            const Icon = methodIconMap[method];
            const isEnabled = availableMethods[method];

            return (
              <div key={method} className="flex items-center gap-100">
                <Icon
                  className={cn(
                    'h-20 w-20',
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

        {lowestPriceOption && (
          <div className="rounded-100 bg-background-alternative px-125 py-100">
            <p className="font-designer-13b text-text-default">
              최저가 {formatWon(lowestPriceOption.price)} (
              {lowestPriceOption.durationLabel})
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
