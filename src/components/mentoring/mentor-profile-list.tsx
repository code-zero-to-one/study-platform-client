'use client';

import MentorDirectoryList from '@/components/mentoring/mentor-directory/mentor-directory-list';
import { useMentorProfileListController } from '@/features/mentoring/model/use-mentor-profile-list-controller';
import type { MentorProfileListProps } from '@/types/mentoring';

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
