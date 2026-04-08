'use client';

import CompletedStudyReviewPage from '@/components/group-study/review/completed-study-review-page';

export default function MentorReviewPage() {
  return (
    <CompletedStudyReviewPage
      basePath="/my-study-review/mentor"
      studyType="MENTOR_STUDY"
      studyTypeName="멘토스터디"
    />
  );
}
