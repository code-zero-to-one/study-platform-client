'use client';

import CompletedStudyReviewPage from '../_components/completed-study-review-page';

export default function OneToOneReviewPage() {
  return (
    <CompletedStudyReviewPage
      basePath="/my-study-review/one-to-one"
      studyType="ONE_ON_ONE_STUDY"
      studyTypeName="1:1스터디"
    />
  );
}
