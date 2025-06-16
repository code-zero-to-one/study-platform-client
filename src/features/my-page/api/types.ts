export interface UpdateUserProfileRequest {
  name: string;
  tel: string;
  githubLink: string;
  blogOrSnsLink: string;
  simpleIntroduction: string;
  mbti: string;
  birthDate: string;
  interests: string[];
  hobbies: string[];
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
  preferredStudySubject: string;
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
