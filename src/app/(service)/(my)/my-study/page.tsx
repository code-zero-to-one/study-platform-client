'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import Button from '@/components/common/ui/button';
import CompletedGroupStudyList from '@/components/lists/completed-group-study-list';
import NotCompletedGroupStudyList from '@/components/lists/not-completed-group-study-list';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useMemberStudyListV2Query } from '@/hooks/queries/use-member-study-list-query';
import type { MemberStudyItem } from '@/types/api/group-study.types';

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

const PREVIEW_LIMIT = 9;

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY' | 'MENTOR_STUDY';
}

export default function MyStudy() {
  const { memberId } = useAuthReady();

  const { data: notCompletedData, isLoading: isLoadingNotCompleted } =
    useMemberStudyListV2Query({
      memberId,
      studyType: 'BOTH',
      studyStatus: 'NOT_COMPLETED',
      pageSize: 50,
    });

  const { data: completedData, isLoading: isLoadingCompleted } =
    useMemberStudyListV2Query({
      memberId,
      studyType: 'BOTH',
      studyStatus: 'COMPLETED',
      pageSize: 9,
    });

  const isLoading = isLoadingNotCompleted || isLoadingCompleted;

  const { notCompletedStudyList, completedStudyList } = useMemo(() => {
    const now = new Date();
    const allNotCompleted = notCompletedData?.content ?? [];

    const isEnded = (study: MemberStudyItem) =>
      study.status === 'COMPLETED' ||
      (study.endTime && new Date(study.endTime) < now);

    const isGroupOrMentorStudy = (
      study: MemberStudyItem,
    ): study is MemberGroupStudyList =>
      study.type === 'GROUP_STUDY' || study.type === 'MENTOR_STUDY';

    const groupStudies = allNotCompleted.filter(isGroupOrMentorStudy);
    const active = groupStudies.filter((s) => !isEnded(s));
    const ended = groupStudies.filter(isEnded);

    return {
      notCompletedStudyList: active.slice(0, PREVIEW_LIMIT),
      completedStudyList: [
        ...(completedData?.content ?? []).filter(isGroupOrMentorStudy),
        ...ended,
      ].slice(0, PREVIEW_LIMIT),
    };
  }, [notCompletedData, completedData]);

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

          <NotCompletedGroupStudyList studyList={notCompletedStudyList} />
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
          <CompletedGroupStudyList studyList={completedStudyList} />
        </div>
      </div>
    </div>
  );
}
