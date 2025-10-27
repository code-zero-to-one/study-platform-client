'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import { useMemberId } from './use-auth';

export const useUser = () => {
  const { data: member } = useMemberId();

  const { data: profile } = useQuery({
    queryKey: ['userProfile', member?.memberId],
    queryFn: () => getUserProfile(Number(member?.memberId)),
    enabled: !!member?.memberId, // ✅ memberId 있을 때만 실행
    staleTime: 1000 * 60 * 5,
  });

  return {
    userId: profile?.memberId ?? '',
    userName: profile?.memberProfile.memberName ?? '',
  };
};
