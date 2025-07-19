// 회원가입 응답 타입
export interface SignUpResponse {
  content: {
    generatedMemberId: string;
  };
  status: number;
  message: string;
}
