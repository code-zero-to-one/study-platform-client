'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import { useMemberId } from './use-auth';
import { useUserStore } from './store';

export const useUser = () => {
  const { data: member } = useMemberId();
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', member?.memberId],
    queryFn: () => getUserProfile(Number(member?.memberId)),
    enabled: !!member?.memberId, // ✅ memberId 있을 때만 실행
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (profile) {
      setUserInfo({
        memberId: profile.memberId,
        nickname: profile.memberProfile.nickname,
        memberName: profile.memberProfile.memberName,
        tel: profile.memberProfile.tel ?? null,
      });
    }
  }, [profile, setUserInfo]);

  return {
    userId: profile?.memberId ?? '',
    userName: profile?.memberProfile.memberName ?? '',
  };
};
