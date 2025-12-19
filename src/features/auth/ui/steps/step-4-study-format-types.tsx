// 4. 관심 스터디 선택 단계

import { ArrowLeft, Rocket } from 'lucide-react';
import { cn } from "@/components/ui/(shadcn)/lib/utils";
import type { StudyFormatTypeResponse } from '@/features/my-page/api/types';
import { useStudyFormatTypesQuery } from '@/features/my-page/model/use-update-user-profile-mutation';
import { StepHeader } from './step-header';

export function StudyFormatTypesStep({ data, updateData, onNext }: any) {
  const { data: studyFormatTypes = [] } = useStudyFormatTypesQuery();

  // 배열 보장 및 안전성 처리
  const currentTypes = Array.isArray(data.studyFormatTypes) ? data.studyFormatTypes : [];

  // StudyFormatTypeResponse: { "studyFormatType": "PROJECT", "description": "프로젝트" }
  const handleSelect = (value: string) => {
    const next = currentTypes.includes(value)
      ? currentTypes.filter((t: string) => t !== value)
      : [...currentTypes, value].slice(0, 5);
    updateData('studyFormatTypes', next);
  };
  
  return (
    <div className="flex flex-col h-full gap-300">
      <StepHeader 
        icon={Rocket}
        title={<>어떤 활동을 하고 싶으세요?</>}
        subtitle="최대 5개까지 선택할 수 있어요"
      />

      <div className="flex-1 flex flex-col gap-150 max-w-[400px] mx-auto w-full">
        {studyFormatTypes.map((studyFormatTypeResponse: StudyFormatTypeResponse) => {
          const isSelected = currentTypes.includes(studyFormatTypeResponse.studyFormatType);

          return (
            <button
              key={studyFormatTypeResponse.studyFormatType}
              onClick={() => handleSelect(studyFormatTypeResponse.studyFormatType)}
              className={cn(
                "w-full p-200 rounded-100 text-left font-designer-16m border flex items-center justify-between group transition-all duration-200",
                isSelected
                  ? "border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-md scale-[1.02]"
                  : "border-border-default bg-background-default text-text-default hover:border-border-brand hover:bg-fill-brand-subtle-default hover:shadow-sm hover:scale-[1.01]"
              )}
            >
              <span>{studyFormatTypeResponse.description}</span>
              <ArrowLeft className={cn(
                "w-[16px] h-[16px] rotate-180 transition-all duration-300",
                isSelected
                  ? "opacity-100 text-text-brand translate-x-0" 
                  : "opacity-0 group-hover:opacity-50 -translate-x-100 group-hover:translate-x-0"
              )} />
            </button>
          );
        })}
        <button
          onClick={onNext}
          className="font-designer-14m text-text-subtlest hover:text-text-subtle underline underline-offset-4 py-100 transition-colors w-full"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}