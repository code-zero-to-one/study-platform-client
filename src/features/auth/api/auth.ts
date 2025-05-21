import { Api } from "@/shared/api/apiInstance";

// 회원가입 요청 API
export async function signUp(data: any) {
  const res = await Api.post("/api/v1/members", data);
  return res.data;
}

// 프로필 이미지 업로드 API
export async function uploadProfileImage(memberId: number, filename: string, formData: FormData) {
  const res = await Api.put(`/api/v1/files/members/${memberId}/profile/image/${filename}`, formData, {
    // FormData를 사용할 때는 axios 요청에서 Content-Type을 직접 지정하지 않아야 합니다.
    // headers: {
    //   'Content-Type': 'multipart/form-data'
    // }
  });
  return res.data;
}
