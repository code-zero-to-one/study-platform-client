import DateSelector from '@/features/study/ui/data-selector';
import StudyListSection from '@/features/study/ui/study-list-table';
import TodayStudyCard from '@/features/study/ui/today-study-card';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';

export default async function Home() {
  return (
    <div className='container mx-auto min-h-screen py-600 flex gap-600'>
      <div className='flex-1 flex flex-col gap-500'>
        <Banner />
        <div className='flex flex-col gap-300'>
          <div className='font-bold-h3'>3월 1주차 스터디</div>
          <DateSelector />
        </div>
        <div className='p-400 border border-border-default rounded-200 flex flex-col gap-500'>
          <TodayStudyCard
            teamName="2조"
            interviewer={{
              name: '김지원',
              img: '',
            }}
            topic="네트워크 - TCP 3-way handshake"
            status="COMPLETED"
            feedback="1NF, 2NF, 3NF의 차이를 명확하게 설명하였으며, 예제를 통해 이해도를 높였습니다."
          />
          <StudyListSection />
        </div>
      </div>

      <aside className='w-[335px] shrink-0'>
        <Sidebar />
      </aside>
    </div>
  );
}