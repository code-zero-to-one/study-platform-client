// 데이터 변경(Mutation) 을 담당하는 커스텀 훅

import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie } from '@/api/client/cookie';
import { logout, signUp, uploadProfileImage } from '@/api/endpoints/auth/auth';
// 로그아웃 시 인증 상태 리셋을 위해 store 직접 사용 (mutation 내부 사용)
import { usePhoneVerificationStore } from '@/stores/use-phone-verification-store';
import { useUserStore } from '@/stores/useUserStore';
import { SignUpRequest, SignUpResponse } from '@/types/api/auth.types';
import { hashValue } from '@/utils/hash';

// 회원가입 요청 커스텀 훅
export const useSignUpMutation = () => {
  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: (data: SignUpRequest) => signUp(data),
  });
};

// 프로필 이미지 업로드 요청 커스텀 훅
export function useUploadProfileImageMutation() {
  return useMutation({
    mutationFn: (data: {
      memberId: number;
      filename: string;
      file: FormData;
    }) => uploadProfileImage(data.memberId, data.filename, data.file),
  });
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const resetUserStore = useUserStore((state) => state.reset);
  const resetPhoneVerification = usePhoneVerificationStore(
    (state) => state.reset,
  );

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      const memberId = getCookie('memberId');

      if (memberId)
        sendGTMEvent({
          event: 'custom_member_logout',
          dl_timestamp: new Date().toISOString(),
          dl_member_id: hashValue(memberId),
        });

      deleteCookie('accessToken');
      deleteCookie('memberId');
      deleteCookie('socialImageURL');

      resetUserStore();
      resetPhoneVerification();
      queryClient.clear();

      router.push('/home');
      router.refresh();
    },
  });
};
