import { Metadata } from 'next';
import Banner from '@/components/home/banner';
import FeedbackLink from '@/components/home/feedback-link';
import StartStudyButton from '@/components/home/start-study-button';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import HomeContent from './home-content';

export const metadata: Metadata = generateSEOMetadata({
  title: '홈 - ZERO-ONE',
  description:
    '나의 스터디 일정을 관리하고, 진행 중인 스터디를 한눈에 확인하세요. ZERO-ONE 플랫폼에서 효율적인 스터디 관리를 시작해보세요.',
  path: '/home',
  keywords: ['스터디 일정', '스터디 관리', '기상 스터디', '나의 스터디'],
  canonicalUrl: 'https://www.zeroone.it.kr/home',
});

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || 'study';

  return (
    <div className="mx-auto flex w-[1496px] flex-col gap-500 px-600 py-600">
      <Banner />
      <FeedbackLink />
      <StartStudyButton />
      <HomeContent activeTab={activeTab} />
      <div className="h-[400px]" aria-hidden />
    </div>
  );
}
