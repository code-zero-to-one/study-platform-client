export interface MentorRegistrationJobGroupOption {
  code: string;
  label: string;
  displayOrder: number;
  active: boolean;
}

export interface MentorRegistrationJobTitleOption {
  code: string;
  jobGroupCode: string;
  label: string;
  displayOrder: number;
  active: boolean;
}

export interface MentorRegistrationCareerOption {
  code: string;
  label: string;
  minYears: number;
  maxYears?: number;
  displayOrder: number;
  active: boolean;
}

export interface MentorRegistrationSelectableCoreKeywordOption {
  code: string;
  label: string;
  jobGroupCodes: string[];
  jobTitleCodes: string[];
  displayOrder: number;
  active: boolean;
}

export type MentorRegistrationCoreKeywordOption =
  MentorRegistrationSelectableCoreKeywordOption;

export interface MentorRegistrationOptions {
  maxCoreKeywordCount: number;
  jobGroups: MentorRegistrationJobGroupOption[];
  jobTitles: MentorRegistrationJobTitleOption[];
  careers: MentorRegistrationCareerOption[];
  /**
   * 등록 화면에서만 노출하는 운영 키워드 풀이다.
   * 실제 멘토 프로필에 저장되거나 공개 화면에서 노출되는 키워드와는 분리한다.
   */
  selectableCoreKeywords: MentorRegistrationSelectableCoreKeywordOption[];
}
