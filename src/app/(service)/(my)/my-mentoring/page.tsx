import { type Metadata } from 'next';
import MyMentoringPageClient from '@/features/mentoring/ui/pages/my-mentoring-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
export const metadata: Metadata = generateSEOMetadata({
  title: '나의 멘토링',
  description:
    '멘토 확인 대기, 예정된 멘토링, 지난 내역과 멘티 쪽지상담 흐름을 확인하세요.',
  path: '/my-mentoring',
});
export default function MyMentoringRoute() {
  return <MyMentoringPageClient />;
}
