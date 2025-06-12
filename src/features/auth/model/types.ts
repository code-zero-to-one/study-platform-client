// 사용자 정보 조회 응답 타입
export interface MemberInfoResponse {
    isLogin: boolean;
    content: {
      memberProfile: {
        memberName: string;
        profileImage: {
          resizedImages: {
            resizedImageUrl: string;
          }[];
        };
      };
    };
    statusCode: number;
    message: string;
}
  
// 회원가입 응답 타입
export interface SignUpResponse {
    content: {
      generatedMemberId: string;
    };
    status: number;
    message: string;
  }