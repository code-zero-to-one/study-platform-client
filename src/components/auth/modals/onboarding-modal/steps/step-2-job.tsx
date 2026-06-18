'use client';

import { useRef, useState } from 'react';
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
  // 렌더에서만 읽는 1회 시딩 가드 → state 대신 ref (재렌더 유발 안 함).
  const seededFromJobsRef = useRef(false);

  // jobs 로딩 완료 후 1회: data.job이 목록 밖 값이면 기타 모드로 표시.
  if (!seededFromJobsRef.current && jobs.length > 0) {
    seededFromJobsRef.current = true;
    const jobKeys = jobs.map((j: JobResponse) => j.job);
    if (data.job && !jobKeys.includes(data.job)) {
      setEtcMode(true);
      setEtcInput(data.job);
    }
  }

  const etcJob = jobs.find((j: JobResponse) => j.description.includes('기타'));
  const regularJobs = jobs.filter(
    (j: JobResponse) => !j.description.includes('기타'),
  );

  const canProceed = !!data.job && !!data.career;
  const isEtcActive = etcMode || (!!etcJob && data.job === etcJob.job);

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
    if (!etcInput.trim() || !etcJob) return;
    updateData('job', etcJob.job);
    setEtcMode(false);
  };

  const handleEtcCancel = () => {
    setEtcMode(false);
    setEtcInput('');
  };

  return (
    <div className="flex flex-col gap-500">
      {/* Job section */}
      <div className="flex flex-col gap-150">
        <p className="font-designer-18b text-gray-800">직무를 선택해주세요.</p>
        <p className="font-designer-14r text-gray-500">
          해당하는 직무를 선택해주세요.
        </p>
        <div className="flex flex-wrap gap-150 pt-150">
          {regularJobs.map((jobItem: JobResponse) => {
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
            <div className="flex items-center gap-125 rounded-500 border border-rose-500 bg-white px-250 py-100">
              <input
                type="text"
                aria-label="기타 직무"
                value={etcInput}
                onChange={(e) => setEtcInput(e.target.value)}
                placeholder="입력해주세요"
                className="min-w-0 flex-1 bg-transparent font-designer-16r text-rose-500 outline-none placeholder:text-rose-200"
              />
              <div className="flex gap-75">
                <button
                  type="button"
                  onClick={handleEtcAdd}
                  disabled={!etcInput.trim()}
                  className="rounded-50 bg-rose-500 px-125 py-50 font-designer-13m text-white disabled:opacity-50"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={handleEtcCancel}
                  className="rounded-50 bg-rose-100 px-125 py-50 font-designer-13m text-rose-500"
                >
                  취소
                </button>
              </div>
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
