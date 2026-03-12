import { type Metadata } from 'next';
import MentoringManagementPageClient from '@/features/mentoring/ui/pages/mentoring-management-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
export const metadata: Metadata = generateSEOMetadata({
  title: '멘토 운영 관리',
  description:
    '멘토 신청 처리, 일정 운영, 멘토 기준 쪽지상담 흐름을 함께 관리하세요.',
  path: '/mentoring-management',
});
export default function MentoringManagementPage() {
  return <MentoringManagementPageClient />;
}
