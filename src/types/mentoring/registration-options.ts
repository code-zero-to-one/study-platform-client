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

export interface MentorRegistrationCoreKeywordOption {
  code: string;
  label: string;
  jobGroupCodes: string[];
  jobTitleCodes: string[];
  displayOrder: number;
  active: boolean;
}

export interface MentorRegistrationOptions {
  maxCoreKeywordCount: number;
  jobGroups: MentorRegistrationJobGroupOption[];
  jobTitles: MentorRegistrationJobTitleOption[];
  careers: MentorRegistrationCareerOption[];
  coreKeywords: MentorRegistrationCoreKeywordOption[];
}
