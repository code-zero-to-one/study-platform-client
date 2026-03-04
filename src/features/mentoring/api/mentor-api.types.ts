export interface ApiResponse<T> {
  statusCode?: number;
  timestamp?: string;
  content?: T;
  message?: string;
}

export interface MentorMethodOptionResponseDto {
  type?: string;
  label?: string;
  durationLabel?: string;
  price?: number;
  description?: string;
  enabled?: boolean;
  requiresSchedule?: boolean;
  timeSlots?: string[];
}

export interface MentorMethodsResponseDto {
  note?: MentorMethodOptionResponseDto;
  simple?: MentorMethodOptionResponseDto;
  inDepth?: MentorMethodOptionResponseDto;
  offline?: MentorMethodOptionResponseDto;
}

export interface CodeLabelResponseDto {
  code?: string;
  label?: string;
}

export interface CareerCodeLabelResponseDto extends CodeLabelResponseDto {
  minYears?: number;
  // eslint-disable-next-line @rushstack/no-new-null -- backend contract uses null for open-ended ranges.
  maxYears?: number | null;
}

export interface CoreKeywordResponseDto extends CodeLabelResponseDto {
  jobGroupCodes?: string[];
  jobTitleCodes?: string[];
  displayOrder?: number;
  active?: boolean;
}

export interface RegistrationOptionsJobGroupResponseDto
  extends CodeLabelResponseDto {
  displayOrder?: number;
  active?: boolean;
}

