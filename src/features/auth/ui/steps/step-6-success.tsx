'use client';

import Button from '@/components/ui/button';
import { StepHeader } from './step-header';

// 6. 회원가입 완료 단계
export function SuccessStep({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="flex h-full flex-col items-center pt-600 gap-300">
      <StepHeader
        title={
          <>
            회원가입이 완료되었습니다!
          </>
        }
        subtitle=""
      />

      <div className="flex flex-col items-center gap-200 pb-600 text-center">
        <p className="font-designer-24b text-text-strong">
          YOUR CAREER EXPANDS HERE!
        </p>
        <p className="font-designer-18r text-text-default">
          최고를 향해 달리는 제로원 멤버들과 함께
        </p>
        <p className="font-designer-18r text-text-default">
          당신의 IT 커리어를 무한대로 확장해보세요.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-100 w-full">
        <Button size="large" onClick={onConfirm}>
          로그인 하기
        </Button>
      </div>
    </div>
  );
}

