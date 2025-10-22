import { cva } from 'class-variance-authority';
import ArrowBackIcon from 'public/icons/keyboard-arrow-left.svg';
import ArrowForwardIcon from 'public/icons/keyboard-arrow-right.svg';
import MoreIcon from 'public/icons/more.svg';

// 보이는 중간 페이지
// 1) 1~4 페이지: 앞에서부터 5개 페이지 표시 (1,2,3,4,5, ... , totalPages)
// 2) 5페이지부터: 현재 페이지를 중심으로 앞뒤 1개씩 포함한 3개 페이지 표시 (1 ... page-1, page, page+1 ... totalPages)
// 3) 마지막에서 4번째 페이지(= totalPages - 3)부터: 마지막 5개 페이지 표시 (1 ... totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages)
// 반환 값은 첫 페이지(1)와 마지막 페이지(totalPages)를 제외한 중간 페이지들만 포함
const getVisibleMiddlePages = ({
  totalPages,
  page,
}: {
  totalPages: number;
  page: number;
}) => {
  // 총 페이지가 5이하일 경우: 1~totalPages 모두 보여주기
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p !== 1 && p !== totalPages,
    );
  }

  // page가 1~4일 때: 앞에서부터 5개 (1,2,3,4,5, ... , totalPages)
  if (page <= 4) {
    const start = 2;
    const end = Math.min(5, totalPages - 1);
    const pages: number[] = [];

    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  }

  // 마지막에서 4번째 페이지(즉 page >= totalPages - 3)부터: 마지막 5개 (1, ... , totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages)
  if (page >= totalPages - 3) {
    const start = Math.max(2, totalPages - 4);
    const end = totalPages - 1;
    const pages: number[] = [];

    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  }

  // 그 외(중간 구간): 현재 페이지를 중심으로 앞뒤 1개씩 (page-1, page, page+1)
  const middleStart = Math.max(2, page - 1);
  const middleEnd = Math.min(totalPages - 1, page + 1);
  const pages: number[] = [];
  for (let i = middleStart; i <= middleEnd; i++) pages.push(i);

  return pages;
};

interface PaginationProps {
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  className?: string;
}

const pageButtonVariants = cva(
  'w-[32px] h-[32px] flex items-center justify-center rounded-50',
  {
    variants: {
      color: {
        default:
          'hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed text-text-default',
        active: 'bg-background-accent-blue-strong text-text-inverse',
        disabled: 'cursor-not-allowed text-text-disabled',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

export default function Pagination({
  page: currentPage,
  totalPages,
  onChangePage,
  className,
}: PaginationProps) {
  const visibleMiddlePages = getVisibleMiddlePages({
    totalPages,
    page: currentPage,
  });
  const showFirstEllipsis = visibleMiddlePages[0] > 2; // 첫 페이지 다음에 생략 표시
  const showLastEllipsis =
    visibleMiddlePages[visibleMiddlePages.length - 1] < totalPages - 1; // 마지막 페이지 이전에 생략 표시

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 이전 페이지 버튼 */}
      <button
        className={pageButtonVariants({
          color: currentPage === 1 ? 'disabled' : 'default',
        })}
        onClick={() => onChangePage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        <ArrowBackIcon />
      </button>

      {/* 첫 번째 페이지 */}
      <button
        className={pageButtonVariants({
          color: currentPage === 1 ? 'active' : 'default',
        })}
        onClick={() => onChangePage(1)}
      >
        1
      </button>

      {/* 첫 번째 생략 표시 */}
      {showFirstEllipsis && <MoreIcon />}

      {/* 중간 페이지들 */}
      {visibleMiddlePages.map((page) => (
        <button
          key={page}
          onClick={() => onChangePage(page)}
          className={pageButtonVariants({
            color: page === currentPage ? 'active' : 'default',
          })}
        >
          {page}
        </button>
      ))}

      {/* 마지막 생략 표시 */}
      {showLastEllipsis && <MoreIcon />}

      {/* 마지막 페이지 */}
      {totalPages > 1 && (
        <button
          className={pageButtonVariants({
            color: currentPage === totalPages ? 'active' : 'default',
          })}
          onClick={() => onChangePage(totalPages)}
        >
          {totalPages}
        </button>
      )}

      {/* 다음 페이지 버튼 */}
      <button
        className={pageButtonVariants({
          color: currentPage === totalPages ? 'disabled' : 'default',
        })}
        onClick={() => onChangePage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        <ArrowForwardIcon />
      </button>
    </div>
  );
}
