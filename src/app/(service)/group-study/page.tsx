import { Suspense } from 'react';
import GroupStudyListPage from '@/features/study/group/ui/group-study-list-page';

export default function GroupStudyPage() {
  return (
    <Suspense fallback={<GroupStudyListPageSkeleton />}>
      <GroupStudyListPage />
    </Suspense>
  );
}

function GroupStudyListPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-400 py-600">
      <div className="flex h-[400px] items-center justify-center">
        <span className="text-text-subtle">로딩 중...</span>
      </div>
    </div>
  );
}
