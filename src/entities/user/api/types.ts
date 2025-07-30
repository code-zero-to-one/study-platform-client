export interface TechStack {
  techStackId: number;
  code: string;
  techStackName: string;
  parentId: number | undefined;
  level: number;
}

export interface AvailableStudyTime {
  id: number;
  fromTime: string | undefined;
  toTime: string | undefined;
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
    width: number | undefined;
    height: number | undefined;
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
  githubLink: SocialLink | undefined;
  blogOrSnsLink: SocialLink | undefined;
  tel: string;
}

export interface GetUserProfileResponse {
  memberId: number;
  autoMatching: boolean;
  studyApplied: boolean;
  memberInfo: MemberInfo;
  memberProfile: MemberProfile;
}

export interface PatchAutoMatchingParams {
  memberId: number;
  autoMatching: boolean;
}
