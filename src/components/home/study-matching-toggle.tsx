'use client';

import { useState, useEffect } from 'react';
import { ToggleSwitch } from '@/components/ui/toggle';
import {
  usePatchAutoMatchingMutation,
  useUserProfileQuery,
} from '@/entities/user/model/use-user-profile-query';
import { usePhoneVerificationStatus } from '@/features/phone-verification/model/use-phone-verification-status';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';
import StartStudyModal from '@/features/study/participation/ui/start-study-modal';
import { useAuth } from '@/hooks/common/use-auth';

export default function StudyMatchingToggle() {
  const { data: authData } = useAuth();
  const memberId = authData?.memberId ?? null;
  const isLoggedIn = !!memberId;

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);
  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  const { isVerified, setVerified } = usePhoneVerificationStatus(
    memberId ?? undefined,
  );
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
      <div className="flex items-center gap-100">
        <span className="font-designer-14r text-text-subtle">
          1:1 스터디 매칭
        </span>
        <ToggleSwitch.Root
          size="md"
          checked={enabled}
          onCheckedChange={handleToggleChange}
          disabled={isPending}
        />
      </div>
    </>
  );
}
