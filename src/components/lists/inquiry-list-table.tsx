'use client';

import { Eye, LockIcon } from 'lucide-react';
import { useState } from 'react';
import type { QuestionListItemResponse } from '@/api/endpoints/group-study/question';
import InquiryStatusBadge from '@/components/common/ui/badge/inquiry-status-badge';
import Pagination from '@/components/common/ui/pagination';
import { useToastStore } from '@/stores/use-toast-store';
import { CATEGORY_LABEL } from '@/types/schemas/question.schema';
import { formatDateDot } from '@/utils/time';

const PAGE_SIZE = 15;

interface InquiryListTableProps {
  items: QuestionListItemResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemClick: (item: QuestionListItemResponse) => void;
}

export default function InquiryListTable({
  items,
  totalElements,
  totalPages,
  page,
  isLoading,
  onPageChange,
  onItemClick,
}: InquiryListTableProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  return (
    <>
      <div className="border-border-default rounded-100 overflow-x-auto border">
        <table className="w-full">
          <thead className="bg-background-neutral-subtle font-designer-13r text-text-subtle px-100 py-200 text-left align-middle leading-250 whitespace-nowrap">
            <tr className="border-border-default border-b">
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                번호
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                분류
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                제목
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                작성자
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                작성일시
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                조회수
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-text-subtle py-800 text-center">
                  로딩 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-text-subtle py-800 text-center">
                  등록된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const displayNumber =
                  totalElements - (page - 1) * PAGE_SIZE - index;
                const isHovered = hoveredId === item.questionId;

                return (
                  <tr
                    key={item.questionId}
                    className={`border-border-default hover:bg-fill-neutral-subtle cursor-pointer border-b last:border-b-0 ${!item.accessible ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (!item.accessible) {
                        showToast(
                          '작성자만 확인할 수 있는 문의입니다.',
                          'error',
                        );

                        return;
                      }
                      onItemClick(item);
                    }}
                    onMouseEnter={() => setHoveredId(item.questionId)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {displayNumber}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.category
                        ? (CATEGORY_LABEL[item.category] ?? item.category)
                        : '-'}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.accessible ? (
                        <span
                          className={
                            isHovered ? 'text-text-brand underline' : ''
                          }
                        >
                          {item.title}
                        </span>
                      ) : (
                        <span className="text-text-subtle flex items-center gap-100">
                          <LockIcon size={14} />
                          비공개 문의입니다
                        </span>
                      )}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.accessible ? item.authorNickname : '***'}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {formatDateDot(item.createdAt)}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      <span className="flex items-center gap-100">
                        <Eye size={14} className="text-text-subtle" />
                        {item.viewCount}
                      </span>
                    </td>
                    <td className="px-400 py-300">
                      <InquiryStatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChangePage={onPageChange}
          className="mt-400"
        />
      )}
    </>
  );
}
