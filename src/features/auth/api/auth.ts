// API 통신만 담당하는 순수 함수들

import { axiosInstance } from '@/shared/tanstack-query/axios';

// 회원가입 요청 API
export async function signUp(data: any) {
  const res = await axiosInstance.post('/members', data);
  console.log('signUp res', res);

  return res.data;
}

// 프로필 이미지 업로드 API
export async function uploadProfileImage(
  memberId: number,
  filename: string,
  formData: FormData,
) {
  const res = await axiosInstance.put(
    `/files/members/${memberId}/profile/image/${filename}`,
    formData,
    {
      // FormData를 사용할 때는 axios 요청에서 Content-Type을 직접 지정하지 않아야 합니다.
      // headers: {
      //   'Content-Type': 'multipart/form-data'
      // }
    },
  );

  return res.data;
}

// 멤버 ID 조회 API
export async function getMemberId() {
  const res = await axiosInstance.get(`/auth/me`);
  console.log('getMemberId res', res);

  return res.data;
}

// 프로필 조회 API
export async function getProfile(memberId: number) {
  const res = await axiosInstance.get(`/members/${memberId}/profile`);
  console.log('getProfile res', res);

  return res.data;
}

// 로그아웃 API
export async function logout() {
  const res = await axiosInstance.post('/auth/logout');
  console.log('logout res', res);

  return res.data;
}