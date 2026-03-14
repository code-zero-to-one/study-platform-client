// 데이터 변경(Mutation) 을 담당하는 커스텀 훅

import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/api/client/cookie';
import { logout, signUp, uploadProfileImage } from '@/api/endpoints/auth/auth';
import { clearClientSession } from '@/features/auth/model/client-auth-session';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
import { SignUpRequest, SignUpResponse } from '@/types/api/auth.types';
import { hashValue } from '@/utils/hash';
import { usePhoneVerificationStore } from './use-phone-verification-status';
import { VIEWED_ARCHIVES_KEY } from './use-view-mutation';

export const useSignUpMutation = () => {
  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: (data: SignUpRequest) => signUp(data),
  });
};

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
  const resetMentorDirectory = useMentorDirectoryStore((state) => state.reset);

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

      clearClientSession();

      localStorage.removeItem(VIEWED_ARCHIVES_KEY);

      resetUserStore();
      resetPhoneVerification();
      resetMentorDirectory();
      queryClient.clear();

      router.push('/');
      router.refresh();
    },
  });
};
