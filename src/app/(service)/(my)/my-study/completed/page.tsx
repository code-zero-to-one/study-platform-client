'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import { Skeleton } from '@/components/common/ui/loading-skeleton';
import Pagination from '@/components/common/ui/pagination';
import CompletedGroupStudyList from '@/components/lists/completed-group-study-list';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useMemberStudyListV2Query } from '@/hooks/queries/use-member-study-list-query';
import type { MemberStudyItem } from '@/types/api/group-study.types';

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY' | 'MENTOR_STUDY';
  status: 'COMPLETED';
}

export default function CompletedPage() {
  const { memberId } = useAuthReady();
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useMemberStudyListV2Query({
    memberId,
    studyType: 'BOTH',
    studyStatus: 'COMPLETED',
    page,
  });

  // status가 "COMPLETED"인 스터디 목록 (ONE_ON_ONE_STUDY 제외)
  const completedStudyList = (data?.content || []).filter(
    (list) => list.type === 'GROUP_STUDY' || list.type === 'MENTOR_STUDY',
  ) as MemberGroupStudyList[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-300">
        <div className="flex flex-row items-center justify-between">
          <Skeleton className="h-300 w-[120px]" />
          <Skeleton className="h-300 w-[130px]" />
        </div>
        <div>
          <Skeleton className="mb-200 h-200 w-[120px]" />
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex flex-col gap-100">
                <Skeleton className="h-study-card rounded-100" />
                <Skeleton className="h-150 w-[60px]" />
                <Skeleton className="h-150 w-full" />
                <Skeleton className="h-100 w-4/5" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-designer-20b">마이스터디</h1>
        <GroupStudyFormModal
          mode="create"
          trigger={
            <Button icon={<Plus className="text-text-inverse" />} size="medium">
              스터디 개설하기
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-600">
        <div>
          <div className="mb-200 flex flex-row justify-between">
            <h2 className="font-designer-16b text-text-default">
              종료된 스터디
            </h2>
          </div>
          <CompletedGroupStudyList studyList={completedStudyList} />
        </div>

        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={data?.totalPages || 1}
        />
      </div>
    </div>
  );
}
