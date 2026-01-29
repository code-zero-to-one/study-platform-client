import { Metadata } from 'next';
import { Suspense } from 'react';
import MentoringListPage from '@/components/pages/mentoring-list-page';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '1:1 멘토링 - ZERO-ONE',
  description:
    '전문 멘토와 1:1로 만나 맞춤형 상담과 지식을 얻어보세요. 텍스트 답변, 온라인 상담, 대면 컨설팅 등 다양한 방식으로 멘토링을 받을 수 있습니다.',
  path: '/mentoring',
  keywords: ['1:1 멘토링', '멘토링', '상담', '컨설팅', '전문가 상담'],
  canonicalUrl: 'https://www.zeroone.it.kr/mentoring',
});

export default function MentoringPage() {
  return (
    <Suspense fallback={<MentoringListPageSkeleton />}>
      <MentoringListPage />
    </Suspense>
  );
}

function MentoringListPageSkeleton() {
  return (
    <div className="mx-auto w-[1280px] px-400 py-600">
      <div className="flex h-[400px] items-center justify-center">
        <span className="text-text-subtle">로딩 중...</span>
      </div>
    </div>
  );
}