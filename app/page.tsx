import StudyCard from '@/features/study/ui/study-card';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';

export default async function Home() {
  return (
    <div className='container mx-auto min-h-screen py-600 flex gap-600'>
      <div className='flex-1 flex flex-col gap-500'>
        <Banner />
        <StudyCard />
      </div>

      <aside className='w-[335px] shrink-0'>
        <Sidebar />
      </aside>
    </div>
  );
}