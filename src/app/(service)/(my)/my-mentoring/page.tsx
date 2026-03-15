import { type Metadata } from 'next';
import MyMentoringPageClient from '@/features/mentoring/ui/pages/my-mentoring-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '나의 멘토링 예약 내역',
  description: '신청한 멘토링의 진행 상태와 예약 일정을 확인하세요.',
  path: '/my-mentoring',
});

export default function MyMentoringRoute() {
  return <MyMentoringPageClient />;
}
