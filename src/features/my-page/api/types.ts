export interface UpdateUserProfileRequest {
  name: string;
  tel: string;
  birthDate?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
  simpleIntroduction?: string;
  mbti?: string;
  interests?: string[];
  profileImageExtension?: string;
}

export interface UpdateUserProfileResponse {
  memberId: number;
  name: string;
  profileImageUploadUrl: string;
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
  techStackIds: number[];
}

export interface UpdateUserProfileInfoResponse {
  memberId: number;
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  techStackIds: number[];
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
