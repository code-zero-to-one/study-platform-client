'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import Pagination from '@/components/common/ui/pagination';
import NotCompletedGroupStudyList from '@/components/home/lists/not-completed-group-study-list';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useMemberStudyListV2Query } from '@/hooks/queries/user/use-member-study-list-query';
import type { MemberStudyItem } from '@/types/api/group-study.types';

const GroupStudyFormModal = dynamic(
  () => import('@/components/group-study/modals/group-study-form-modal'),
  { ssr: false },
);

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY' | 'MENTOR_STUDY';
  status: 'RECRUITING' | 'IN_PROGRESS';
}

export default function NotCompletedPage() {
  const { memberId } = useAuthReady();
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useMemberStudyListV2Query({
    memberId,
    studyType: 'BOTH',
    studyStatus: 'NOT_COMPLETED',
    page,
  });

  // status가 "IN_PROGRESS" 또는 "RECRUITMENT"인 스터디 목록 (ONE_ON_ONE_STUDY 제외)
  const notCompletedStudyList = (data?.content || []).filter(
    (s) => s.type === 'GROUP_STUDY' || s.type === 'MENTOR_STUDY',
  ) as MemberGroupStudyList[];

  if (isLoading) {
    return null;
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
              참여 중인 스터디
            </h2>
          </div>

          <NotCompletedGroupStudyList studyList={notCompletedStudyList} />
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
