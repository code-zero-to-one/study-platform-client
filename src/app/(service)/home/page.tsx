import { Metadata } from 'next';
import StudyCard from '@/features/study/schedule/ui/study-card';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';

export const metadata: Metadata = generateSEOMetadata({
  title: '홈 - ZERO-ONE',
  description:
    '나의 스터디 일정을 관리하고, 진행 중인 스터디를 한눈에 확인하세요. ZERO-ONE 플랫폼에서 효율적인 스터디 관리를 시작해보세요.',
  path: '/home',
  keywords: ['스터디 일정', '스터디 관리', '기상 스터디', '나의 스터디'],
  canonicalUrl: 'https://www.zeroone.it.kr/home',
});

export default async function Home() {
  return (
    <div className="flex gap-600 py-600">
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
