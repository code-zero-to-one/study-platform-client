import type {
  AvailableStudyTime,
  Career,
  GetUserProfileResponse,
  Hobby,
  Job,
  MemberInfo,
  MemberProfile,
  PreferredStudySubject,
  ProfileImage,
  ResizedImage,
  SocialLink,
  StudyFormatType,
  TechStack,
} from '@/types/api/user.types';

const normalizePreferredStudySubject = (
  value: PreferredStudySubject | null | undefined,
): PreferredStudySubject | undefined => {
  if (!value) {
    return undefined;
  }

  return {
    studySubjectId: value.studySubjectId,
    name: value.name,
  };
};

const normalizeAvailableStudyTimes = (
  value: AvailableStudyTime[] | null | undefined,
): AvailableStudyTime[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((time) => ({
    id: time.id,
    fromTime: time.fromTime,
    toTime: time.toTime,
    label: time.label,
    fullLabel: time.fullLabel,
  }));
};

const normalizeJobs = (value: Job[] | null | undefined): Job[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((job) => ({
    job: job.job,
    description: job.description,
  }));
};

const normalizeCareer = (value: Career | null | undefined): Career | null => {
  if (!value) {
    return null;
  }

  return {
    career: value.career,
    description: value.description,
  };
};

const normalizeStudyFormatTypes = (
  value: StudyFormatType[] | null | undefined,
): StudyFormatType[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((studyFormatType) => ({
    studyFormatType: studyFormatType.studyFormatType,
    description: studyFormatType.description,
  }));
};

const normalizeMemberInfo = (value: MemberInfo | null | undefined): MemberInfo => {
  return {
    selfIntroduction: value?.selfIntroduction ?? '',
    studyPlan: value?.studyPlan ?? '',
    preferredStudySubject: normalizePreferredStudySubject(
      value?.preferredStudySubject,
    ) as PreferredStudySubject,
    availableStudyTimes: normalizeAvailableStudyTimes(value?.availableStudyTimes),
    jobs: normalizeJobs(value?.jobs),
    career: normalizeCareer(value?.career),
    studyFormatTypes: normalizeStudyFormatTypes(value?.studyFormatTypes),
    goal: value?.goal ?? '',
  };
};

const normalizeResizedImages = (
  value: ResizedImage[] | null | undefined,
): ResizedImage[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((image) => ({
    resizedImageId: image.resizedImageId,
    resizedImageUrl: image.resizedImageUrl,
    imageSizeType: {
      imageTypeName: image.imageSizeType?.imageTypeName,
      width: image.imageSizeType?.width,
      height: image.imageSizeType?.height,
    },
  }));
};

const normalizeProfileImage = (
  value: ProfileImage | null | undefined,
): ProfileImage | undefined => {
  if (!value) {
    return undefined;
  }

  return {
    imageId: value.imageId,
    resizedImages: normalizeResizedImages(value.resizedImages),
  };
};

const normalizeSocialLink = (
  value: SocialLink | null | undefined,
): SocialLink | undefined => {
  if (!value) {
    return undefined;
  }

  return {
    socialMediaId: value.socialMediaId,
    url: value.url,
    iconUrl: value.iconUrl,
    type: value.type,
  };
};

const normalizeTechStacks = (
  value: TechStack[] | null | undefined,
): TechStack[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((techStack) => ({
    techStackId: techStack.techStackId,
    code: techStack.code,
    techStackName: techStack.techStackName,
    parentId: techStack.parentId,
    level: techStack.level,
  }));
};

const normalizeInterests = (
  value: MemberProfile['interests'] | null | undefined,
): MemberProfile['interests'] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((interest) => ({
    id: interest.id,
    name: interest.name,
  }));
};

const normalizeHobbies = (value: Hobby[] | null | undefined): Hobby[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((hobby) => ({
    id: hobby.id,
    name: hobby.name,
  }));
};

const normalizeMemberProfile = (
  value: MemberProfile | null | undefined,
): MemberProfile => {
  return {
    memberName: value?.memberName ?? '',
    tel: value?.tel,
    nickname: value?.nickname ?? '',
    profileImage: normalizeProfileImage(value?.profileImage) as ProfileImage,
    simpleIntroduction: value?.simpleIntroduction ?? '',
    mbti: value?.mbti ?? '',
    interests: normalizeInterests(value?.interests),
    hobbies: normalizeHobbies(value?.hobbies),
    birthDate: value?.birthDate ?? '',
    githubLink: normalizeSocialLink(value?.githubLink),
    blogOrSnsLink: normalizeSocialLink(value?.blogOrSnsLink),
    techStacks: normalizeTechStacks(value?.techStacks),
  };
};

export const normalizeUserProfileResponse = (
  value: GetUserProfileResponse,
): GetUserProfileResponse => {
  return {
    ...value,
    memberInfo: normalizeMemberInfo(value.memberInfo),
    memberProfile: normalizeMemberProfile(value.memberProfile),
  };
};
