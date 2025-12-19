// 3. 경력 선택 단계
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from "@/components/ui/(shadcn)/lib/utils";
import type { CareerResponse } from '@/features/my-page/api/types';
import { useCareersQuery } from '@/features/my-page/model/use-update-user-profile-mutation';
import { StepHeader } from './step-header';

export function CareerStep({ data, updateData, onNext }: any) {
    const { data: careers = [] } = useCareersQuery();

    // CareerResponse: { "career": "BEGINNER", "description": "입문자" }
    const handleSelect = (value: string) => {
      updateData('career', value);
      setTimeout(onNext, 200);
    };
  
    return (
      <div className="flex flex-col h-full gap-200">
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
           <div className="inline-flex items-center gap-100 bg-fill-brand-subtle-default px-150 py-50 rounded-full mb-200">
             <span className="font-designer-13b text-text-brand">거의 다 왔어요!</span>
           </div>
          <StepHeader 
            icon={TrendingUp}
            title={<>업무 경력은 어느 정도 되시나요?</>}
            subtitle="비슷한 단계의 분들과 스터디를 추천해드릴게요"
          />
        </div>
  
        <div className="flex-1 flex flex-col gap-150 max-w-[400px] mx-auto w-full pb-200">
          {careers.map((careerResponse: CareerResponse) => (
            <button
              key={careerResponse.career}
              onClick={() => handleSelect(careerResponse.career)}
              className={cn(
                "w-full p-200 rounded-100 text-left font-designer-16m border flex items-center justify-between group transition-all duration-200",
                data.career === careerResponse.career
                  ? "border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-md scale-[1.02]"
                  : "border-border-default bg-background-default text-text-default hover:border-border-brand hover:bg-fill-brand-subtle-default hover:shadow-sm hover:scale-[1.01]"
              )}
            >
              <span>{careerResponse.description}</span>
              <ArrowLeft className={cn(
                "w-[16px] h-[16px] rotate-180 transition-all duration-300",
                data.career === careerResponse.career 
                  ? "opacity-100 text-text-brand translate-x-0" 
                  : "opacity-0 group-hover:opacity-50 -translate-x-100 group-hover:translate-x-0"
              )} />
            </button>
          ))}
        </div>
      </div>
    );
  }