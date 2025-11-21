import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import { GetUserProfileResponse } from '@/entities/user/api/types';
import Profile from '@/features/my-page/ui/profile';
import ProfileInfo from '@/features/my-page/ui/profile-info';
import { getServerCookie } from '@/shared/lib/server-cookie';

export default async function MyPage() {
  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfileInServer(Number(memberId)),
  });

  const userProfile: GetUserProfileResponse = await queryClient.getQueryData([
    'userProfile',
    memberId,
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-[26.67px]">
        <Profile
          memberId={memberId}
          memberProfile={userProfile.memberProfile}
          sincerityTemp={userProfile.sincerityTemp}
        />
        <ProfileInfo memberId={memberId} memberInfo={userProfile.memberInfo} />
      </div>
    </HydrationBoundary>
  );
}
