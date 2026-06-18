'use client';

import { useMentorProfileListController } from '@/features/mentoring/model/directory/use-mentor-profile-list-controller';
import MentorDirectoryList from '@/features/mentoring/ui/mentor-directory/mentor-directory-list';
import type { MentorProfileListProps } from '@/types/mentoring/directory-view';

export default function MentorProfileListContainer(
  props: MentorProfileListProps = {},
) {
  const controller = useMentorProfileListController(props);

  return (
    <MentorDirectoryList
      keyword={controller.state.keyword}
      careerCodes={controller.state.careerCodes}
      sortType={controller.state.sortType}
      listState={controller.viewModel.listState}
      errorMessage={controller.viewModel.errorMessage}
      shouldShowMentorJoinCard={controller.viewModel.shouldShowMentorJoinCard}
      currentPage={controller.viewModel.currentPage}
      totalPages={controller.viewModel.totalPages}
      showPagination={controller.viewModel.showPagination}
      keywordOptions={controller.viewModel.keywordOptions}
      careerOptions={controller.viewModel.careerOptions}
      leadMentors={controller.viewModel.leadMentors}
      remainingMentors={controller.viewModel.remainingMentors}
      onKeywordChange={controller.actions.onKeywordChange}
      onCareerCodesChange={controller.actions.onCareerCodesChange}
      onSortTypeChange={controller.actions.onSortTypeChange}
      onPageChange={controller.actions.onPageChange}
      onRetry={controller.actions.onRetry}
    />
  );
}
