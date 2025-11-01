'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { MemberStudyItem } from '@/features/study/group/api/group-study-types';
import { useMemberStudyListQuery } from '@/features/study/group/model/use-member-study-list-query';
import CompletedGroupStudyList from '@/features/study/group/ui/completed-group-study-list';
import NotCompletedGroupStudyList from '@/features/study/group/ui/not-completed-group-study-list';
import OpenGroupStudyModal from '@/features/study/group/ui/open-group-modal';
import { getCookie } from '@/shared/tanstack-query/cookie';
import Button from '@/shared/ui/button';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
}

export default function MyStudy() {
  const memberIdStr = getCookie('memberId');

  const { data, isLoading } = useMemberStudyListQuery({
    memberId: Number(memberIdStr),
    studyType: 'GROUP_STUDY',
    studyStatus: 'BOTH',
  });

  // status가 "IN_PROGRESS" 또는 "RECRUITMENT"인 스터디 목록
  const notCompletedStudyList = (data?.notCompleted.content ||
    []) as MemberGroupStudyList[];

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

            <Link
              href="/my-study/not-completed"
              className="font-designer-14m text-text-subtlest"
            >
              전체보기
            </Link>
          </div>

          <NotCompletedGroupStudyList
            studyList={notCompletedStudyList.filter((study, idx) => idx < 9)}
          />
        </div>

        <div>
          <div className="mb-200 flex flex-row justify-between">
            <h2 className="font-designer-16b text-text-default">
              종료된 스터디
            </h2>

            <Link
              href="/my-study/completed"
              className="font-designer-14m text-text-subtlest"
            >
              전체보기
            </Link>
          </div>
          <CompletedGroupStudyList
            studyList={completedStudyList.filter((study, idx) => idx < 9)}
          />
        </div>
      </div>
    </div>
  );
}
