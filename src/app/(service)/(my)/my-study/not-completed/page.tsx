'use client';

import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import Button from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { MemberStudyItem } from '@/features/study/group/api/group-study-types';
import { useMemberStudyListQuery } from '@/features/study/group/model/use-member-study-list-query';
import NotCompletedGroupStudyList from '@/features/study/group/ui/not-completed-group-study-list';
import OpenGroupStudyModal from '@/features/study/group/ui/open-group-modal';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
  status: 'RECRUITING' | 'IN_PROGRESS';
}

export default function NotCompletedPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useMemberStudyListQuery({
    memberId: 1,
    studyType: 'GROUP_STUDY',
    studyStatus: 'NOT_COMPLETED',
    inProgressPage: page,
  });

  // status가 "IN_PROGRESS" 또는 "RECRUITMENT"인 스터디 목록
  const notCompletedStudyList = (data?.notCompleted.content ||
    []) as MemberGroupStudyList[];

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-designer-20b">마이스터디</h1>
        <OpenGroupStudyModal
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
          totalPages={data?.notCompleted.totalPages || 1}
        />
      </div>
    </div>
  );
}
