import Profile from '@/features/my-page/profile';
import ProfileInfo from '@/features/my-page/profileinfo';

export default function MyPage() {
  return (
    <div className="flex flex-col gap-[26.67px]">
      <Profile />
      <ProfileInfo />
    </div>
  );
}
