import { type ReactNode } from 'react';
import { MENTOR_REGISTRATION_GUARD_CARD_CONTENT } from '@/features/mentoring/const/mentor-registration-labels';
import MentorRegistrationGuardCard from '@/features/mentoring/ui/registration/mentor-registration-guard-card';
import { type MentorRegistrationGuardState } from '@/types/mentoring/registration-view';

const GUARD_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1280px] px-150 py-500 sm:px-300 xl:px-400';

interface MentorRegistrationStateBoundaryProps {
  state: Exclude<MentorRegistrationGuardState, 'ready'>;
  onOpenPhoneVerification: () => void;
  phoneVerificationModal?: ReactNode;
}

export default function MentorRegistrationStateBoundary({
  state,
  onOpenPhoneVerification,
  phoneVerificationModal,
}: MentorRegistrationStateBoundaryProps) {
  if (state === 'loading' || state === 'verificationLoading') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <div className="rounded-200 bg-background-alternative h-[240px] animate-pulse" />
      </div>
    );
  }

  if (state === 'verificationRequired') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <MentorRegistrationGuardCard
          {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.verificationRequired}
          onCtaClick={onOpenPhoneVerification}
        />
        {phoneVerificationModal}
      </div>
    );
  }

  if (state === 'loginRequired') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <MentorRegistrationGuardCard
          {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.loginRequired}
        />
      </div>
    );
  }

  if (state === 'permissionRequired') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <MentorRegistrationGuardCard
          {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.permissionRequired}
        />
      </div>
    );
  }

  if (state === 'optionsError') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <MentorRegistrationGuardCard
          {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.optionsError}
        />
      </div>
    );
  }

  if (state === 'mySettingsError') {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <MentorRegistrationGuardCard
          {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.mySettingsError}
        />
      </div>
    );
  }

  return (
    <div className={GUARD_CONTAINER_CLASS}>
      <MentorRegistrationGuardCard
        {...MENTOR_REGISTRATION_GUARD_CARD_CONTENT.verificationError}
      />
    </div>
  );
}
