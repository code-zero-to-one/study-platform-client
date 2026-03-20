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

  const completedMentorStudies = completedMentorStudy?.completed.content ?? [];

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <div className="flex flex-col gap-400">
        {completedMentorStudies.length === 0 ? (
          <div className="flex items-center justify-center py-600">
            <span className="font-designer-15r text-text-subtlest">
              아직 받은 멘토스터디 후기가 없습니다.
            </span>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
            {completedMentorStudies.map((study, index) => (
              <MemberStudyCard
                key={study.studyId ?? index}
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
