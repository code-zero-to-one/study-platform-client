'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useClassOnboardingCompleteMutation } from '@/hooks/queries/class-onboarding/use-class-onboarding-mutation';
import { useOnboardingStore } from '@/stores/use-onboarding-store';

interface Step4CompletionProps {
  nickname: string;
}

export function Step4Completion({ nickname }: Step4CompletionProps) {
  const { close } = useOnboardingStore();
  const router = useRouter();
  const { mutate: complete, isPending } = useClassOnboardingCompleteMutation();

  const handleFinish = () => {
    complete(undefined, {
      onSuccess: () => {
        close();
        router.push('/class');
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-500 py-400">
      <div className="flex flex-col items-center gap-100">
        <p className="font-designer-20b text-gray-800">
          <span className="text-rose-500">{nickname}</span> 빌더님, 준비 완료!
        </p>
        <p className="font-designer-16r text-gray-500">
          ZERO-ONE 트랙 위에서, 첫 발을 내딛어보세요.
        </p>
      </div>

      <Image
        src="/zerowoni_walk.gif"
        alt="Zero and Wonnie mascot"
        width={300}
        height={227}
        unoptimized
      />

      <button
        type="button"
        onClick={handleFinish}
        disabled={isPending}
        className="h-700 w-full rounded-100 bg-rose-500 font-designer-16b text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
      >
        ZERO-ONE 시작하기
      </button>
    </div>
  );
}
