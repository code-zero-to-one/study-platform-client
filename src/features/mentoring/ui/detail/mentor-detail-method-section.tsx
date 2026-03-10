'use client';

import { ChevronDown, ChevronUp, MessageCircle, Monitor, Phone, Users } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
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

interface MethodDetail {
  summary: string;
  suitableCases: string;
  howItWorks: string;
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

const methodDetailMap: Record<MentoringMethodType, MethodDetail> = {
  note: {
    summary:
      '텍스트로 질문을 남기고(상황 설명, 링크/파일 첨부 가능), 멘토가 답변을 작성해주는 비동기 1:1 상담입니다.',
    suitableCases:
      '정리된 질문 1개에 대해 방향/피드백을 받고 싶을 때, 문서/코드/포폴 링크 기반으로 코멘트가 필요할 때.',
    howItWorks:
      '질문 작성 및 결제 후, 멘토가 답변을 남기며 대화 형태로 이어질 수 있습니다.',
  },
  simple: {
    summary: '짧은 시간 안에 핵심만 빠르게 정리하는 1:1 상담입니다.',
    suitableCases:
      '우선순위 결정, 학습/커리어 방향 1가지 선택, 면접 질문 1~2개 답변 정리, "지금 당장 뭘 해야 하는지" 빠른 확인.',
    howItWorks:
      '가능한 시간 중 일정 선택 후 예약하고, 정해진 시간에 전화로 상담합니다.',
  },
  deep: {
    summary:
      '온라인으로 연결해 자료를 보면서 깊게 파고드는 1:1 상담입니다(필요 시 화면 공유/문서 공유).',
    suitableCases:
      '이력서·포트폴리오·프로젝트 구조 개선, 코드 리뷰/리팩터링 방향, 기술 선택/설계 논의, 모의면접과 상세 피드백, 로드맵 수립.',
    howItWorks:
      '가능한 시간 중 일정 선택 후 예약하고, 정해진 시간에 온라인으로 상담합니다.',
  },
  offline: {
    summary: '오프라인에서 직접 만나 진행하는 1:1 상담입니다.',
    suitableCases:
      '현장 인터뷰 대비, 집중 코칭, 장시간 논의가 필요한 커리어/프로젝트 상담 등 직접 대화가 더 효과적인 경우.',
    howItWorks:
      '가능한 시간 중 일정 선택 후 예약하고, 정해진 시간에 지정된 장소에서 상담합니다.',
  },
};

export default function MentorDetailMethodSection({
  mentor,
  enabledMethods,
  isMethodsHighlighted,
}: MentorDetailMethodSectionProps) {
  const [expandedMethods, setExpandedMethods] = useState<Set<MentoringMethodType>>(new Set());

  const toggleMethod = (method: MentoringMethodType) => {
    setExpandedMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) {
        next.delete(method);
      } else {
        next.add(method);
      }
      return next;
    });
  };

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
          const detail = methodDetailMap[method];

          const isExpanded = expandedMethods.has(method);

          return (
            <div
              key={method}
              className="rounded-150 border-border-subtle bg-background-default hover:bg-background-alternative flex flex-col gap-200 border px-250 py-200 transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleMethod(method)}
                aria-expanded={isExpanded}
                aria-label={`${option.label} 상세 설명 ${isExpanded ? '접기' : '펼치기'}`}
                className="flex w-full cursor-pointer items-center gap-200 text-left"
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
                  <span className="text-text-subtle shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-18 w-18" />
                    ) : (
                      <ChevronDown className="h-18 w-18" />
                    )}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="rounded-125 border-border-subtle bg-fill-brand-subtle-default p-150">
                  <p className="font-designer-13b text-text-strong mb-75">
                    {detail.summary}
                  </p>
                  <p className="font-designer-13b text-text-strong mb-50">
                    이런 경우에 적합
                  </p>
                  <p className="font-designer-13r text-text-default leading-[1.6] mb-150">
                    {detail.suitableCases}
                  </p>
                  <p className="font-designer-13b text-text-strong mb-50">
                    진행 방식
                  </p>
                  <p className="font-designer-13r text-text-default leading-[1.6]">
                    {detail.howItWorks}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
