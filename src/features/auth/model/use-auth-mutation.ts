// 데이터 변경(Mutation) 을 담당하는 커스텀 훅

import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout, signUp, uploadProfileImage } from '@/features/auth/api/auth';
import { hashValue } from '@/shared/lib/hash';
import { deleteCookie, getCookie } from '@/shared/tanstack-query/cookie';
import { SignUpResponse } from './types';

// 회원가입 요청 커스텀 훅
export const useSignUpMutation = () => {
  return useMutation<
    SignUpResponse,
    Error,
    { name: string; imageExtension: string }
  >({
    mutationFn: (data: any) => signUp(data),
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

      queryClient.clear();

      router.push('/login');
      router.refresh();
    },
  });
};
