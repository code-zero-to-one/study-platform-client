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
      keyword={controller.state.keyword}
      sortType={controller.state.sortType}
      listState={controller.viewModel.listState}
      shouldShowMentorJoinCard={controller.viewModel.shouldShowMentorJoinCard}
      leadMentors={controller.viewModel.leadMentors}
      remainingMentors={controller.viewModel.remainingMentors}
      onKeywordChange={controller.actions.onKeywordChange}
      onSortTypeChange={controller.actions.onSortTypeChange}
    />
  );
}
