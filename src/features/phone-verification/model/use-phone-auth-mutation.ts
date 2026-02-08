import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/api/client/cookie';
// mutation 내부에서는 store 직접 사용 허용 (API 성공 시 즉시 업데이트 목적)
import { usePhoneVerificationStore } from './store';
import { sendPhoneVerificationCode, verifyPhoneCode } from '../api/phone-auth';
import type {
  SendPhoneVerificationCodeRequest,
  VerifyPhoneCodeRequest,
} from '../api/types';

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
<<<<<<< Updated upstream
        // 현재 사용자의 memberId 가져오기 (쿠키에서)
||||||| Stash base
        // 인증 상태 저장
        setVerified(variables.phoneNumber);

        // 현재 사용자의 memberId 가져오기 (쿠키에서)
=======
>>>>>>> Stashed changes
        const currentMemberId = memberId ?? Number(getCookie('memberId'));

<<<<<<< Updated upstream
        // 인증 상태 저장 (memberId 포함)
        setVerified(variables.phoneNumber, currentMemberId || undefined);

||||||| Stash base
=======
        // 인증 상태 저장
        setVerified(variables.phoneNumber, currentMemberId || undefined);

>>>>>>> Stashed changes
        // 프로필 정보 쿼리키 갱신
        if (currentMemberId) {
          await queryClient.invalidateQueries({
            queryKey: ['userProfile', currentMemberId],
          });
          // 모든 userProfile 쿼리도 무효화 (다른 곳에서 사용 중일 수 있음)
          await queryClient.invalidateQueries({
            predicate: (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey[0] === 'userProfile',
          });
          // 페이지 새로고침하여 서버 데이터 반영
          router.refresh();
        }
      }
    },
  });
};
