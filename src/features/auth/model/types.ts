// 회원가입 응답 타입
export interface SignUpResponse {
  content: {
    generatedMemberId: string;
    accessToken: string;
    refreshToken: string;
  };
  status: number;
  message: string;
}

// 회원가입 요청 타입
export interface SignUpRequest {
  nickname: string;
  imageExtension?: 'JPG' | 'PNG' | 'GIF' | 'WEBP' | 'SVG' | 'JPEG' | 'DEFAULT';
  jobs?: string[];
  career?: string;
  studyFormatTypes?: string[];
  goal?: string;
}
