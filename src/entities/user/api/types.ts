// features/user-profile/api/types.ts

export interface TechStack {
  techStackId: number;
  code: string;
  techStackName: string;
  parentId: number | null;
  level: number;
}

export interface AvailableStudyTime {
  id: number;
  fromTime: string | null;
  toTime: string | null;
  label: string;
  fullLabel: string;
}

export interface PreferredStudySubject {
  studySubjectId: string;
  name: string;
}

export interface MemberInfo {
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubject: PreferredStudySubject;
  availableStudyTimes: AvailableStudyTime[];
  techStacks: TechStack[];
}

export interface SocialLink {
  socialMediaId: number;
  url: string;
  iconUrl: string;
  type: string;
}

export interface ResizedImage {
  resizedImageId: number;
  resizedImageUrl: string;
  imageSizeType: {
    imageTypeName: string;
    width: number | null;
    height: number | null;
  };
}

export interface ProfileImage {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface Interest {
  id: number;
  name: string;
}

export interface Hobby {
  id: number;
  name: string;
}

export interface MemberProfile {
  memberName: string;
  profileImage: ProfileImage;
  simpleIntroduction: string;
  mbti: string;
  interests: Interest[];
  hobbies: Hobby[];
  birthDate: string;
  githubLink: SocialLink | null;
  blogOrSnsLink: SocialLink | null;
  tel: string;
}

export interface GetUserProfileResponse {
  memberId: number;
  autoMatching: boolean;
  memberInfo: MemberInfo;
  memberProfile: MemberProfile;
}
