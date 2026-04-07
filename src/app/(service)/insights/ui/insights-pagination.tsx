'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/common/ui/pagination';

interface InsightsPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function InsightsPagination({
  currentPage,
  totalPages,
}: InsightsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`/insights?${params.toString()}`);
  };

  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={handlePageChange}
      className="mt-400 py-200"
    />
  );
}
