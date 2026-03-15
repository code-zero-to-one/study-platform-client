import { ApiError } from '@/api/client/api-error';
import { createServerLikeMentorRegistrationValues } from '@/features/admin/mentoring/model/mock-seed';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { createMentorProfileFromRegistration } from '@/stores/useMentorDirectoryStore';
import type {
  MentorDirectoryPage,
  MentorProfile,
  MentorSortType,
} from '@/types/mentoring/domain';

const LOCAL_FALLBACK_ENABLED = process.env.NODE_ENV !== 'production';
const DEFAULT_PAGE_SIZE = 12;

const buildLocalFallbackMentors = (): MentorProfile[] => {
  const nowIso = new Date().toISOString();

  const backendMentor = createMentorProfileFromRegistration(
    101,
    createServerLikeMentorRegistrationValues(nowIso),
    nowIso,
  );
  const frontendMentor = createMentorProfileFromRegistration(
    102,
    {
      ...createServerLikeMentorRegistrationValues(nowIso),
      mentoringTitle: '프론트엔드 이직/포트폴리오 집중 멘토링',
      appealLine: '프론트엔드 이직 전략 멘토',
      jobGroup: '프론트엔드 개발자',
      jobTitle: '시니어 프론트엔드 엔지니어',
      careerYears: '미들 (6년차)',
      skillTags: ['React', 'Next.js', 'TypeScript', 'UI/UX'],
      categories: ['커리어', '포트폴리오', '프론트엔드'],
      companyName: 'Product House',
      notePrice: 24000,
      simplePrice: 34000,
      deepPrice: 54000,
      offlineEnabled: false,
      detailedDescription:
        '이직 포트폴리오, 프로젝트 설명 구조화, 프론트엔드 기술면접 답변 정리에 초점을 맞춰 진행합니다.',
      preNotice:
        '포트폴리오 링크와 이직 목표 회사를 미리 남겨주시면 우선순위에 맞게 피드백합니다.',
    },
    nowIso,
  );

  return [backendMentor, frontendMentor];
};

const LOCAL_FALLBACK_MENTORS = buildLocalFallbackMentors();

const dedupeMentors = (mentors: MentorProfile[]) => {
  const seen = new Set<number>();

  return mentors.filter((mentor) => {
    if (seen.has(mentor.id)) {
      return false;
    }

    seen.add(mentor.id);

    return true;
  });
};

const getVisibleMentors = (createdMentors: MentorProfile[]) => {
  return createdMentors.filter((mentor) => {
    return getMentorSettings(mentor).listVisible !== false;
  });
};

const getEnabledMethodMinPrice = (mentor: MentorProfile) => {
  const prices = Object.values(mentor.methods)
    .filter((method) => method.enabled !== false)
    .map((method) => method.price)
    .filter((price) => Number.isFinite(price));

  return prices.length > 0 ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
};

