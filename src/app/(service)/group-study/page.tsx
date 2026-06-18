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
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      <div className="mb-600">
        <div className="bg-background-alternative animate-pulse rounded-200 h-[240px]" />
      </div>
      <div className="flex flex-col gap-400">
        <div className="bg-background-alternative animate-pulse rounded-150 h-[60px]" />
        <ul className="grid grid-cols-1 gap-300 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i}>
              <div className="bg-background-alternative animate-pulse rounded-200 h-[380px]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
