// 2. 직무 선택 단계
import { useMemo } from 'react';
import { StepHeader } from './step-header';
import { cn } from "@/shared/shadcn/lib/utils";
import { JOB_OPTIONS } from '@/features/auth/const/signup-options';
import { Briefcase } from 'lucide-react';

export function JobStep({ data, updateData, onNext }: any) {
    const jobGroups = useMemo(() => {
      const groups: Record<string, { label: string; value: string }[]> = {};
      JOB_OPTIONS.forEach((option) => {
        const [groupName, detailName] = option.label.includes(' - ')
          ? option.label.split(' - ')
          : ['기타', option.label];
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push({
          label: detailName || option.label,
          value: option.value,
        });
      });
      return groups;
    }, []);
  
    const handleSelect = (value: string) => {
      updateData('job', value);
      setTimeout(onNext, 200);
    };
  
    return (
      <div className="flex flex-col h-full gap-300">
        <StepHeader 
          icon={Briefcase}
          title={<>현재 어떤 일을<br/>하고 계신가요?</>}
          subtitle="딱 맞는 스터디를 추천해드릴게요"
        />
  
        <div className="flex-1 flex flex-col gap-400 overflow-y-auto -mx-200 px-200 pb-200">
          {Object.entries(jobGroups).map(([groupName, options]) => (
            <div key={groupName} className="flex flex-col gap-150">
              <h3 className="font-designer-13b text-text-subtlest uppercase tracking-wider">
                {groupName}
              </h3>
              <div className="grid grid-cols-2 gap-100">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "p-150 rounded-100 font-designer-14m text-left border transition-all duration-200",
                      "hover:border-border-brand hover:bg-fill-brand-subtle-default hover:-translate-y-[2px]",
                      data.job === option.value 
                        ? "border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-sm" 
                        : "border-border-default bg-background-default text-text-default"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }