'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { saveClassOnboardingStep2 } from '@/api/endpoints/class-onboarding/class-onboarding';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

import {
  CAREER_OPTIONS,
  JOB_OPTIONS,
  type ClassOnboardingCareer,
  type ClassOnboardingJob,
} from '@/types/api/class-onboarding.types';

interface Step2Data {
  jobs: ClassOnboardingJob[];
  jobEtcText?: string;
  career?: ClassOnboardingCareer;
}

interface Step2JobProps {
  data: Step2Data;
  updateData: (field: keyof Step2Data, value: unknown) => void;
  onNext: () => void;
  onSubmittingChange: (v: boolean) => void;
}

export function Step2Job({
  data,
  updateData,
  onNext,
  onSubmittingChange,
}: Step2JobProps) {
  const { mutate: saveStep2, isPending } = useMutation({
    mutationFn: saveClassOnboardingStep2,
  });
  const [etcInput, setEtcInput] = useState('');
  const [etcMode, setEtcMode] = useState(false);

  const isOtherSelected = data.jobs.includes('CLASS_ONBOARDING_OTHER');
  const canProceed =
    data.jobs.length > 0 &&
    !!data.career &&
    (!isOtherSelected || !!data.jobEtcText?.trim());

  const toggleJob = (value: ClassOnboardingJob) => {
    if (data.jobs.includes(value)) {
      updateData(
        'jobs',
        data.jobs.filter((j) => j !== value),
      );
    } else {
      updateData('jobs', [...data.jobs, value]);
    }
  };

  const handleEtcClick = () => {
    setEtcMode(true);
    if (!isOtherSelected) {
      updateData('jobs', [...data.jobs, 'CLASS_ONBOARDING_OTHER']);
    }
  };

  const handleEtcAdd = () => {
    if (!etcInput.trim()) return;
    updateData('jobEtcText', etcInput.trim());
    setEtcMode(false);
  };

  const handleEtcCancel = () => {
    setEtcMode(false);
    setEtcInput('');
    updateData(
      'jobs',
      data.jobs.filter((j) => j !== 'CLASS_ONBOARDING_OTHER'),
    );
    updateData('jobEtcText', '');
  };

  const handleNext = () => {
    if (!canProceed || isPending || !data.career) return;
    onSubmittingChange(true);
    saveStep2(
      {
        jobs: data.jobs,
        career: data.career,
        ...(isOtherSelected && data.jobEtcText?.trim()
          ? { jobEtcText: data.jobEtcText.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          onSubmittingChange(false);
          onNext();
        },
        onError: () => {
          onSubmittingChange(false);
        },
      },
    );
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
          {JOB_OPTIONS.map((jobItem) => {
            const selected = data.jobs.includes(jobItem.value);
            return (
              <button
                key={jobItem.value}
                type="button"
                onClick={() => toggleJob(jobItem.value)}
                className={cn(
                  'rounded-full px-250 py-125 font-designer-16r transition-colors',
                  selected
                    ? 'bg-rose-500 text-white'
                    : 'border border-gray-300 text-gray-500 hover:border-rose-300',
                )}
              >
                {jobItem.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleEtcClick}
            className={cn(
              'rounded-full px-250 py-125 font-designer-16r transition-colors',
              isOtherSelected
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
          {CAREER_OPTIONS.map((careerItem) => (
            <button
              key={careerItem.value}
              type="button"
              onClick={() => updateData('career', careerItem.value)}
              className={cn(
                'h-700 rounded-150 border px-188 text-left transition-all duration-200',
                data.career === careerItem.value
                  ? 'border-rose-500 font-designer-16b text-rose-500'
                  : 'border-gray-300 font-designer-16r text-gray-500 hover:border-rose-300',
              )}
            >
              {careerItem.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed || isPending}
        className={cn(
          'h-700 w-full rounded-100 font-designer-16b transition-colors',
          canProceed && !isPending
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'cursor-not-allowed bg-gray-200 text-gray-400',
        )}
      >
        다음
      </button>
    </div>
  );
}
