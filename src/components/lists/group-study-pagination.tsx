'use client';

import Pagination from '@/components/common/ui/pagination';

interface GroupStudyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GroupStudyPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GroupStudyPaginationProps) {
  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={onPageChange}
      className="mt-400 py-200"
    />
  );
}
