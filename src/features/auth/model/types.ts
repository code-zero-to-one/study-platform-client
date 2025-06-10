// export interface MemberInfo {
//     memberId: string;
//     profile: {
//       memberName: string;
//       profileImage?: string;
//     };
//   }
  
export interface SignUpResponse {
    content: {
      generatedMemberId: string;
    };
    status: number;
    message: string;
  }
  
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