export interface ReservationUserItem {
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

export interface WeeklyReservationResponse {
  totalMemberCount: number;
  members: {
    nextCursor?: number;
    hasNext: boolean;
    items: ReservationUserItem[];
  };
}

export interface Participant {
  id: number;
  name: string;
  avatarUrl?: string;
  simpleIntroduction?: string;
}

export interface WeeklyReservationRequest {
  cursor?: number;
  pageSize?: number;
  firstMemberId?: number;
}
