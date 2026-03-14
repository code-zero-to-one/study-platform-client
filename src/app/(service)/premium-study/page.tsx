import { Suspense } from 'react';
import PremiumStudyListPage from '@/components/pages/premium-study-list-page';

export default function PremiumStudyPage() {
  return (
    <Suspense fallback={<PremiumStudyListPageSkeleton />}>
      <PremiumStudyListPage />
    </Suspense>
  );
}

function PremiumStudyListPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-400 py-600">
      <div className="flex h-[400px] items-center justify-center">
        <span className="text-text-subtle">로딩 중...</span>
      </div>
    </div>
  );
}
