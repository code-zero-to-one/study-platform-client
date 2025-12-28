'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/pagination';

interface GroupStudyPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function GroupStudyPagination({
  currentPage,
  totalPages,
}: GroupStudyPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChangePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/group-study?${params.toString()}`);
  };

  return (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onChangePage={handleChangePage}
      className="mt-400 py-200"
    />
  );
}
