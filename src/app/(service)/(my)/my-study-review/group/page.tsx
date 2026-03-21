'use client';

import CompletedStudyReviewPage from '../_components/completed-study-review-page';

export default function GroupStudyReviewListPage() {
  return (
    <CompletedStudyReviewPage
      basePath="/my-study-review/group"
      studyType="GROUP_STUDY"
      studyTypeName="그룹스터디"
    />
  );
}
