export interface BasicInfo {
  groupStudyId: number;
  type: string;
  targetRoles: string[];
  maxMembersCount: number;
  experienceLevels: string[];
  method: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  regularMeeting: 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'TRIPLE_WEEKLY_OR_MORE';
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface DetailInfo {
  thumbnail: {
    imageId: number;
    resizedImages: {
      resizedImageId: number;
      resizedImageUrl: string;
      imageSizeType: {
        imageTypeName: string;
        width: number | undefined;
        height: number | undefined;
      };
    }[];
  };
  title: string;
  description: string;
  summary: string;
}

export interface InterviewPost {
  interviewPost: string;
}

export interface OpenGroupRequest {
  basicInfo: BasicInfo;
  detailInfo: DetailInfo;
  interviewPost: InterviewPost;
  thumbnailExtension:
    | 'DEFAULT'
    | 'JPG'
    | 'PNG'
    | 'GIF'
    | 'WEBP'
    | 'SVG'
    | 'JPEG';
}
