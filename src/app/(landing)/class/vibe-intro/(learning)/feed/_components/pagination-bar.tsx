import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export function PaginationBar({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const windowStart = Math.floor(currentPage / 10) * 10;
  const windowEnd = Math.min(windowStart + 10, totalPages);
  const pages = Array.from(
    { length: windowEnd - windowStart },
    (_, i) => windowStart + i,
  );

  return (
    <div className="mt-500 flex items-center justify-center gap-50">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            'flex h-500 w-500 items-center justify-center rounded-100 font-designer-16r',
            p === currentPage
              ? 'bg-rose-50 font-designer-16b text-rose-500'
              : 'text-gray-700 hover:bg-gray-100',
          )}
        >
          {p + 1}
        </button>
      ))}
      {windowEnd < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          className="flex h-500 w-500 items-center justify-center rounded-100 font-designer-16r text-gray-700 hover:bg-gray-100"
        >
          LAST
        </button>
      )}
    </div>
  );
}
