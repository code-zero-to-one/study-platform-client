import { type Metadata } from 'next';
import MyMentoringDetailPageClient from '@/features/mentoring/ui/pages/my-mentoring-detail-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface MyMentoringDetailRouteProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = generateSEOMetadata({
  title: '나의 멘토링 상세',
  description: '선택한 멘토링의 신청 내용과 현재 진행 상태를 확인하세요.',
  path: '/my-mentoring',
});

export default async function MyMentoringDetailRoute({
  params,
}: MyMentoringDetailRouteProps) {
  const { id } = await params;

  return <MyMentoringDetailPageClient requestId={id} />;
}
