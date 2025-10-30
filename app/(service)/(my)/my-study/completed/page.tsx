'use client';

import { Plus } from 'lucide-react';
import React from 'react';
import { MemberStudyItem } from '@/features/study/group/api/group-study-types';
import { useMemberStudyListQuery } from '@/features/study/group/model/use-member-study-list-query';
import CompletedGroupStudyList from '@/features/study/group/ui/completed-group-study-list';
import Button from '@/shared/ui/button';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
  status: 'COMPLETED';
}

export default function CompletedPage() {
  const { data, isLoading } = useMemberStudyListQuery({
    memberId: 1,
    studyType: 'GROUP_STUDY',
    studyStatus: 'COMPLETED',
  });

  // status가 "COMPLETED"인 스터디 목록
  const completedStudyList = (data?.completed || []) as MemberGroupStudyList[];

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-designer-20b">마이스터디</h1>
        <Button icon={<Plus className="text-text-inverse" />} size="medium">
          스터디 개설하기
        </Button>
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
      </div>
    </div>
  );
}
