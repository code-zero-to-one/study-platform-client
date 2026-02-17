'use client';

import Pagination from '@/components/ui/pagination';

interface PremiumStudyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PremiumStudyPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PremiumStudyPaginationProps) {
  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={onPageChange}
      className="mt-600"
    />
  );
}
