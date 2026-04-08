import { Suspense } from 'react';
import GroupStudyListPage from '@/components/group-study/pages/group-study-list-page';

export default function GroupStudyPage() {
  return (
    <Suspense fallback={<GroupStudyListPageSkeleton />}>
      <GroupStudyListPage />
    </Suspense>
  );
}

function GroupStudyListPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-400 py-600">
      <div className="flex h-[400px] items-center justify-center">
        <span className="text-text-subtle">로딩 중...</span>
      </div>
    </div>
  );
}
