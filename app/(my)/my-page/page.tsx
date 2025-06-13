import { getUserProfile } from '@/entities/user/api/get-user-profile';
import Profile from '@/features/my-page/ui/profile';
import ProfileInfo from '@/features/my-page/ui/profileinfo';
import { getServerCookie } from '@/shared/lib/server-cookie';

export default async function MyPage() {
  const memberIdStr = await getServerCookie('memberId');
  const memberId = Number(memberIdStr ?? 0);

  if (!memberId) {
    return <div>로그인이 필요합니다.</div>;
  }

  const userProfile = await getUserProfile(memberId);

  return (
    <div className="flex flex-col gap-[26.67px]">
      <Profile memberId={memberId} memberProfile={userProfile.memberProfile} />
      <ProfileInfo memberInfo={userProfile.memberInfo} />
    </div>
  );
}
