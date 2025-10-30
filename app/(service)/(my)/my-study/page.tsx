'use client';

import { Plus } from 'lucide-react';
import React from 'react';
import MyStudyInfoCard from '@/features/my-page/ui/my-study-info-card';
import { MemberStudyItem } from '@/features/study/group/api/group-study-types';
import { useMemberStudyListQuery } from '@/features/study/group/model/use-member-study-list-query';
import Button from '@/shared/ui/button';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
}

export default function MyStudy() {
  const { data, isLoading } = useMemberStudyListQuery({
    memberId: 1,
    studyType: 'GROUP_STUDY',
    studyStatus: 'BOTH',
  });

  const inProgressStudyList = (data?.notCompleted ||
    []) as MemberGroupStudyList[];
  const completedStudyList = (data?.completed || []) as MemberGroupStudyList[];

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-row justify-between">
        <h1 className="font-designer-20b">마이스터디</h1>
        <Button icon={<Plus className="text-text-inverse" />} size="medium">
          스터디 개설하기
        </Button>
      </div>

      <div className="flex flex-col gap-600">
        <InProgressStudyList studyList={inProgressStudyList} />
        <CompletedStudyList studyList={completedStudyList} />
      </div>
    </div>
  );
}

function InProgressStudyList({
  studyList,
}: {
  studyList: MemberGroupStudyList[];
}) {
  return (
    <div>
      <div className="mb-200 flex flex-row justify-between">
        <h2 className="font-designer-16b text-text-default">
          참여 중인 스터디
        </h2>

        {studyList.length > 9 && (
          <button className="font-designer-14m text-text-subtlest">
            전체보기
          </button>
        )}
      </div>

      {studyList.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
          {studyList.map((study) => (
            <MyStudyInfoCard key={study.studyId} {...study} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <span className="font-designer-20b text-text-default">
            참여하는 스터디가 없습니다.
          </span>
          <span className="font-designer-15r text-text-subtlest">
            원하는 스터디를 찾아보세요!
          </span>
        </div>
      )}
    </div>
  );
}

function CompletedStudyList({
  studyList,
}: {
  studyList: MemberGroupStudyList[];
}) {
  return (
    <div>
      <div className="mb-200 flex flex-row justify-between">
        <h2 className="font-designer-16b text-text-default">종료된 스터디</h2>

        {studyList.length > 9 && (
          <button className="font-designer-14m text-text-subtlest">
            전체보기
          </button>
        )}
      </div>

      {studyList.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
          {studyList.map((study) => (
            <MyStudyInfoCard key={study.studyId} {...study} />
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center">
          <span className="font-designer-15r text-text-subtlest">
            종료된 스터디가 없습니다.
          </span>
        </div>
      )}
    </div>
  );
}
