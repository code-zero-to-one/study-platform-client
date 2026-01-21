import { Metadata } from 'next';
import { Suspense } from 'react';
import StudyCard from '@/features/study/schedule/ui/study-card';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import Banner from '@/widgets/home/banner';
import Sidebar from '@/widgets/home/sidebar';
import HomeContent from './home-content';

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
    <div className="mx-auto flex w-[1496px] gap-600 px-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        {/* 기존 기능을 100% 보존하면서 새로운 탭 시스템 추가 */}
        <Suspense 
          fallback={
            <>
              <Banner />
              <StudyCard />
            </>
          }
        >
          <HomeContent />
        </Suspense>
      </div>

      <aside className="w-[335px] shrink-0">
        <Sidebar />
      </aside>
    </div>
  );
}
