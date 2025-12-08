// 회원가입 응답 타입
export interface SignUpResponse {
  content: {
    generatedMemberId: string;
  };
  status: number;
  message: string;
}

// 회원가입 요청 타입
export interface SignUpRequest {
  nickname: string;
  imageExtension?: 'JPG' | 'PNG' | 'GIF' | 'WEBP' | 'SVG' | 'JPEG' | 'DEFAULT';
  job?: string;
  career?: string;
  studyFormatTypes?: string[];
  goal?: string;
}