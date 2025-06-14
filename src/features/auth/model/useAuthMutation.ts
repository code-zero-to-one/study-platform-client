// 데이터 변경(Mutation) 을 담당하는 커스텀 훅

import { useMutation } from '@tanstack/react-query';
import { SignUpResponse } from './types';
import { signUp, uploadProfileImage } from '@/features/auth/api/auth';

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
      file: File;
    }) => uploadProfileImage(data.memberId, data.filename, data.file),
  });
}
