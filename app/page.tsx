import DateSelector from '@/features/home/data-selector';
import TodayStudyCard from '@/features/home/today-study-card';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';
import StudyListSection from '@/widgets/home/study-list-table';

const mockData = [
  {
    interviewer: "김지원",
    interviewee: "이하늘",
    subject: "TCP 3-way handshake란?",
    feedBack: "핵심 흐름을 잘 설명했음",
    progressStatus: "IN_PROGRESS",
    link: "https://github.com/haneul/study-tcp",
  },
  {
    interviewer: "박민수",
    interviewee: "정예지",
    subject: "HTTP와 HTTPS의 차이",
    feedBack: null,
    progressStatus: "NOT_STARTED",
    link: "",
  },
  {
    interviewer: "조수현",
    interviewee: "김지연",
    subject: "브라우저 렌더링 과정",
    feedBack: "예시가 부족했지만 전체 흐름 설명은 명확했음 예시가 부족했지만 전체 흐름 설명은 명확했음 예시가 부족했지만 전체 흐름 설명은 명확했음 예시가 부족했지만 전체 흐름 설명은 명확했음 예시가 부족했지만 전체 흐름 설명은 명확했음",
    progressStatus: "COMPLETED",
    link: "https://github.com/jiyun/render-flow",
  },
];

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
          <StudyListSection rawData={mockData} />
        </div>
      </div>

      <aside className='w-[335px] shrink-0'>
        <Sidebar />
      </aside>
    </div>
  );
}