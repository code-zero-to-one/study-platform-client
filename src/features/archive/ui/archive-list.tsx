import { Bookmark, Eye, Heart, Search } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { ArchiveItem } from '@/types/archive';

interface ArchiveListProps {
  items: ArchiveItem[];
  isAdmin: boolean;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
}

export default function ArchiveList({
  items,
  isAdmin,
  onLike,
  onView,
  onBookmark,
  onHide,
}: ArchiveListProps) {
  if (items.length === 0) {
    return (
      <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
        <Search className="h-10 w-10 opacity-20" />
        <p className="font-designer-16m">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-background-default rounded-200 border-border-subtle overflow-hidden border">
      <div className="divide-border-subtlest divide-y">
        {items.map((item) => (
          <LibraryRow
            key={item.id}
            item={item}
            onLike={onLike}
            onView={onView}
            onBookmark={onBookmark}
            onHide={onHide}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}

const LibraryRow = ({
  item,
  onLike,
  onView,
  onBookmark,
  onHide,
  isAdmin,
}: {
  item: ArchiveItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
  isAdmin?: boolean;
}) => {
  const isHidden = (item as any).isHidden;

  return (
    <div
      onClick={() => onView(item)}
      className={cn(
        'group border-border-subtlest hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center gap-300 border-b px-300 py-200 transition-colors last:border-0',
        isHidden && 'opacity-50',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
            {item.title}
          </h3>
          {isHidden && (
            <span className="rounded-100 bg-fill-neutral-subtle-default font-designer-11m text-text-subtle shrink-0 px-150 py-25">
              숨김됨
            </span>
          )}
        </div>
        <div className="font-designer-12r text-text-subtle flex items-center gap-100">
          <span>{item.author}</span>
          <span className="bg-border-subtle h-[10px] w-[1px]" />
          <span>{item.date}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-200">
        {isAdmin && onHide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(e, item.id);
            }}
            className="rounded-100 font-designer-11m bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover flex items-center gap-25 px-100 py-50 transition-colors"
          >
            {isHidden ? '보이기' : '숨기기'}
          </button>
        )}
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className="font-designer-12r hover:bg-fill-neutral-subtle-hover flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110"
        >
          <Bookmark
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              item.isBookmarked
                ? 'fill-text-strong text-text-strong'
                : 'text-text-subtle',
            )}
          />
        </button>

        <div className="font-designer-13m text-text-subtle flex min-w-[60px] items-center justify-end gap-50">
          <Eye className="h-3.5 w-3.5" />
          {item.views.toLocaleString()}
        </div>

        <button
          onClick={(e) => onLike(e, item.id)}
          className="font-designer-13m flex min-w-[50px] items-center justify-end gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
            )}
          />
          <span
            className={cn(
              item.isLiked ? 'font-bold text-red-500' : 'text-text-subtle',
            )}
          >
            {item.likes.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};
