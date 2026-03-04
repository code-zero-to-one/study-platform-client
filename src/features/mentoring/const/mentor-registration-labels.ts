import { type MentorRegistrationGuardCardProps } from '@/types/mentoring/registration-view';

type GuardCardContentState =
  | 'mySettingsError'
  | 'optionsError'
  | 'loginRequired'
  | 'permissionRequired'
  | 'verificationError'
  | 'verificationRequired';

export const MENTOR_REGISTRATION_GUARD_CARD_CONTENT: Record<
  GuardCardContentState,
  Omit<MentorRegistrationGuardCardProps, 'onCtaClick'>
> = {
  mySettingsError: {
    title: '내 멘토 설정을 불러올 수 없습니다',
    description:
      '기존 멘토 설정 조회에 실패했습니다. 잠시 후 다시 시도해주세요.',
    ctaLabel: '멘토링 목록으로 이동',
    ctaHref: '/mentoring',
  },
  optionsError: {
    title: '등록 옵션을 불러올 수 없습니다',
    description:
      '직군/직무/경력/핵심키워드 옵션 조회에 실패했습니다. 잠시 후 다시 시도해주세요.',
    ctaLabel: '멘토링 목록으로 이동',
    ctaHref: '/mentoring',
  },
  loginRequired: {
    title: '로그인 후 멘토 등록이 가능합니다',
    description: '멘토 프로필을 생성하려면 먼저 로그인해주세요.',
    ctaLabel: '로그인하러 가기',
    ctaHref: '/login',
  },
  permissionRequired: {
    title: '회원/관리자 권한이 필요합니다',
    description:
      '이 페이지는 ROLE_MEMBER 또는 ROLE_ADMIN 권한 사용자만 접근할 수 있습니다.',
    ctaLabel: '멘토링 목록으로 이동',
    ctaHref: '/mentoring',
  },
  verificationError: {
    title: '본인인증 상태 확인이 필요합니다',
    description:
      '인증 상태를 불러오지 못했습니다. 잠시 후 다시 시도하거나 마이페이지에서 상태를 확인해주세요.',
    ctaLabel: '마이페이지로 이동',
    ctaHref: '/my-page',
  },
  verificationRequired: {
    title: '본인인증이 필요합니다',
    description:
      '멘토 등록 전 본인인증을 먼저 완료해주세요. 인증된 휴대폰 번호가 멘토 연락처로 자동 등록됩니다.',
    ctaLabel: '본인인증하기',
  },
};

export const MENTOR_REGISTRATION_TOAST_MESSAGES = {
  memberInfoMissing: '로그인 정보를 확인할 수 없습니다.',
  entryOnboardingCompleted: '멘토 기본 정보가 등록 폼에 채워졌습니다.',
  verificationLoading:
    '본인인증 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.',
  verificationError:
    '본인인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
  mySettingsLoadError:
    '기존 멘토 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  verificationRequired: '멘토 등록 전 본인인증이 필요합니다.',
  verifiedPhoneMissing:
    '본인인증된 휴대폰 번호를 확인할 수 없습니다. 다시 인증해주세요.',
  settingsSaved: '멘토링 설정이 저장되었습니다.',
  verificationCompleted: '본인인증이 완료되었습니다.',
  settlementRegistered: '정산정보가 등록되었습니다.',
} as const;
