import { type Metadata } from 'next';
import MentoringScrollCardPlaygroundPage from '@/features/mentoring/ui/pages/mentoring-scroll-card-playground-page';

export const metadata: Metadata = {
  title: '스크롤 추적 카드 연습 페이지 - ZERO-ONE',
  description:
    '프론트엔드 장난감 실험용 스크롤 추적 카드 임시 페이지입니다.',
};

export default function MentoringScrollCardPlaygroundRoute() {
  return <MentoringScrollCardPlaygroundPage />;
}
