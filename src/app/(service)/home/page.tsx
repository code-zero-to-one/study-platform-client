import { Metadata } from 'next';
import StartStudyButton from '@/components/home/start-study-button';
import StudyCard from '@/features/study/schedule/ui/study-card';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import Banner from '@/widgets/home/banner';
import FeedbackLink from '@/widgets/home/feedback-link';

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
    <div className="mx-auto w-[1280px] px-400 py-600">
      <div className="flex flex-col gap-500">
        <Banner />
        <FeedbackLink />
        <StartStudyButton />
        <StudyCard />
      </div>
    </div>
  );
}
