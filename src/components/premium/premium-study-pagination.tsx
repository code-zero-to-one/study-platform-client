'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/pagination';

interface PremiumStudyPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PremiumStudyPagination({
  currentPage,
  totalPages,
}: PremiumStudyPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/premium-study?${params.toString()}`);
  };

  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={handleChangePage}
      className="mt-600"
    />
  );
}
