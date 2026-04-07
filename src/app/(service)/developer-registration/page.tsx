import { type Metadata } from 'next';
import DeveloperRegistrationPageClient from '@/features/developer/ui/pages/developer-registration-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '개발자 등록 - ZERO-ONE',
  description:
    'ZERO-ONE에서 개발자 등록 여부를 설정하고, 서비스 내 개발자 상태 사용처에 반영할 수 있습니다.',
  path: '/developer-registration',
  keywords: ['개발자 등록', '개발자 상태', '프로필 설정'],
});

export default function DeveloperRegistrationRoute() {
  return <DeveloperRegistrationPageClient />;
}
