'use client';

import { useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import MemberStudyCard from '../group/_components/member-study-card';

export default function MentorReviewPage() {
  const [page, setPage] = useState(1);
  const { memberId } = useAuthReady();

  const { data: completedMentorStudy } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType: 'PREMIUM_STUDY',
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 9,
  });

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <div className="flex flex-col gap-400">
        {completedMentorStudy.completed.content.length === 0 ? (
          <div className="flex items-center justify-center py-600">
            <span className="font-designer-15r text-text-subtlest">
              운영한 멘토스터디가 없습니다.
            </span>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
            {completedMentorStudy.completed.content.map((study) => (
              <MemberStudyCard
                key={study.studyId ?? study.title}
                study={study}
                basePath="/my-study-review/mentor"
              />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={completedMentorStudy?.completed.totalPages ?? 1}
        />
      </div>
    </div>
  );
}
