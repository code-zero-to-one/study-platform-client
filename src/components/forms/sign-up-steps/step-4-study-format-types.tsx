// 4. 관심 스터디 선택 단계

import { ArrowLeft, Rocket } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { useStudyFormatTypesQuery } from '@/hooks/queries/use-update-user-profile-mutation';
import type { StudyFormatTypeResponse } from '@/types/api/my-page.types';
import { StepHeader } from './step-header';

export function StudyFormatTypesStep({ data, updateData, onNext }: any) {
  const { data: studyFormatTypes = [] } = useStudyFormatTypesQuery();

  // 배열 보장 및 안전성 처리
  const currentTypes = Array.isArray(data.studyFormatTypes)
    ? data.studyFormatTypes
    : [];

  // StudyFormatTypeResponse: { "studyFormatType": "PROJECT", "description": "프로젝트" }
  const handleSelect = (value: string) => {
    const next = currentTypes.includes(value)
      ? currentTypes.filter((t: string) => t !== value)
      : [...currentTypes, value].slice(0, 5);
    updateData('studyFormatTypes', next);
  };

  return (
    <div className="flex h-full flex-col gap-300">
      <StepHeader
        icon={Rocket}
        title={<>어떤 활동을 하고 싶으세요?</>}
        subtitle="최대 5개까지 선택할 수 있어요"
      />

      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col gap-150">
        {studyFormatTypes.map(
          (studyFormatTypeResponse: StudyFormatTypeResponse) => {
            const isSelected = currentTypes.includes(
              studyFormatTypeResponse.studyFormatType,
            );

            return (
              <button
                key={studyFormatTypeResponse.studyFormatType}
                onClick={() =>
                  handleSelect(studyFormatTypeResponse.studyFormatType)
                }
                className={cn(
                  'rounded-100 font-designer-16m group flex w-full items-center justify-between border p-200 text-left transition-all duration-200',
                  isSelected
                    ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand scale-[1.02] shadow-md'
                    : 'border-border-default bg-background-default text-text-default hover:border-border-brand hover:bg-fill-brand-subtle-default hover:scale-[1.01] hover:shadow-sm',
                )}
              >
                <span>{studyFormatTypeResponse.description}</span>
                <ArrowLeft
                  className={cn(
                    'h-[16px] w-[16px] rotate-180 transition-all duration-300',
                    isSelected
                      ? 'text-text-brand translate-x-0 opacity-100'
                      : '-translate-x-100 opacity-0 group-hover:translate-x-0 group-hover:opacity-50',
                  )}
                />
              </button>
            );
          },
        )}
        <button
          onClick={onNext}
          className="font-designer-14m text-text-subtlest hover:text-text-subtle w-full py-100 underline underline-offset-4 transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
