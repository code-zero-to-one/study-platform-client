import { QueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import UserAvatar from '@/components/ui/avatar';
import TabMenu from '@/components/ui/tab-menu';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import { GetUserProfileResponse } from '@/entities/user/api/types';
import { getServerCookie } from '@/utils/server-cookie';
import OutIcon from 'public/icons/out.svg';

export default async function AdminSideBar() {
  const queryClient = new QueryClient();

  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr);

  if (!memberId) {
    return null;
  }

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfileInServer(memberId),
  });

  const profile: GetUserProfileResponse = await queryClient.getQueryData([
    'userProfile',
    memberId,
  ]);

  return (
    <aside className="border-border-subtle h-screen w-fit border-r p-200">
      <div className="border-border-subtle flex items-center gap-150 border-b py-200">
        <UserAvatar
          size={40}
          image={
            profile.memberProfile?.profileImage?.resizedImages[0]
              .resizedImageUrl
          }
        />

        <div className="w-[136px]">
          <p className="font-designer-14m text-text-default">
            {profile.memberProfile.memberName}
          </p>
        </div>

        <Link href="/">
          <OutIcon />
        </Link>
      </div>

      <nav className="mt-200">
        <TabMenu active={true}>
          <Link href="/admin">사용자 관리</Link>
        </TabMenu>
      </nav>
    </aside>
  );
}
