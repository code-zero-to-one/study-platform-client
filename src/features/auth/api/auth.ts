// API 통신만 담당하는 순수 함수들

import {
  axiosClientInstance,
  axiosClientInstanceForMultipart,
} from '@/shared/tanstack-query/axios.client';

// 회원가입 요청 API
export async function signUp(data: any) {
  const res = await axiosClientInstance.post('/members', data);

  return res.data;
}

// 프로필 이미지 업로드 API
export async function uploadProfileImage(
  memberId: number,
  filename: string,
  file: FormData,
) {
  const res = await axiosClientInstanceForMultipart.put(
    `/files/members/${memberId}/profile/image/${filename}`,
    file,
  );

  return res.data;
}

// 멤버 ID 조회 API
export async function getMemberId() {
  const res = await axiosClientInstance.get(`/auth/me`);

  return res.data;
}

// 로그아웃 API
// 성공하면, content는 빈배열로 응답
export const logout = async (): Promise<Record<string, never>> => {
  const res = await axiosClientInstance.post('/auth/logout');

  return res.data.content;
};
