'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import Button from '@/components/common/ui/button';
import CompletedGroupStudyList from '@/components/lists/completed-group-study-list';
import NotCompletedGroupStudyList from '@/components/lists/not-completed-group-study-list';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import { MemberStudyItem } from '@/types/api/group-study.types';

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY';
}

export default function MyStudy() {
  const { memberId } = useAuthReady();

  const { data, isLoading } = useMemberStudyListQuery({
    memberId,
    studyType: 'GROUP_STUDY',
    studyStatus: 'BOTH',
  });

  const { notCompletedStudyList, completedStudyList } = useMemo(() => {
    const now = new Date();
    const allNotCompleted = data?.notCompleted.content || [];

    // endTime이 지나지 않고 수동 종료(COMPLETED)되지 않은 스터디만 표시
    const notCompleted = allNotCompleted.filter(
      (study) =>
        study.status !== 'COMPLETED' &&
        (!study.endTime || new Date(study.endTime) >= now),
    ) as MemberGroupStudyList[];

    // status=COMPLETED(수동 종료) 또는 endTime 경과 → completed 섹션으로 이동
    const movedToCompleted = allNotCompleted.filter(
      (study) =>
        study.status === 'COMPLETED' ||
        (study.endTime && new Date(study.endTime) < now),
    ) as MemberGroupStudyList[];

    const completed = [
      ...(data?.completed.content || []),
      ...movedToCompleted,
    ] as MemberGroupStudyList[];

    return { notCompletedStudyList: notCompleted, completedStudyList: completed };
  }, [data]);

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

            <Link
              href="/my-study/not-completed"
              className="font-designer-14m text-text-subtlest"
            >
              전체보기
            </Link>
          </div>

          <NotCompletedGroupStudyList
            studyList={notCompletedStudyList.slice(0, 9)}
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
            studyList={completedStudyList.slice(0, 9)}
          />
        </div>
      </div>
    </div>
  );
}
