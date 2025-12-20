import { Lightbulb } from 'lucide-react';
import Button from '@/components/ui/button';
import { TextAreaInput } from '@/components/ui/input';
import { StepHeader } from './step-header';

// 5. 목표 입력 단계
export function GoalStep({ data, updateData, onNext, onSkip }: any) {
  return (
    <div className="flex h-full flex-col gap-300">
      <StepHeader
        icon={Lightbulb}
        title={
          <>
            마지막이에요!
            <br />
            이루고 싶은 목표가 있나요?
          </>
        }
        subtitle="자유롭게 적어주시면 도움이 돼요"
      />

      <TextAreaInput
        value={data.goal}
        onChange={(e) => updateData('goal', e.target.value)}
        placeholder="예) 사이드 프로젝트를 완성하고 싶어요, 기초를 탄탄히 다지고 싶어요 등"
        className="font-designer-16r min-h-[150px]"
      />

      <div className="flex flex-col gap-100 pt-200">
        <Button size="large" onClick={onNext}>
          시작하기
        </Button>
        <button
          onClick={onSkip}
          className="font-designer-14m text-text-subtlest hover:text-text-subtle py-100 underline underline-offset-4 transition-colors"
        >
          지금은 건너뛸게요
        </button>
      </div>
    </div>
  );
}
