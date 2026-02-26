'use client';

import { useMentorProfileListController } from '@/features/mentoring/model/use-mentor-profile-list-controller';
import MentorDirectoryList from '@/features/mentoring/ui/mentor-directory/mentor-directory-list';
import type { MentorProfileListProps } from '@/types/mentoring/directory-view';

export default function MentorProfileListContainer(
  props: MentorProfileListProps = {},
) {
  const controller = useMentorProfileListController(props);

  return (
    <MentorDirectoryList
      keywords={controller.state.keywords}
      sortType={controller.state.sortType}
      listState={controller.viewModel.listState}
      shouldShowMentorJoinCard={controller.viewModel.shouldShowMentorJoinCard}
      currentPage={controller.viewModel.currentPage}
      totalPages={controller.viewModel.totalPages}
      showPagination={controller.viewModel.showPagination}
      keywordOptions={controller.viewModel.keywordOptions}
      leadMentors={controller.viewModel.leadMentors}
      remainingMentors={controller.viewModel.remainingMentors}
      onKeywordChange={controller.actions.onKeywordChange}
      onSortTypeChange={controller.actions.onSortTypeChange}
      onPageChange={controller.actions.onPageChange}
    />
  );
}