export interface RegistrationOptionsJobTitleResponseDto
  extends CodeLabelResponseDto {
  jobGroupCode?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface RegistrationOptionsCareerResponseDto
  extends CareerCodeLabelResponseDto {
  displayOrder?: number;
  active?: boolean;
}

export interface RegistrationOptionsResponseDto {
  maxCoreKeywordCount?: number;
  jobGroups?: RegistrationOptionsJobGroupResponseDto[];
  jobTitles?: RegistrationOptionsJobTitleResponseDto[];
  careers?: RegistrationOptionsCareerResponseDto[];
  coreKeywords?: CoreKeywordResponseDto[];
}

export interface IdentityResponseDto {
  nickname?: string;
  career?: string;
  company?: string;
  imageUrl?: string;
}

export interface StatsResponseDto {
  rating?: number;
  reviewCount?: number;
  mentoringCount?: number;
  menteeCount?: number;
}

export interface IntroductionResponseDto {
  tags?: string[];
  careerHistory?: string[];
  strengths?: string[];
}

export interface CompanyResponseDto {
  category?: string;
  name?: string;
  hideCompanyName?: boolean;
}

export interface ProfileResponseDto {
  categories?: string[];
  mentoringTitle?: string;
  appealLine?: string;
  jobGroup?: string | CodeLabelResponseDto;
  jobGroupCode?: string;
  jobTitle?: string | CodeLabelResponseDto;
  jobTitleCode?: string;
  career?: string | CareerCodeLabelResponseDto;
  careerCode?: string;
  careerYears?: string;
  coreKeywords?: Array<string | CodeLabelResponseDto>;
  coreKeywordCodes?: string[];
  skillTags?: string[];
  company?: CompanyResponseDto;
}

export interface ContentResponseDto {
  detailedDescription?: string;
  interviewQuestions?: string[];
  preNotice?: string;
}

export interface MetadataResponseDto {
  updatedAt?: string;
}

export interface MentorSettingsBoundaryResponseDto {
  mentoringTitle?: string;
  profile?: ProfileResponseDto;
  content?: ContentResponseDto;
  metadata?: MetadataResponseDto;
}

export interface MentorReviewResponseDto {
  id?: number | string;
  authorName?: string;
  rating?: number;
  createdAt?: string;
  content?: string;
  method?: string;
}

export interface MentorProfileResponseDto {
  id?: number;
  summary?: string;
  role?: string;
  career?: string;
  company?: string;
  identity?: IdentityResponseDto;
  stats?: StatsResponseDto;
  introduction?: IntroductionResponseDto;
  profile?: ProfileResponseDto;
  methods?: MentorMethodsResponseDto;
  reviews?: MentorReviewResponseDto[];
  mentorSettings?: MentorSettingsBoundaryResponseDto;
}

export interface PagedResponseDto<T> {
  content?: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export type MentorListResponseDto = PagedResponseDto<MentorProfileResponseDto>;

export interface WeeklyRangeResponseDto {
  start?: string;
  end?: string;
}

export interface WeeklyRangesResponseDto {
  MON?: WeeklyRangeResponseDto[];
  TUE?: WeeklyRangeResponseDto[];
  WED?: WeeklyRangeResponseDto[];
  THU?: WeeklyRangeResponseDto[];
  FRI?: WeeklyRangeResponseDto[];
  SAT?: WeeklyRangeResponseDto[];
  SUN?: WeeklyRangeResponseDto[];
  mon?: WeeklyRangeResponseDto[];
  tue?: WeeklyRangeResponseDto[];
  wed?: WeeklyRangeResponseDto[];
  thu?: WeeklyRangeResponseDto[];
  fri?: WeeklyRangeResponseDto[];
  sat?: WeeklyRangeResponseDto[];
  sun?: WeeklyRangeResponseDto[];
}

export interface MentorDetailResponseDto {
  mentor?: MentorProfileResponseDto;
}

export interface ContactResponseDto {
  email?: string;
}

export interface MethodResponseDto {
  type?: string;
  enabled?: boolean;
  price?: number;
  durationMinutes?: number;
}

export interface WeeklyResponseDto {
  MON?: string[];
  TUE?: string[];
  WED?: string[];
  THU?: string[];
  FRI?: string[];
  SAT?: string[];
  SUN?: string[];
  mon?: string[];
  tue?: string[];
  wed?: string[];
  thu?: string[];
  fri?: string[];
  sat?: string[];
  sun?: string[];
}

export interface ScheduleResponseDto {
  timezone?: string;
  slotUnitMinutes?: number;
  weekly?: WeeklyResponseDto;
  weeklyRanges?: WeeklyRangesResponseDto;
}

export interface MentoringPolicyResponseDto {
  maxParticipants?: number;
}

export interface MentorSettingsResponseDto {
  contact?: ContactResponseDto;
  profile?: ProfileResponseDto;
  policy?: MentoringPolicyResponseDto;
  methods?: MethodResponseDto[];
  schedule?: ScheduleResponseDto;
  content?: ContentResponseDto;
  metadata?: MetadataResponseDto;
}

export interface MyMentorSettingsResponseDto {
  mentorId?: number;
  settings?: MentorSettingsResponseDto;
}

export interface MentorUpsertResponseDto {
  mentorId?: number;
  created?: boolean;
  updatedAt?: string;
}

export interface MentorIntroImageUploadUrlResponseDto {
  uploadUrl?: string;
  publicUrl?: string;
}

export interface MentorMethodRequestDto {
  type: 'NOTE' | 'SIMPLE' | 'IN_DEPTH' | 'OFFLINE';
  enabled: boolean;
  price: number;
  durationMinutes?: number;
}

export interface MentorWeeklyRequestDto {
  mon: string[];
  tue: string[];
  wed: string[];
  thu: string[];
  fri: string[];
  sat: string[];
  sun: string[];
}

export interface MentorTimeRangeRequestDto {
  start: string;
  end: string;
}

export interface MentorWeeklyRangesRequestDto {
  MON: MentorTimeRangeRequestDto[];
  TUE: MentorTimeRangeRequestDto[];
  WED: MentorTimeRangeRequestDto[];
  THU: MentorTimeRangeRequestDto[];
  FRI: MentorTimeRangeRequestDto[];
  SAT: MentorTimeRangeRequestDto[];
  SUN: MentorTimeRangeRequestDto[];
}

export interface MentorSettingsUpsertRequestDto {
  contactEmail: string;
  categories: string[];
  mentoringTitle: string;
  appealLine: string;
  jobGroupCode: string;
  jobTitleCode: string;
  careerCode: string;
  coreKeywordCodes: string[];
  companyCategory: string;
  companyName: string;
  hideCompanyName: boolean;
  maxParticipants: number;
  methods: MentorMethodRequestDto[];
  schedule: {
    timezone: string;
    slotUnitMinutes: number;
    weekly?: MentorWeeklyRequestDto;
    weeklyRanges?: MentorWeeklyRangesRequestDto;
  };
  detailedDescription: string;
  interviewQuestions: string[];
  preNotice: string;
}
