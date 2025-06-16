import { redirect } from 'next/navigation';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import Profile from '@/features/my-page/ui/profile';
import ProfileInfo from '@/features/my-page/ui/profileinfo';
import { getLoginUserId } from '@/shared/lib/get-login-user';

export default async function MyPage() {
  const memberId = await getLoginUserId();

  if (!memberId) {
    redirect('/login');
  }

  const userProfile = await getUserProfile(memberId);

  return (
    <div className="flex flex-col gap-[26.67px]">
      <Profile memberId={memberId} memberProfile={userProfile.memberProfile} />
      <ProfileInfo memberId={memberId} memberInfo={userProfile.memberInfo} />
    </div>
  );
}
