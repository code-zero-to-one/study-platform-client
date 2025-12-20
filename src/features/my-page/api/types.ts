export interface UpdateUserProfileRequest {
  nickname: string;
  birthDate?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
  simpleIntroduction?: string;
  mbti?: string;
  interests?: string[];
  profileImageExtension?: string;
  techStackIds?: number[]; // 기본정보에 추가되는 정보 (SPRINT2 프로필개선)
}

export interface UpdateUserProfileResponse {
  memberId: number;
  name: string;
  profileImageUploadUrl: string;
  nickname: string;
  tel: string;
  githubLink: string;
  blogOrSnsLink: string;
  simpleIntroduction: string;
  mbti: string;
  birthDate: string;
  interests: {
    id: number;
    name: string;
  }[];
  hobbies: {
    id: number;
    name: string;
  }[];
}

export interface UpdateUserProfileInfoRequest {
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  availableStudyTimeIds: number[];
  // 기본정보에 추가되는 정보들 (SPRINT2 프로필개선)
  jobs: string[]; // Enum 값들 (예: ["IT_PRACTITIONER_BACKEND"])
  career: string; // Enum 값 (예: "JUNIOR")
  studyFormatTypes: string[]; // Enum 값들 (예: ["PROJECT", "SEMINAR"])
  goal: string;
}

export interface UpdateUserProfileInfoResponse {
  memberId: number;
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  jobIds: number[];
  career: number[];
  studyFormatTypes: number[];
  goal: number[];
}

export interface AvailableStudyTimeResponse {
  availableTimeId: number;
  display: string;
}

export interface StudySubjectResponse {
  studySubjectId: string;
  name: string;
}

export interface TechStackResponse {
  techStackId: number;
  code: string;
  techStackName: string;
  parentId: number | undefined;
  level: number;
}

export interface StudyActivity {
  totalParticipationDays: number;
  sequenceParticipationWeeks: number;
  maxSequenceParticipationWeeks: number;
  completedStudyCount: number;
  failureStudyCount: number;
}

export interface GrowthMetric {
  studyCompleteness: number;
}

export interface StudyDashboardResponse {
  studyActivity: StudyActivity;
  growthMetric: GrowthMetric;
}

/**
 * 회원가입시 받는 정보들 (SPRINT2 프로필개선)
 **/
export interface JobResponse {
  job: string; // Enum 값 (예: "IT_PRACTITIONER_GAME_DEV", "IT_NOBASE_BUSINESS_STARTUP")
  description: string;
}

export interface CareerResponse {
  career: string; // Enum 값 (예: "BEGINNER", "JUNIOR", "MIDDLE", "SENIOR", "JOB_SEEKER")
  description: string;
}

export interface StudyFormatTypeResponse {
  studyFormatType: string; // Enum 값 (예: "PROJECT", "SEMINAR", "MENTORING", "CHALLENGE", "BOOK_LECTURE")
  description: string;
}
