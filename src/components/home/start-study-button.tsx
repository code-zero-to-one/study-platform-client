'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';

const StartStudyModal = dynamic(
  () => import('@/components/group-study/modals/start-study-modal'),
  { ssr: false },
);

export default function StartStudyButton() {
  const { memberId, isAuthReady } = useAuthReady();
  const [hasMounted, setHasMounted] = useState(false);
  const isLoggedIn = isAuthReady && !!memberId;

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (
    !hasMounted ||
    !isLoggedIn ||
    !memberId ||
    !userProfile ||
    userProfile.studyApplied
  ) {
    return null;
  }

  return (
    <StartStudyModal
      memberId={memberId}
      trigger={
        <button className="bg-background-alternative rounded-100 hover:bg-background-alternative-hover flex items-center justify-between px-250 py-300 transition-colors">
          <p className="flex flex-col items-start gap-50">
            <span className="font-designer-15b text-text-default">
              CS 스터디를 시작해 보세요!
            </span>
            <span className="font-designer-12m text-text-subtlest">
              스터디 신청하기
            </span>
          </p>
          <Image
            src="/apply-study.svg"
            alt="스터디 시작 버튼"
            width={68}
            height={56}
          />
        </button>
      }
    />
  );
}
