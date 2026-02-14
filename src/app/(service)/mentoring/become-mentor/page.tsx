import { type Metadata } from 'next';
import MentorRegistrationPage from '@/components/mentoring/mentor-registration-page';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '멘토링 설정 - ZERO-ONE',
  description:
    '멘토 권한 사용자는 연락처, 카테고리, 가격, 일정, 정산정보를 입력해 멘토링 설정을 완료할 수 있습니다.',
  path: '/mentoring/become-mentor',
  keywords: ['멘토 등록', '멘토링 설정', '멘토 프로필'],
});

export default function BecomeMentorRoute() {
  return <MentorRegistrationPage />;
}
