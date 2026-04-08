// 3. 경력 선택 단계
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useCareersQuery } from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { CareerResponse } from '@/types/api/my-page.types';
import { StepHeader } from './step-header';

interface CareerStepProps {
  data: { career?: string };
  updateData: (field: string, value: unknown) => void;
  onNext: () => void;
}

export function CareerStep({ data, updateData, onNext }: CareerStepProps) {
  const { data: careers = [] } = useCareersQuery();

  // CareerResponse: { "career": "BEGINNER", "description": "입문자" }
  const handleSelect = (value: string) => {
    updateData('career', value);
    setTimeout(onNext, 200);
  };

  return (
    <div className="flex h-full flex-col gap-200">
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="bg-fill-brand-subtle-default mb-200 inline-flex items-center gap-100 rounded-full px-150 py-50">
          <span className="font-designer-13b text-text-brand">
            거의 다 왔어요!
          </span>
        </div>
        <StepHeader
          icon={TrendingUp}
          title={<>업무 경력은 어느 정도 되시나요?</>}
          subtitle="비슷한 단계의 분들과 스터디를 추천해드릴게요"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col gap-150 pb-200">
        {careers.map((careerResponse: CareerResponse) => (
          <button
            key={careerResponse.career}
            onClick={() => handleSelect(careerResponse.career)}
            className={cn(
              'rounded-100 font-designer-16m group flex w-full items-center justify-between border p-200 text-left transition-all duration-200',
              data.career === careerResponse.career
                ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand scale-[1.02] shadow-md'
                : 'border-border-default bg-background-default text-text-default hover:border-border-brand hover:bg-fill-brand-subtle-default hover:scale-[1.01] hover:shadow-sm',
            )}
          >
            <span>{careerResponse.description}</span>
            <ArrowLeft
              className={cn(
                'h-[16px] w-[16px] rotate-180 transition-all duration-300',
                data.career === careerResponse.career
                  ? 'text-text-brand translate-x-0 opacity-100'
                  : '-translate-x-100 opacity-0 group-hover:translate-x-0 group-hover:opacity-50',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