const matchesKeyword = (mentor: MentorProfile, keyword?: string) => {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const mentorSettings = getMentorSettings(mentor);
  const searchIndex = [
    mentor.nickname,
    mentor.role,
    mentor.career,
    mentor.company,
    mentor.summary,
    mentor.bio,
    mentorSettings.mentoringTitle,
    mentorSettings.appealLine,
    mentorSettings.jobTitle,
    mentorSettings.jobGroup,
    mentorSettings.careerYears,
    ...mentor.tags,
    ...mentor.careerHistory,
    ...mentorSettings.skillTags,
    ...mentorSettings.categories,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchIndex.includes(normalizedKeyword);
};

const matchesCareerCodes = (mentor: MentorProfile, careerCodes?: string[]) => {
  if (!careerCodes || careerCodes.length === 0) {
    return true;
  }

  const normalizedCareerHaystack = [
    mentor.career,
    mentor.role,
    getMentorSettings(mentor).careerYears,
  ]
    .join(' ')
    .toLowerCase();

  return careerCodes.some((careerCode) => {
    return normalizedCareerHaystack.includes(careerCode.trim().toLowerCase());
  });
};

const sortMentors = (
  mentors: MentorProfile[],
  sortType: MentorSortType | undefined,
) => {
  const source = [...mentors];

  if (sortType === 'rating') {
    return source.sort((left, right) => right.rating - left.rating);
  }

  if (sortType === 'review') {
    return source.sort((left, right) => right.reviewCount - left.reviewCount);
  }

  if (sortType === 'low-price') {
    return source.sort((left, right) => {
      return getEnabledMethodMinPrice(left) - getEnabledMethodMinPrice(right);
    });
  }

  return source;
};

const paginateMentors = (
  mentors: MentorProfile[],
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): MentorDirectoryPage => {
  const safePage = Math.max(page, 0);
  const safeSize = Math.max(size, 1);
  const totalElements = mentors.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));
  const currentPage = Math.min(safePage, totalPages - 1);
  const start = currentPage * safeSize;
  const pagedMentors = mentors.slice(start, start + safeSize);

  return {
    mentors: pagedMentors,
    page: currentPage,
    size: safeSize,
    totalElements,
    totalPages,
    hasNext: currentPage + 1 < totalPages,
    hasPrevious: currentPage > 0,
  };
};

const getMergedLocalMentors = (createdMentors: MentorProfile[]) => {
  return dedupeMentors([
    ...getVisibleMentors(createdMentors),
    ...(LOCAL_FALLBACK_ENABLED ? LOCAL_FALLBACK_MENTORS : []),
  ]);
};

export const shouldUseLocalMentorFallback = (error: unknown) => {
  return (
    LOCAL_FALLBACK_ENABLED &&
    error instanceof ApiError &&
    error.statusCode === 404
  );
};

export const getLocalMentorDirectoryPage = ({
  createdMentors,
  keyword,
  sortType,
  careerCodes,
  page,
  size,
}: {
  createdMentors: MentorProfile[];
  keyword?: string;
  sortType?: MentorSortType;
  careerCodes?: string[];
  page?: number;
  size?: number;
}): MentorDirectoryPage => {
  const filteredMentors = getMergedLocalMentors(createdMentors)
    .filter((mentor) => matchesKeyword(mentor, keyword))
    .filter((mentor) => matchesCareerCodes(mentor, careerCodes));

  return paginateMentors(sortMentors(filteredMentors, sortType), page, size);
};

export const getLocalMentorCareerOptions = (
  createdMentors: MentorProfile[],
) => {
  return Array.from(
    new Set(
      getMergedLocalMentors(createdMentors)
        .map((mentor) => {
          const careerLabel = getMentorSettings(mentor).careerYears.trim();

          return careerLabel.length > 0 ? careerLabel : mentor.career.trim();
        })
        .filter((careerLabel) => careerLabel.length > 0),
    ),
  ).map((careerLabel) => ({
    code: careerLabel,
    label: careerLabel,
  }));
};

export const findLocalFallbackMentor = ({
  mentorId,
  createdMentors,
}: {
  mentorId: number;
  createdMentors: MentorProfile[];
}): MentorProfile | undefined => {
  return getMergedLocalMentors(createdMentors).find((mentor) => {
    return mentor.id === mentorId;
  });
};

export const getMentorDirectoryErrorMessage = (error: unknown) => {
  if (shouldUseLocalMentorFallback(error)) {
    return '멘토 목록을 불러오지 못해 검증용 멘토 목록을 대신 표시하고 있습니다.';
  }

  if (error instanceof ApiError && error.statusCode === 404) {
    return '현재 노출 가능한 멘토 정보를 찾지 못했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (
    error instanceof Error &&
    error.message.trim().toLowerCase() === 'specified resource is not found.'
  ) {
    return '현재 노출 가능한 멘토 정보를 찾지 못했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return '멘토 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
};
