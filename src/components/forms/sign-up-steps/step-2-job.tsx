// 2. 직무 선택 단계
import { Briefcase } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useJobsQuery } from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { JobResponse } from '@/types/api/my-page.types';
import { StepHeader } from './step-header';

interface JobStepProps {
  data: { jobs?: string[] };
  updateData: (field: string, value: unknown) => void;
  onNext: () => void;
}

export function JobStep({ data, updateData, onNext }: JobStepProps) {
  const { data: jobs = [] } = useJobsQuery();

  const jobGroups = useMemo(() => {
    const groups: Record<string, JobResponse[]> = {};
    jobs.forEach((jobResponse: JobResponse) => {
      const parts = jobResponse.job.split('_');
      let groupName = '기타';

      if (parts.length >= 2 && parts[0] === 'IT') {
        groupName = parts[1];
      }

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(jobResponse);
    });

    return groups;
  }, [jobs]);

  const selectedJobs = Array.isArray(data.jobs) ? data.jobs : [];

  const handleSelect = (value: string) => {
    const next = selectedJobs.includes(value)
      ? selectedJobs.filter((j: string) => j !== value)
      : [...selectedJobs, value].slice(0, 5); // 최대 5개까지 선택 가능
    updateData('jobs', next);
  };

  return (
    <div className="flex h-full flex-col gap-300">
      <StepHeader
        icon={Briefcase}
        title={<>어떤 분야에 관심이 있으신가요?</>}
        subtitle="딱 맞는 스터디와 멤버들을 추천해드릴게요 (최대 5개 선택가능)"
      />

      <div className="-mx-200 flex flex-1 flex-col gap-400 overflow-y-auto px-200">
        {Object.entries(jobGroups).map(([groupName, jobResponses]) => (
          <div key={groupName} className="flex flex-col gap-150">
            <h3 className="font-designer-13b text-text-subtlest tracking-wider uppercase">
              {groupName}
            </h3>
            <div className="grid grid-cols-2 gap-100">
              {jobResponses.map((jobResponse: JobResponse) => {
                const isSelected = selectedJobs.includes(jobResponse.job);

                return (
                  <button
                    key={jobResponse.job}
                    onClick={() => handleSelect(jobResponse.job)}
                    className={cn(
                      'rounded-100 font-designer-14m border p-150 text-left transition-all duration-200',
                      'hover:border-border-brand hover:bg-fill-brand-subtle-default hover:-translate-y-[2px]',
                      isSelected
                        ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-sm'
                        : 'border-border-default bg-background-default text-text-default',
                    )}
                  >
                    {jobResponse.description}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button
          onClick={onNext}
          disabled={selectedJobs.length === 0}
          className={cn(
            'font-designer-14m text-text-subtlest hover:text-text-subtle w-full py-100 underline underline-offset-4 transition-colors',
            selectedJobs.length === 0 && 'cursor-not-allowed opacity-50',
          )}
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
