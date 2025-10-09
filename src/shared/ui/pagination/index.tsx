import { cva } from 'class-variance-authority';
import ArrowBackIcon from 'public/icons/keyboard-arrow-left.svg';
import ArrowForwardIcon from 'public/icons/keyboard-arrow-right.svg';
import MoreIcon from 'public/icons/more.svg';

// 현재 페이지를 중심으로 표시할 중간 페이지 범위 계산 (첫 페이지와 마지막 페이지 제외)
const getVisibleMiddlePages = ({
  totalPages,
  page,
  middleButtonCount,
}: {
  totalPages: number;
  page: number;
  middleButtonCount: number;
}) => {
  // 전체 페이지가 적으면 모든 페이지 표시
  // 예를들면 totalPages가 5이고 middleButtonCount가 3이면, 모든 페이지 표시
  if (totalPages <= middleButtonCount + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (page) => page !== 1 && page !== totalPages,
    );
  }

  // 현재 페이지를 중심으로 middleButtonCount개의 페이지 계산
  let start = Math.max(2, page - Math.floor(middleButtonCount / 2));
  const end = Math.min(totalPages - 1, start + middleButtonCount - 1);

  // 끝 부분에 맞춰서 시작점 조정
  // 예를들면 totalPages 10 / middleButtonCount 3 / page 9이면, start가 8 end가 9이므로 start를 7로 조정
  if (end - start + 1 < middleButtonCount) {
    start = Math.max(2, end - middleButtonCount + 1);
  }

  const pages = [];

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages.filter((page) => page !== 1 && page !== totalPages);
};

interface PaginationProps {
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  middleButtonCount: number;
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
  middleButtonCount,
  className,
}: PaginationProps) {
  const visibleMiddlePages = getVisibleMiddlePages({
    totalPages,
    page: currentPage,
    middleButtonCount,
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
