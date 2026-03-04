'use client';

import React from 'react';
import PaginationCircleButton from '@/components/one-on-one/pagination-circle-button';

interface StudyHistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StudyHistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: StudyHistoryPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-100 py-600">
      <PaginationCircleButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ←
      </PaginationCircleButton>
      <span className="font-designer-15m text-text-subtle bg-background-default border-border-subtle flex h-[40px] items-center justify-center rounded-[9999px] border px-300">
        {currentPage} / {totalPages}
      </span>
      <PaginationCircleButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        →
      </PaginationCircleButton>
    </div>
  );
}
