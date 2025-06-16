import { redirect } from 'next/navigation';
import StudyCard from '@/features/study/ui/study-card';
import { getServerCookie } from '@/shared/lib/server-cookie';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';

export default async function Home() {
  const memberIdStr = await getServerCookie('memberId');

  if (!memberIdStr) {
    redirect('/login');
  }
  const memberId = Number(memberIdStr);

  if (isNaN(memberId) || memberId <= 0) {
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
