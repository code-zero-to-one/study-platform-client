// API 통신만 담당하는 순수 함수들

import {
  axiosInstance,
  axiosInstanceForMultipart,
} from '@/shared/tanstack-query/axios';

// 회원가입 요청 API
export async function signUp(data: any) {
  const res = await axiosInstance.post('/members', data);

  return res.data;
}

// 프로필 이미지 업로드 API
export async function uploadProfileImage(
  memberId: number,
  filename: string,
  file: FormData,
) {
  const res = await axiosInstanceForMultipart.put(
    `/files/members/${memberId}/profile/image/${filename}`,
    file,
  );

  return res.data;
}

// 멤버 ID 조회 API
export async function getMemberId() {
  const res = await axiosInstance.get(`/auth/me`);

  return res.data.content;
}

// 로그아웃 API
export const logout = async (): Promise<number> => {
  const res = await axiosInstance.post('/auth/logout');

  return res.data.statusCode;
};
