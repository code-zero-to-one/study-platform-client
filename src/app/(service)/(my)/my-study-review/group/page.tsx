'use client';

import { useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import MemberStudyCard from './_components/member-study-card';

export default function GroupStudyReviewListPage() {
  const [page, setPage] = useState(1);
  const { memberId } = useAuthReady();

  const { data: completedGroupStudy } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType: 'GROUP_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 9,
    asLeader: true,
  });

  const completedGroupStudies = completedGroupStudy?.completed.content ?? [];

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <div className="flex flex-col gap-400">
        {completedGroupStudies.length === 0 ? (
          <div className="flex items-center justify-center py-600">
            <span className="font-designer-15r text-text-subtlest">
              운영한 그룹스터디가 없습니다.
            </span>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
            {completedGroupStudies.map((study) => (
              <MemberStudyCard
                key={study.studyId ?? study.title}
                study={study}
                basePath="/my-study-review/group"
              />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={completedGroupStudy?.completed.totalPages ?? 1}
        />
      </div>
    </div>
  );
}
