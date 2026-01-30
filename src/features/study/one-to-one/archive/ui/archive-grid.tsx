import { Bookmark, Eye, Heart, Search } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { ArchiveItem } from '@/types/archive';

interface ArchiveGridProps {
  items: ArchiveItem[];
  isAdmin: boolean;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
}

const LibraryCard = ({
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
        'rounded-200 border-border-subtle bg-background-default shadow-1 hover:shadow-2 flex h-full cursor-pointer flex-col gap-250 border p-400 transition-all hover:-translate-y-50',
        isHidden && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          {isHidden && (
            <span className="rounded-100 bg-fill-neutral-subtle-default font-designer-12m text-text-subtle px-200 py-50">
              숨김됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-100">
          {isAdmin && onHide && (
            <button
              onClick={(e) => onHide(e, item.id)}
              className="rounded-100 font-designer-12m bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover flex items-center gap-50 px-150 py-50 transition-colors"
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
        </div>
      </div>

      <div className="mb-auto flex flex-col gap-150">
        <h3 className="font-bold-h4 text-text-strong line-clamp-2">
          {item.title}
        </h3>
      </div>

      <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-300">
        <span className="font-designer-13m text-text-subtle">
          by{' '}
          <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="text-text-subtle flex items-center gap-200">
          <div className="font-designer-12r flex items-center gap-50">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button
            onClick={(e) => onLike(e, item.id)}
            className="font-designer-12r flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
              )}
            />
            <span className={cn(item.isLiked && 'font-bold text-red-500')}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ArchiveGrid({
  items,
  isAdmin,
  onLike,
  onView,
  onBookmark,
  onHide,
}: ArchiveGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-text-subtlest col-span-full flex flex-col items-center gap-200 py-800 text-center">
        <Search className="h-10 w-10 opacity-20" />
        <p className="font-designer-16m">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-300 md:grid-cols-2">
      {items.map((item) => (
        <LibraryCard
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
  );
}
