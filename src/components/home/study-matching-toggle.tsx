'use client';

import { useState, useEffect } from 'react';
import { ToggleSwitch } from '@/components/ui/toggle';
import { usePatchAutoMatchingMutation, useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import StartStudyModal from '@/features/study/participation/ui/start-study-modal';
import { useAuth } from '@/hooks/common/use-auth';

export default function StudyMatchingToggle() {
  const { data: authData } = useAuth();
  const memberId = authData?.memberId ?? null;
  const isLoggedIn = !!memberId;

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);
  const { mutate: patchAutoMatching, isPending } = usePatchAutoMatchingMutation();

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

  const handleToggleChange = (checked: boolean) => {
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
      <div className="flex items-center gap-100">
        <span className="font-designer-14r text-text-subtle">1:1 스터디 매칭</span>
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

