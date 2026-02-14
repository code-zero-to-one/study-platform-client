'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { ExternalLink, MessageCircle, Phone, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, type MouseEvent } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  formatWon,
  getLowestPriceOption,
  getMentorSettings,
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';

interface MentorCardProps {
  mentor: MentorProfile;
}

const methodTextMap: Record<MentoringMethodType, string> = {
  chat: '채팅상담',
  call: '전화/온라인 상담',
  offline: '대면 컨설팅',
};

const getFieldLabel = (role: string) => {
  if (role.includes('프론트엔드')) {
    return '프론트엔드 개발';
  }

  if (role.includes('백엔드')) {
    return '백엔드 개발';
  }

  if (role.includes('게임')) {
    return '게임 개발';
  }

  return role;
};

const methodLabelMap: Record<MentoringMethodType, string> = {
  chat: 'text-text-brand',
  call: 'text-text-brand',
  offline: 'text-text-brand',
};

const methodIconMap: Record<MentoringMethodType, typeof MessageCircle> = {
  chat: MessageCircle,
  call: Phone,
  offline: Users,
};

export default function MentorCard({ mentor }: MentorCardProps) {
  const router = useRouter();
  const mentorSettings = getMentorSettings(mentor);
  const keywords = mentorSettings.skillTags.slice(0, 3);
  const lowestPriceOption = getLowestPriceOption(mentor);
  const availableMethods = {
    chat: mentor.methods.chat.enabled !== false,
    call: mentor.methods.call.enabled !== false,
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

  const navigateApply = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    sendGTMEvent({
      event: 'mentoring_help_request_click',
      mentor_id: mentor.id,
      mentor_nickname: mentor.nickname,
      mentor_field: mentor.role,
      location: 'mentoring_page',
    });

    const defaultType = availableMethods.chat
      ? 'chat'
      : availableMethods.call
        ? 'call'
        : 'offline';
    router.push(`/mentoring/${mentor.id}/apply?type=${defaultType}`);
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
        'cursor-pointer overflow-hidden border border-[#E5E7EB] bg-white',
        'transition-all',
      )}
      role="button"
      tabIndex={0}
      onClick={navigateDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex h-[180px] items-center justify-center bg-linear-to-br from-[#F87171] to-[#EC4899]">
        {mentor.imageUrl ? (
          <Image
            src={mentor.imageUrl}
            alt={mentor.nickname}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full bg-white/20">
            <UserAvatar size={56} image="" alt={mentor.nickname} />
          </div>
        )}
      </div>

      <div className="px-300 py-200">
        <div className="mb-100">
          <Badge color="blue">
            {mentorSettings.categories[0] ?? getFieldLabel(mentor.role)}
          </Badge>
        </div>

        <div className="mb-100 flex items-center gap-100">
          <h3 className="font-designer-20b text-text-default truncate">
            {mentor.nickname}
          </h3>
          <ExternalLink className="text-text-subtle h-16 w-16 shrink-0" />
        </div>

        <p className="font-designer-16r text-text-subtle mb-150 line-clamp-2">
          {mentorSettings.mentoringTitle}
        </p>

        <p className="font-designer-13r text-text-subtle mb-150 line-clamp-1">
          {mentor.role} · {mentor.career}
        </p>

        {keywords.length > 0 && (
          <div className="mb-200 flex flex-wrap gap-x-300 gap-y-100">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="font-designer-16r text-text-subtle"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mb-200 flex items-center gap-200">
          {(Object.keys(availableMethods) as MentoringMethodType[]).map(
            (method) => {
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
            },
          )}
        </div>

        {lowestPriceOption && (
          <div className="rounded-100 bg-background-alternative mb-200 px-125 py-100">
            <p className="font-designer-13b text-text-default">
              최저가 {formatWon(lowestPriceOption.price)} (
              {lowestPriceOption.durationLabel})
            </p>
          </div>
        )}

        <Button
          color="primary"
          size="medium"
          className="w-full"
          onClick={navigateApply}
        >
          도움 요청
        </Button>
      </div>
    </article>
  );
}
