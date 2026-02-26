import FilterSortListTemplate from '@/components/ui/list/filter-sort-list-template';
import ListStateBoundary from '@/components/ui/list/list-state-boundary';
import Pagination from '@/components/ui/pagination';
import MentorJoinCardContainer from '@/features/mentoring/ui/mentor-directory/mentor-join-card-container';
import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';
import MentorDirectoryEmpty from './mentor-directory-empty';
import MentorDirectoryFilters from './mentor-directory-filters';
import MentorDirectoryGrid from './mentor-directory-grid';
import MentorDirectorySkeletonGrid from './mentor-directory-skeleton-grid';

interface MentorDirectoryListProps {
  keywords: string[];
  keywordOptions: string[];
  sortType: MentorSortType;
  listState: 'loading' | 'empty' | 'ready';
  shouldShowMentorJoinCard: boolean;
  currentPage: number;
  totalPages: number;
  showPagination: boolean;
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
  onKeywordChange: (nextKeywords: string[]) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
  onPageChange: (page: number) => void;
}

export default function MentorDirectoryList({
  keywords,
  keywordOptions,
  sortType,
  listState,
  shouldShowMentorJoinCard,
  currentPage,
  totalPages,
  showPagination,
  leadMentors,
  remainingMentors,
  onKeywordChange,
  onSortTypeChange,
  onPageChange,
}: MentorDirectoryListProps) {
  const toolbar = (
    <MentorDirectoryFilters
      keywords={keywords}
      keywordOptions={keywordOptions}
      sortType={sortType}
      onKeywordChange={onKeywordChange}
      onSortTypeChange={onSortTypeChange}
    />
  );

  const cards = (
    <MentorDirectoryGrid
      leadMentors={leadMentors}
      remainingMentors={remainingMentors}
      joinCard={
        shouldShowMentorJoinCard ? <MentorJoinCardContainer /> : undefined
      }
    />
  );
  const pagination = showPagination ? (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={onPageChange}
    />
  ) : undefined;

  return (
    <ListStateBoundary
      state={listState}
      loading={<MentorDirectorySkeletonGrid />}
      empty={<MentorDirectoryEmpty />}
      ready={
        <FilterSortListTemplate toolbar={toolbar} pagination={pagination}>
          {cards}
        </FilterSortListTemplate>
      }
    />
  );
}
