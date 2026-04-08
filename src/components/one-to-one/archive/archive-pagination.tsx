'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import PaginationCircleButton from '@/components/one-to-one/sessions/pagination-circle-button';

interface ArchivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ArchivePagination({
  currentPage,
  totalPages,
  onPageChange,
}: ArchivePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-100 py-600">
      <PaginationCircleButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </PaginationCircleButton>
      <span className="font-designer-15m text-text-subtle bg-background-default border-border-subtle flex h-[40px] items-center justify-center rounded-[9999px] border px-300">
        {currentPage} / {totalPages}
      </span>
      <PaginationCircleButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-5 w-5" />
      </PaginationCircleButton>
    </div>
  );
}
