'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { ToggleSwitch } from '@/components/common/ui/toggle';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import {
  usePatchAutoMatchingMutation,
  useUserProfileQuery,
} from '@/hooks/queries/use-user-profile-query';
import { useToastStore } from '@/stores/use-toast-store';

const PhoneVerificationModal = dynamic(
  () => import('@/components/common/modals/phone-verification-modal'),
  { ssr: false },
);

const StartStudyModal = dynamic(
  () => import('@/components/common/modals/start-study-modal'),
  { ssr: false },
);

interface StudyMatchingToggleProps {
  showLabel?: boolean;
}

export default function StudyMatchingToggle({
  showLabel = false,
}: StudyMatchingToggleProps) {
  const { memberId, isAuthReady } = useAuthReady();
  const showToast = useToastStore((state) => state.showToast);
  const isLoggedIn = isAuthReady && !!memberId;

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);
  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  const {
    isVerified,
    isLoading: isVerificationLoading,
    isError: isVerificationError,
    setVerified,
  } = usePhoneVerificationStatus(memberId ?? undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [isStartStudyModalOpen, setIsStartStudyModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEnabled(userProfile.autoMatching ?? false);
    }
  }, [userProfile]);

  if (!isLoggedIn || !memberId || !userProfile) {
    return null;
  }

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
    setIsVerificationModalOpen(false);

    // 인증 완료 후 원래 동작 수행
    if (!userProfile.studyApplied) {
      setIsStartStudyModalOpen(true);
    } else {
      // 스터디 신청한 상태에서 토글을 켤 때
      setEnabled(true);
      patchAutoMatching(
        { memberId, autoMatching: true },
        {
          onError: () => {
            setEnabled(false);
          },
        },
      );
    }
  };

  const handleToggleChange = (checked: boolean) => {
    if (isVerificationLoading) return;
    if (isVerificationError) {
      showToast(
        '인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );

      return;
    }
    // 토글을 켤 때만 본인인증 체크 (끌 때는 체크 안 함)
    if (checked && !isVerified) {
      setIsVerificationModalOpen(true);

      return;
    }

    if (!userProfile.studyApplied) {
      setIsStartStudyModalOpen(true);

      return;
    }

    setEnabled(checked);
    patchAutoMatching(
      { memberId, autoMatching: checked },
      {
        onError: () => {
          setEnabled(!checked);
        },
      },
    );
  };

  return (
    <>
      <StartStudyModal
        memberId={memberId}
        open={isStartStudyModalOpen}
        onOpenChange={setIsStartStudyModalOpen}
      />
      <PhoneVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        onVerificationComplete={handleVerificationComplete}
        memberId={memberId}
      />
      <div
        className={cn(
          'flex items-center gap-100',
          showLabel && 'w-full justify-between',
        )}
      >
        <span
          className={cn(
            'font-designer-14r text-text-subtle',
            !showLabel && 'hidden lg:inline',
          )}
        >
          1:1 스터디 매칭
        </span>
        <ToggleSwitch.Root
          size="md"
          checked={enabled}
          onCheckedChange={handleToggleChange}
          disabled={isPending || isVerificationLoading}
        />
      </div>
    </>
  );
}
