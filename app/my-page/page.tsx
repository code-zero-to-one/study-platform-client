import Profile from '@/features/my-page/profile';
import ProfileInfo from '@/features/my-page/profileinfo';
import Sidebar from '@/widgets/my-page/sidebar';

export default function MyPage() {
  return (
    <div className="flex justify-center">
      <Sidebar />

      <div className="flex flex-col gap-[26.67px] px-[150px] pt-[40px] pb-[100px]">
        <Profile />
        <ProfileInfo />
      </div>
    </div>
  );
}
