// React Query 커스텀 훅

import { useMutation } from '@tanstack/react-query';
import { getProfileImage, signUp, uploadProfileImage } from './auth';

interface SignUpResponse {
  content: {
    generatedMemberId: string;
  };
  status: number;
  message: string;
}

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
      formData: FormData;
    }) => uploadProfileImage(data.memberId, data.filename, data.formData),
  });
}
