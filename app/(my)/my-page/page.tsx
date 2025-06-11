import Profile from '@/features/my-page/ui/profile';
import ProfileInfo from '@/features/my-page/ui/profileinfo';

export default function MyPage() {
  return (
    <div className="flex flex-col gap-[26.67px]">
      <Profile />
      <ProfileInfo />
    </div>
  );
}
