'use client';

import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { writeAccessTokenSession } from '@/features/auth/model/client-auth-session';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/hooks/queries/auth/use-auth-mutation';
import { useOnboardingStore } from '@/stores/use-onboarding-store';
import { useToastStore } from '@/stores/use-toast-store';
import type { SignUpRequest } from '@/types/api/auth.types';

interface Step4Data {
  nickname: string;
  profileImageFile?: File;
  job?: string;
  career?: string;
  goals: string[];
  goalEtcText?: string;
}

interface Step4CompletionProps {
  data: Step4Data;
  onSubmittingChange: (v: boolean) => void;
}

function getImageExtension(file: File): SignUpRequest['imageExtension'] {
  if (file.type === 'image/png') return 'PNG';
  if (file.type === 'image/gif') return 'GIF';
  if (file.type === 'image/webp') return 'WEBP';
  return 'JPG';
}

function buildGoalString(goals: string[], etcText?: string): string {
  return goals
    .map((g) => (g === '기타' && etcText?.trim() ? etcText.trim() : g))
    .join(', ');
}

export function Step4Completion({
  data,
  onSubmittingChange,
}: Step4CompletionProps) {
  const { close } = useOnboardingStore();
  const { mutate: signUp, isPending } = useSignUpMutation();
  const { mutateAsync: uploadImage } = useUploadProfileImageMutation();

  const handleFinish = () => {
    const request: SignUpRequest = {
      nickname: data.nickname,
      ...(data.profileImageFile
        ? { imageExtension: getImageExtension(data.profileImageFile) }
        : {}),
      ...(data.job ? { jobs: [data.job] } : {}),
      ...(data.career ? { career: data.career } : {}),
      ...(data.goals.length > 0
        ? { goal: buildGoalString(data.goals, data.goalEtcText) }
        : {}),
    };

    onSubmittingChange(true);
    signUp(request, {
      onSuccess: async (response) => {
        const newToken = response?.content?.accessToken;
        if (newToken) writeAccessTokenSession(newToken);
        const uploadUrl = response?.content?.uploadUrl;
        try {
          if (uploadUrl && data.profileImageFile) {
            const formData = new FormData();
            formData.append('file', data.profileImageFile);
            await uploadImage({ uploadUrl, file: formData });
          }
        } catch {
          useToastStore
            .getState()
            .showToast('프로필 이미지 업로드에 실패했어요.', 'error');
        } finally {
          close();
          onSubmittingChange(false);
        }
      },
      onError: () => {
        useToastStore
          .getState()
          .showToast(
            '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.',
            'error',
          );
        onSubmittingChange(false);
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-500 py-400">
      <div className="flex flex-col items-center gap-100">
        <p className="font-designer-20b text-gray-800">
          <span className="text-rose-500">{data.nickname}</span> 빌더님, 준비
          완료!
        </p>
        <p className="font-designer-16r text-gray-500">
          ZERO-ONE 트랙 위에서, 첫 발을 내딛어보세요.
        </p>
      </div>

      <Image
        src="/onboarding/mascot.png"
        alt="Zero and Wonnie mascot"
        width={300}
        height={227}
      />

      <button
        type="button"
        onClick={handleFinish}
        disabled={isPending}
        className={cn(
          'h-700 w-full rounded-100 font-designer-16b transition-colors',
          isPending
            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
            : 'bg-rose-500 text-white hover:bg-rose-600',
        )}
      >
        ZERO-ONE 시작하기
      </button>
    </div>
  );
}
