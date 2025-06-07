import { Api } from '@/shared/api/apiInstance';

// Query Keys
export const authKeys = {
  user: ['user'] as const,
  profile: ['profile'] as const,
} as const;

export interface UserResponse {
  content: string;  // memberId
  status: number;
  message: string;
}

export interface ProfileResponse {
  content: {
    memberProfile: {
      memberName: string;
      profileImage: {
        resizedImages: Array<{
          resizedImageUrl: string;
        }>;
      };
    };
  };
  status: number;
  message: string;
}

// 회원가입 요청 API
export async function signUp(data: any) {
  const res = await Api.post('/api/v1/members', data);
  console.log('signUp res', res);

  return res.data;
}

// 프로필 이미지 업로드 API
export async function uploadProfileImage(
  memberId: number,
  filename: string,
  formData: FormData,
) {
  const res = await Api.put(
    `/api/v1/files/members/${memberId}/profile/image/${filename}`,
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
  const res = await Api.get(`/api/v1/auth/me`);
  console.log('getMemberId res', res);

  return res.data;
}

// 프로필 조회 API
export async function getProfileImage(memberId: number) {
  const res = await Api.get(`/api/v1/members/${memberId}/profile`);
  console.log('getProfileImage res', res);

  return res.data;
}
