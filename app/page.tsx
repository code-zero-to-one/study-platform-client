import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import StudyCard from '@/features/study/ui/study-card';
import { getLoginUserId } from '@/shared/lib/get-login-user';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
};

export default async function Home() {
  const memberId = await getLoginUserId();

  if (!memberId) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto flex min-h-screen gap-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        <Banner />
        <StudyCard />
      </div>

      <aside className="w-[335px] shrink-0">
        <Sidebar />
      </aside>
    </div>
  );
}
