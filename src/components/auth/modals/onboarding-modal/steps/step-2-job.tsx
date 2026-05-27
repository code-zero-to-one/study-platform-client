'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useCareersQuery,
  useJobsQuery,
} from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { CareerResponse, JobResponse } from '@/types/api/my-page.types';

interface Step2Data {
  job?: string;
  career?: string;
}

interface Step2JobProps {
  data: Step2Data;
  updateData: (field: keyof Step2Data, value: unknown) => void;
  onNext: () => void;
}

export function Step2Job({ data, updateData, onNext }: Step2JobProps) {
  const { data: jobs = [] } = useJobsQuery();
  const { data: careers = [] } = useCareersQuery();

  const [etcInput, setEtcInput] = useState('');
  const [etcMode, setEtcMode] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (jobs.length === 0 || initializedRef.current) return;
    initializedRef.current = true;
    const jobKeys = jobs.map((j: JobResponse) => j.job);
    if (data.job && !jobKeys.includes(data.job)) {
      setEtcMode(true);
      setEtcInput(data.job);
    }
  }, [jobs, data.job]);

  const canProceed = !!data.job && !!data.career;
  const isEtcActive = etcMode;

  const handleJobSelect = (jobKey: string) => {
    if (etcMode) {
      setEtcMode(false);
      setEtcInput('');
    }
    updateData('job', data.job === jobKey ? undefined : jobKey);
  };

  const handleEtcClick = () => {
    updateData('job', undefined);
    setEtcMode(true);
  };

  const handleEtcAdd = () => {
    if (!etcInput.trim()) return;
    updateData('job', etcInput.trim());
    setEtcMode(false);
  };

  const handleEtcCancel = () => {
    setEtcMode(false);
    setEtcInput('');
    const jobKeys = jobs.map((j: JobResponse) => j.job);
    if (data.job && !jobKeys.includes(data.job)) updateData('job', undefined);
  };

  return (
    <div className="flex flex-col gap-500">
      {/* Job section */}
      <div className="flex flex-col gap-150">
        <p className="font-designer-18b text-gray-800">직무를 선택해주세요.</p>
        <p className="font-designer-14r text-gray-500">
          해당하는 직무를 선택해주세요.
        </p>
        <div className="flex flex-wrap items-center gap-150 pt-150">
          {jobs.map((jobItem: JobResponse) => {
            const selected = data.job === jobItem.job;
            return (
              <button
                key={jobItem.job}
                type="button"
                onClick={() => handleJobSelect(jobItem.job)}
                className={cn(
                  'rounded-full px-250 py-125 font-designer-16r transition-colors',
                  selected
                    ? 'bg-rose-500 text-white'
                    : 'border border-gray-300 text-gray-500 hover:border-rose-300',
                )}
              >
                {jobItem.description}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleEtcClick}
            className={cn(
              'rounded-full px-250 py-125 font-designer-16r transition-colors',
              isEtcActive
                ? 'border border-rose-500 text-rose-500'
                : 'border border-gray-300 text-gray-500 hover:border-rose-300',
            )}
          >
            기타+
          </button>
          {etcMode && (
            <div className="flex items-center gap-125 rounded-500 border border-rose-500 px-250 py-100">
              <input
                type="text"
                value={etcInput}
                onChange={(e) => setEtcInput(e.target.value)}
                placeholder="직무를 입력해주세요"
                className="flex-1 border-none bg-transparent font-designer-14r text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleEtcAdd}
                disabled={!etcInput.trim()}
                className="rounded-50 bg-rose-500 px-100 py-50 font-designer-13r text-white disabled:opacity-50"
              >
                추가
              </button>
              <button
                type="button"
                onClick={handleEtcCancel}
                className="rounded-50 bg-rose-100 px-100 py-50 font-designer-13r text-rose-500"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Career section */}
      <div className="flex flex-col gap-150">
        <p className="font-designer-18b text-gray-800">경력을 선택해주세요.</p>
        <p className="font-designer-14r text-gray-500">
          현재 개발 경력 수준을 선택해주세요.
        </p>
        <div className="flex flex-col gap-150 pt-150">
          {careers.map((careerItem: CareerResponse) => (
            <button
              key={careerItem.career}
              type="button"
              onClick={() => updateData('career', careerItem.career)}
              className={cn(
                'h-700 rounded-150 border px-188 text-left transition-all duration-200',
                data.career === careerItem.career
                  ? 'border-rose-500 font-designer-16b text-rose-500'
                  : 'border-gray-300 font-designer-16r text-gray-500 hover:border-rose-300',
              )}
            >
              {careerItem.description}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={cn(
          'h-700 w-full rounded-100 font-designer-16b transition-colors',
          canProceed
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'cursor-not-allowed bg-gray-200 text-gray-400',
        )}
      >
        다음
      </button>
    </div>
  );
}
