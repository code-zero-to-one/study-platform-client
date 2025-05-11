import Profile from '@/components/Profile';
import ProfileInfo from '@/components/ProfileInfo';

export default function MyPage() {
  return (
    <div className="flex flex-col gap-[26.67px] pt-[16px]">
      <Profile />
      <ProfileInfo />
    </div>
  );
}
