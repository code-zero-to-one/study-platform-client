import { type Metadata } from 'next';
import MentoringManagementPageClient from '@/features/mentoring/ui/pages/mentoring-management-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '멘토 운영 관리',
  description: '멘토로 등록한 멘토링의 신청과 일정 운영 상태를 관리하세요.',
  path: '/mentoring-management',
});

export default function MentoringManagementPage() {
  return <MentoringManagementPageClient />;
}
