export interface ParticipantUserItem {
  memberId: number;
  memberName: string;
  profileImage?: {
    imageId: number;
    resizedImages: {
      resizedImageId: number;
      resizedImageUrl: string;
      imageSizeType: {
        imageTypeName: string;
        width?: number;
        height?: number;
      };
    }[];
  };
  simpleIntroduction?: string;
}

export interface WeeklyParticipationResponse {
  totalMemberCount: number;
  members: {
    nextCursor?: number;
    hasNext: boolean;
    items: ParticipantUserItem[];
  };
}

export interface Participant {
  id: number;
  name: string;
  avatarUrl?: string;
  simpleIntroduction?: string;
}

export interface WeeklyParticipationRequest {
  cursor?: number;
  pageSize?: number;
  firstMemberId?: number;
}
