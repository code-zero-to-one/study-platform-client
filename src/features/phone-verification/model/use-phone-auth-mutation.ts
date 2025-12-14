import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from '../api/phone-auth';
import type {
  SendPhoneVerificationCodeRequest,
  VerifyPhoneCodeRequest,
} from '../api/types';
import { usePhoneVerificationStore } from './store';

/**
 * SMS 인증번호 발송 Mutation
 */
export const useSendPhoneVerificationCodeMutation = () => {
  return useMutation<
    { success: boolean; message: string },
    Error,
    SendPhoneVerificationCodeRequest
  >({
    mutationFn: sendPhoneVerificationCode,
  });
};

/**
 * SMS 인증번호 검증 Mutation
 * 인증 성공 시 프로필 쿼리를 무효화하여 최신 정보를 가져옵니다.
 */
export const useVerifyPhoneCodeMutation = (memberId?: number) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setVerified } = usePhoneVerificationStore();

  return useMutation<
    { success: boolean; message: string },
    Error,
    VerifyPhoneCodeRequest
  >({
    mutationFn: verifyPhoneCode,
    onSuccess: async (data, variables) => {
      if (data.success) {
        // 인증 상태 저장
        setVerified(variables.phoneNumber);

        // 프로필 정보 쿼리키 갱신 (memberId가 있는 경우)
        if (memberId) {
          await queryClient.invalidateQueries({
            queryKey: ['userProfile', memberId],
          });
          // 페이지 새로고침하여 서버 데이터 반영
          router.refresh();
        }
      }
    },
  });
};
