'use client';

import { useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import MemberStudyCard from '../group/_components/member-study-card';

export default function OneToOneReviewPage() {
  const [page, setPage] = useState(1);
  const { memberId } = useAuthReady();

  const { data: completedOneOnOneStudy } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType: 'ONE_ON_ONE_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 9,
  });

  const completedStudies = completedOneOnOneStudy?.completed.content ?? [];

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <div className="flex flex-col gap-400">
        {completedStudies.length === 0 ? (
          <div className="flex items-center justify-center py-600">
            <span className="font-designer-15r text-text-subtlest">
              완료된 1:1 스터디가 없습니다.
            </span>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
            {completedStudies.map((study, index) => (
              <MemberStudyCard
                key={study.studyId ?? index}
                study={study}
                basePath="/my-study-review/one-to-one"
                disableLeaderGuard
              />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={completedOneOnOneStudy?.completed.totalPages ?? 1}
        />
      </div>
    </div>
  );
}
