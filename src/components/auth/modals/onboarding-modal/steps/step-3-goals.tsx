'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const GOAL_OPTIONS = [
  { key: '내 포트폴리오 사이트', label: '내 포트폴리오 사이트' },
  { key: '사이드 프로젝트 웹/앱', label: '사이드 프로젝트 웹/앱' },
  { key: '업무 자동화 도구', label: '업무 자동화 도구' },
  { key: '수익화 서비스(창업, 부업)', label: '수익화 서비스(창업, 부업)' },
  { key: '기타', label: '기타(상세 내용 기재)' },
] as const;

interface Step3Data {
  goals: string[];
  goalEtcText?: string;
}

interface Step3GoalsProps {
  data: Step3Data;
  updateData: (field: keyof Step3Data, value: unknown) => void;
  onNext: () => void;
}

export function Step3Goals({ data, updateData, onNext }: Step3GoalsProps) {
  const goals = data.goals;
  const isEtcSelected = goals.includes('기타');
  const canProceed =
    goals.length >= 1 && (!isEtcSelected || !!data.goalEtcText?.trim());

  const toggleGoal = (key: string) => {
    if (goals.includes(key)) {
      updateData(
        'goals',
        goals.filter((g) => g !== key),
      );
      if (key === '기타') updateData('goalEtcText', '');
    } else if (goals.length < 2) {
      updateData('goals', [...goals, key]);
    }
  };

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-150">
        <p className="font-designer-18b text-gray-800">
          어떤 걸 만들어 보고 싶으세요?
        </p>
        <p className="font-designer-14r text-gray-500">
          신규 코스 기획에 활용될 예정입니다(최대 2개 선택).
        </p>
      </div>

      <div className="flex flex-col gap-160">
        {GOAL_OPTIONS.map((option) => {
          const selected = goals.includes(option.key);
          const isDisabled = !selected && goals.length >= 2;
          const isEtc = option.key === '기타';

          return (
            <div key={option.key} className="flex flex-col gap-150">
              <button
                type="button"
                onClick={() => toggleGoal(option.key)}
                disabled={isDisabled}
                className={cn(
                  'h-700 rounded-150 border px-188 text-left transition-all duration-200',
                  selected
                    ? 'border-rose-500 font-designer-16b text-rose-500'
                    : isDisabled
                      ? 'cursor-not-allowed border-gray-200 font-designer-16r text-gray-300'
                      : 'border-gray-300 font-designer-16r text-gray-500 hover:border-rose-300',
                )}
              >
                {option.label}
              </button>
              {isEtc && isEtcSelected && (
                <textarea
                  aria-label="기타 목표"
                  value={data.goalEtcText ?? ''}
                  onChange={(e) => updateData('goalEtcText', e.target.value)}
                  placeholder="내용을 입력해주세요."
                  rows={3}
                  className="resize-none rounded-150 border border-rose-500 px-188 py-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-500"
                />
              )}
            </div>
          );
        })}
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
