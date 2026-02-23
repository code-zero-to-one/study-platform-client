import MentorJoinCardContainer from '@/components/mentoring/mentor-directory/mentor-join-card-container';
import FilterSortListTemplate from '@/components/ui/list/filter-sort-list-template';
import ListStateBoundary from '@/components/ui/list/list-state-boundary';
import type { MentorProfile } from '@/types/mentoring';
import type { MentorSortType } from '@/types/mentoring';
import MentorDirectoryEmpty from './mentor-directory-empty';
import MentorDirectoryFilters from './mentor-directory-filters';
import MentorDirectoryGrid from './mentor-directory-grid';
import MentorDirectorySkeletonGrid from './mentor-directory-skeleton-grid';

interface MentorDirectoryListProps {
  keyword: string;
  sortType: MentorSortType;
  listState: 'loading' | 'empty' | 'ready';
  shouldShowMentorJoinCard: boolean;
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export default function MentorDirectoryList({
  keyword,
  sortType,
  listState,
  shouldShowMentorJoinCard,
  leadMentors,
  remainingMentors,
  onKeywordChange,
  onSortTypeChange,
}: MentorDirectoryListProps) {
  const toolbar = (
    <MentorDirectoryFilters
      keyword={keyword}
      sortType={sortType}
      onKeywordChange={onKeywordChange}
      onSortTypeChange={onSortTypeChange}
    />
  );

  const cards = (
    <MentorDirectoryGrid
      leadMentors={leadMentors}
      remainingMentors={remainingMentors}
      joinCard={shouldShowMentorJoinCard ? <MentorJoinCardContainer /> : undefined}
    />
  );

  return (
    <ListStateBoundary
      state={listState}
      loading={<MentorDirectorySkeletonGrid />}
      empty={<MentorDirectoryEmpty />}
      ready={<FilterSortListTemplate toolbar={toolbar}>{cards}</FilterSortListTemplate>}
    />
  );
}
