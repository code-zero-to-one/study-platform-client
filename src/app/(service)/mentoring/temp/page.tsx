import { Metadata } from 'next';
import MentoringTempPage from '@/features/mentoring/ui/pages/mentoring-temp-page';

export const metadata: Metadata = {
  title: '멘토링 임시 검증 페이지 - ZERO-ONE',
  description:
    '멘토링 신청/관리/후기 플로우를 빠르게 검증하기 위한 임시 페이지',
};

export default function MentoringTempRoute() {
  return <MentoringTempPage />;
}
