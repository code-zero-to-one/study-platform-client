import type { MentorRegistrationGuardState } from '@/types/mentoring/registration-view';

interface ResolveMentorRegistrationGuardStateParams {
  isHydrated: boolean;
  isAuthenticated: boolean;
  canWriteMentorProfile: boolean;
  isMentorSettingsLoading: boolean;
  isRegistrationOptionsLoading: boolean;
  isMentorSettingsError: boolean;
  isRegistrationOptionsError: boolean;
  isVerificationLoading: boolean;
  isVerificationError: boolean;
  isVerified: boolean;
}

export const resolveMentorRegistrationGuardState = ({
  isHydrated,
  isAuthenticated,
  canWriteMentorProfile,
  isMentorSettingsLoading,
  isRegistrationOptionsLoading,
  isMentorSettingsError,
  isRegistrationOptionsError,
  isVerificationLoading,
  isVerificationError,
  isVerified,
}: ResolveMentorRegistrationGuardStateParams): MentorRegistrationGuardState => {
  if (!isHydrated) {
    return 'loading';
  }

  if (!isAuthenticated) {
    return 'loginRequired';
  }

  if (!canWriteMentorProfile) {
    return 'permissionRequired';
  }

  if (isMentorSettingsLoading || isRegistrationOptionsLoading) {
    return 'loading';
  }

  if (isMentorSettingsError) {
    return 'mySettingsError';
  }

  if (isRegistrationOptionsError) {
    return 'optionsError';
  }

  if (isVerificationLoading) {
    return 'verificationLoading';
  }

  if (isVerificationError) {
    return 'verificationError';
  }

  if (!isVerified) {
    return 'verificationRequired';
  }

  return 'ready';
};
