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

export interface Job {
  job?: string; // Enum 값 (예: "IT_PRACTITIONER_GAME_DEV")
  description?: string; // 설명 (예: "게임 개발자")
}

export interface Career {
  career: string; // Enum 값 (예: "JUNIOR")
  description: string; // 설명 (예: "주니어")
}

export interface StudyFormatType {
  studyFormatType: string; // Enum 값 (예: "MENTORING")
  description: string; // 설명 (예: "멘토링")
}

// 내 스터디 정보 (SPRINT2 프로필개선)
export interface MemberInfo {
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubject: PreferredStudySubject;
  availableStudyTimes: AvailableStudyTime[];
  // techStacks: TechStack[]; 기본정보로 이동 (SPRINT2 프로필개선) => memberProfile에 추가
  // 기본정보에 추가되는 정보들 (SPRINT2 프로필개선)
  jobs: Job[] | null;
  career: Career | null;
  studyFormatTypes: StudyFormatType[] | null;
  goal: string;
}

/**
 * 기본정보 (SPRINT2 프로필개선)
 **/
export interface TechStack {
  techStackId: number;
  code: string;
  techStackName: string;
  parentId: number | undefined;
  level: number;
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

// 기본정보 (SPRINT2 프로필개선)
export interface MemberProfile {
  memberName: string; // 본인, 관리자만 조회 (+스터디 참여시 SPRINT2 프로필개선)
  tel?: string; // 본인, 관리자만 조회 (+스터디 참여시 SPRINT2 프로필개선) - 스터디 참가자끼리는 볼 수 있음
  nickname: string;
  profileImage: ProfileImage;
  simpleIntroduction: string;
  mbti: string;
  interests: Interest[];
  hobbies?: Hobby[];
  birthDate: string;
  githubLink: SocialLink | undefined;
  blogOrSnsLink: SocialLink | undefined;
  techStacks: TechStack[]; // 기본정보로 이동 (SPRINT2 프로필개선) => memberInfo에서 삭제
}

export interface SincerityTemp {
  temperature: number;
  levelId: number;
  levelName: string;
}

export interface GetUserProfileResponse {
  memberId: number;
  autoMatching: boolean;
  studyApplied: boolean;
  memberInfo: MemberInfo;
  memberProfile: MemberProfile;
  sincerityTemp: SincerityTemp;
}

export interface PatchAutoMatchingParams {
  memberId: number;
  autoMatching: boolean;
}
