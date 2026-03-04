import MentorJoinCardContainer from '@/features/mentoring/ui/mentor-directory/mentor-join-card-container';
import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';
import MentorDirectoryEmpty from './mentor-directory-empty';
import MentorDirectoryError from './mentor-directory-error';
import MentorDirectoryFilters from './mentor-directory-filters';
import MentorDirectoryGrid from './mentor-directory-grid';
import MentorDirectorySkeletonGrid from './mentor-directory-skeleton-grid';
import FilterSortListTemplate from '@/components/common/ui/list/filter-sort-list-template';
import ListStateBoundary from '@/components/common/ui/list/list-state-boundary';
import Pagination from '@/components/common/ui/pagination';

interface MentorDirectoryListProps {
  keyword: string;
  keywordOptions: string[];
  careerCodes: string[];
  careerOptions: Array<{
    code: string;
    label: string;
  }>;
  sortType: MentorSortType;
  listState: 'loading' | 'empty' | 'ready' | 'error';
  errorMessage: string;
  shouldShowMentorJoinCard: boolean;
  currentPage: number;
  totalPages: number;
  showPagination: boolean;
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
  onKeywordChange: (nextKeyword: string) => void;
  onCareerCodesChange: (nextCareerCodes: string[]) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export default function MentorDirectoryList({
  keyword,
  keywordOptions,
  careerCodes,
  careerOptions,
  sortType,
  listState,
  errorMessage,
  shouldShowMentorJoinCard,
  currentPage,
  totalPages,
  showPagination,
  leadMentors,
  remainingMentors,
  onKeywordChange,
  onCareerCodesChange,
  onSortTypeChange,
  onPageChange,
  onRetry,
}: MentorDirectoryListProps) {
  const toolbar = (
    <MentorDirectoryFilters
      keyword={keyword}
      keywordOptions={keywordOptions}
      careerCodes={careerCodes}
      careerOptions={careerOptions}
      sortType={sortType}
      onKeywordChange={onKeywordChange}
      onCareerCodesChange={onCareerCodesChange}
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
      error={<MentorDirectoryError message={errorMessage} onRetry={onRetry} />}
      ready={
        <FilterSortListTemplate toolbar={toolbar} pagination={pagination}>
          {cards}
        </FilterSortListTemplate>
      }
    />
  );
}
