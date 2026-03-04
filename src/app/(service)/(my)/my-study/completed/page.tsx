'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import CompletedGroupStudyList from '@/components/lists/completed-group-study-list';
import GroupStudyFormModal from '@/components/modals/group-study-form-modal';
import Button from '@/components/common/ui/button';
import Pagination from '@/components/common/ui/pagination';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import { MemberStudyItem } from '@/types/api/group-study.types';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
  status: 'COMPLETED';
}

export default function CompletedPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useMemberStudyListQuery({
    memberId: 1,
    studyType: 'GROUP_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
  });

  // status가 "COMPLETED"인 스터디 목록
  const completedStudyList = (data?.completed.content ||
    []) as MemberGroupStudyList[];

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
              종료된 스터디
            </h2>
          </div>
          <CompletedGroupStudyList studyList={completedStudyList} />
        </div>

        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={data?.completed.totalPages || 1}
        />
      </div>
    </div>
  );
}
