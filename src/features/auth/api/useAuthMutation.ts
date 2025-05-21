// React Query 커스텀 훅

import { useMutation } from "@tanstack/react-query";
import { signUp, uploadProfileImage } from "./auth";

// 회원가입 요청 커스텀 훅
export function useSignUpMutation() {
  return useMutation({
    mutationFn: (data: any) => signUp(data),
  });
}

// 프로필 이미지 업로드 요청 커스텀 훅
export function useUploadProfileImageMutation() {
  return useMutation({
    mutationFn: (data: { memberId: number, filename: string, formData: FormData }) => uploadProfileImage(data.memberId, data.filename, data.formData),
  });
}
