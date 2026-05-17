// 데이터 변경(Mutation) 을 담당하는 커스텀 훅

import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation } from '@tanstack/react-query';
import { axiosInstanceForMultipart } from '@/api/client/axios';
import { logout, signUp } from '@/api/endpoints/auth/auth';
import { AUTH_ROUTE_PATHS } from '@/features/auth/model/auth-route';
import { clearClientAuthStateAndRedirect } from '@/features/auth/model/client-auth-cleanup';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { VIEWED_ARCHIVES_KEY } from '@/hooks/queries/one-to-one/use-view-mutation';
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
    mutationFn: ({ uploadUrl, file }: { uploadUrl: string; file: FormData }) =>
      axiosInstanceForMultipart.put(uploadUrl, file).then((r) => r.data),
  });
}

export const useLogoutMutation = () => {
  const { memberId } = useAuthReady();
  const finishLogout = (): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(VIEWED_ARCHIVES_KEY);
    }

    clearClientAuthStateAndRedirect(AUTH_ROUTE_PATHS.LANDING);
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      if (memberId)
        sendGTMEvent({
          event: 'custom_member_logout',
          dl_timestamp: new Date().toISOString(),
          dl_member_id: hashValue(String(memberId)),
        });

      finishLogout();
    },
    onError: () => {
      finishLogout();
    },
  });
};
