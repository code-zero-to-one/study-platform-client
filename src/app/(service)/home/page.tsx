import { Metadata } from 'next';
import HomePageClient from '@/components/pages/home-page-client';
import HomePageServerContent from '@/components/pages/home-page-server-content';
import { parseHomePageSearchParams } from '@/features/home/model/home-page-search-params';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import Banner from '@/widgets/home/banner';
import FeedbackLink from '@/widgets/home/feedback-link';
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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const { activeTab } = parseHomePageSearchParams(resolvedSearchParams);

  return (
    <HomePageClient
      activeTab={activeTab}
      content={<HomePageServerContent activeTab={activeTab} />}
    />
  );
}
