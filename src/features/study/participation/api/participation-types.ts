// 다음주 신청 리스트 조회 관련 타입
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

// 스터디 참여 신청 타입
export interface JoinStudyRequest {
  memberId: number;
  selfIntroduction?: string;
  studyPlan?: string;
  preferredStudySubjectId?: string;
  availableStudyTimeIds?: number[];
  techStackIds?: number[];
  tel?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
}
