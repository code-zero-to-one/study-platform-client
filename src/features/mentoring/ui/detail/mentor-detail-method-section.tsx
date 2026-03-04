'use client';

import { MessageCircle, Monitor, Phone, Users } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { formatWon } from '@/features/mentoring/model/mentor-profile-utils';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';

interface MentorDetailMethodSectionProps {
  mentor: MentorProfile;
  enabledMethods: MentoringMethodType[];
  isMethodsHighlighted: boolean;
}

const methodIconMap: Record<MentoringMethodType, ReactNode> = {
  note: <MessageCircle className="h-18 w-18" />,
  simple: <Phone className="h-18 w-18" />,
  deep: <Monitor className="h-18 w-18" />,
  offline: <Users className="h-18 w-18" />,
};

const methodDescriptionMap: Record<MentoringMethodType, string> = {
  note: '빠르게 질문하고\n싶을 때',
  simple: '짧은 온라인 미팅으로\n핵심만 점검하고 싶을 때',
  deep: '화면 공유로\n심층 상담하고 싶을 때',
  offline: '직접 만나서\n깊이 상담하고 싶을 때',
};

export default function MentorDetailMethodSection({
  mentor,
  enabledMethods,
  isMethodsHighlighted,
}: MentorDetailMethodSectionProps) {
  return (
    <section
      data-preview-section="methods"
      className={cn(
        'border-border-subtle mb-500 border-b pb-500',
        isMethodsHighlighted && 'preview-section-highlight',
      )}
    >
      <h2 className="font-designer-18b text-text-strong mb-75">
        상담을 통해 문제를 해결하세요.
      </h2>
      <p className="font-designer-13r text-text-subtlest mb-250">
        원하는 상담 방식을 선택하세요
      </p>

      <div className="flex flex-col gap-150">
        {enabledMethods.map((method) => {
          const option = mentor.methods[method];

          return (
            <div
              key={method}
              className="rounded-150 border-border-subtle bg-background-default hover:bg-background-alternative flex items-center gap-200 border px-250 py-200 transition-colors"
            >
              <div className="rounded-150 bg-background-alternative shrink-0 p-150">
                <span className="text-text-brand flex">
                  {methodIconMap[method]}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-designer-14b text-text-strong">
                  {option.label}
                </p>
                <p className="font-designer-12r text-text-subtlest mt-25">
                  {methodDescriptionMap[method].replaceAll('\n', ' ')} ·{' '}
                  {option.durationLabel}
                </p>
              </div>

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
  );
}
