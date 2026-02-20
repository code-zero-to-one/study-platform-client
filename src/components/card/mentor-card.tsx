'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import {
  ExternalLink,
  MessageCircle,
  Monitor,
  Phone,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
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

const MOCK_MENTOR_IMAGE_PATHS = [
  '/images/mock-mentor-1.svg',
  '/images/mock-mentor-2.svg',
  '/images/mock-mentor-3.svg',
  '/images/mock-mentor-4.svg',
] as const;

const getMockMentorImagePath = (mentorId: number) => {
  const index = Math.abs(mentorId) % MOCK_MENTOR_IMAGE_PATHS.length;

  return MOCK_MENTOR_IMAGE_PATHS[index];
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
  const keywords = mentorSettings.skillTags.slice(0, 3);
  const lowestPriceOption = getLowestPriceOption(mentor);
  const mockImagePath = getMockMentorImagePath(mentor.id);
  const normalizedImageUrl = mentor.imageUrl?.trim();
  const [isImageError, setIsImageError] = useState(false);
  const mentorImageUrl =
    !isImageError && normalizedImageUrl ? normalizedImageUrl : mockImagePath;
  const availableMethods = {
    note: mentor.methods.note.enabled !== false,
    phone: mentor.methods.phone.enabled !== false,
    online: mentor.methods.online.enabled !== false,
    offline: mentor.methods.offline.enabled !== false,
  } as const;

  useEffect(() => {
    setIsImageError(false);
  }, [mentor.id, normalizedImageUrl]);

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
        'cursor-pointer overflow-hidden border border-[#E5E7EB] bg-white',
        'transition-all',
      )}
      role="button"
      tabIndex={0}
      onClick={navigateDetail}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-background-alternative relative h-[180px]">
        <Image
          src={mentorImageUrl}
          alt={mentor.nickname}
          fill
          className="object-cover"
          onError={() => {
            setIsImageError(true);
          }}
        />
      </div>

      <div className="px-300 py-225">
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
