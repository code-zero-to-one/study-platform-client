import { Bookmark, Check, Eye, Heart, Pencil, Search, X } from 'lucide-react';
import React from 'react';
import type { UpdateArchiveRequest } from '@/api/endpoints/archive/update-archive';
import UserProfileModal from '@/components/common/modals/user-profile-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import ActionPillButton from '@/components/common/ui/action-pill-button';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import Checkbox from '@/components/common/ui/checkbox';
import { BaseInput, TextAreaInput } from '@/components/common/ui/input';
import StatItem from '@/components/common/ui/stat-item';
import { ArchiveItem } from '@/types/one-to-one-study/archive';

interface ArchiveGridProps {
  items: ArchiveItem[];
  canEdit: boolean;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onUpdate: (id: number, request: UpdateArchiveRequest) => void;
}

const LibraryCard = ({
  item,
  onLike,
  onView,
  onBookmark,
  onUpdate,
  canEdit,
}: {
  item: ArchiveItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onUpdate: (id: number, request: UpdateArchiveRequest) => void;
  canEdit?: boolean;
}) => {
  const isPrivate = item.isPrivate;
  const bookmarkCount = item.bookmarks ?? 0;
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(item.title);
  const [description, setDescription] = React.useState(item.description ?? '');
  const [link, setLink] = React.useState(item.link ?? '');
  const [nextPrivate, setNextPrivate] = React.useState(!!item.isPrivate);

  React.useEffect(() => {
    if (!isEditing) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setLink(item.link ?? '');
      setNextPrivate(!!item.isPrivate);
    }
  }, [isEditing, item.title, item.description, item.link, item.isPrivate]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const request: UpdateArchiveRequest = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedLink = link.trim();
    const currentDesc = item.description ?? '';
    const currentLink = item.link ?? '';

    if (trimmedTitle !== item.title) request.title = trimmedTitle;
    if (trimmedDesc !== currentDesc) request.description = trimmedDesc;
    if (trimmedLink !== currentLink) request.link = trimmedLink;
    if (nextPrivate !== !!item.isPrivate) request.isPrivate = nextPrivate;

    if (Object.keys(request).length === 0) {
      setIsEditing(false);

      return;
    }

    onUpdate(item.id, request);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setTitle(item.title);
    setDescription(item.description);
    setLink(item.link ?? '');
    setNextPrivate(!!item.isPrivate);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (isEditing) return;
        onView(item);
      }}
      className="rounded-200 border-border-subtle bg-background-default shadow-1 hover:shadow-2 flex h-full cursor-pointer flex-col gap-200 border p-300 transition-all hover:-translate-y-25"
    >
      <div className="mb-auto flex flex-col gap-150">
        {isEditing ? (
          <>
            <div className="flex items-center gap-150">
              <div className="min-w-0 flex-1">
                <BaseInput
                  id={`archive-title-${item.id}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full"
                />
              </div>
              {canEdit && (
                <label
                  htmlFor={`archive-private-${item.id}`}
                  className="flex shrink-0 items-center gap-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id={`archive-private-${item.id}`}
                    checked={nextPrivate}
                    themeColor="fill-brand-default-default"
                    onToggle={() => setNextPrivate((prev) => !prev)}
                  />
                  <span className="font-designer-12r text-text-subtle whitespace-nowrap">
                    비공개
                  </span>
                </label>
              )}
            </div>
            <TextAreaInput
              id={`archive-desc-${item.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-[96px]"
              maxLength={100}
            />
            <BaseInput
              id={`archive-link-${item.id}`}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="링크"
              className="w-full"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-100">
              <h3 className="font-bold-h3 text-text-strong line-clamp-2">
                {item.title}
              </h3>
              {canEdit && (
                <Badge
                  shape="round"
                  color={isPrivate ? 'orange' : 'primary'}
                  className="font-designer-12m px-200 py-50"
                >
                  {isPrivate ? '비공개' : '공개'}
                </Badge>
              )}
            </div>
            <p className="font-designer-13r text-text-subtle line-clamp-3 min-h-[72px]">
              {item.description ?? ''}
            </p>
          </>
        )}
      </div>

      <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-250">
        <UserProfileModal
          memberId={item.authorId}
          trigger={
            <button
              onClick={(e) => e.stopPropagation()}
              className="font-designer-13m text-text-subtle hover:text-text-brand flex items-center gap-100"
            >
              <UserAvatar
                image={item.profileImage?.resizedImages?.[0]?.resizedImageUrl}
                size={20}
              />
              <span className="text-text-default font-medium">
                {item.author}
              </span>
            </button>
          }
        />
        <div className="text-text-subtle flex items-center gap-150">
          {!isEditing && (
            <div className="flex items-center justify-center gap-150">
              <StatItem
                icon={<Eye className="h-3 w-3" />}
                value={item.views.toLocaleString()}
                className="font-designer-12r text-text-subtle min-w-[64px]"
              />
              <StatItem
                onClick={(e) => onLike(e, item.id)}
                icon={
                  <Heart
                    className={cn(
                      'h-3 w-3 transition-colors',
                      item.isLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-text-subtle',
                    )}
                  />
                }
                value={item.likes.toLocaleString()}
                className="font-designer-12r min-w-[64px]"
                valueClassName={cn(
                  item.isLiked ? 'font-bold text-red-500' : 'text-text-subtle',
                )}
                hoverClassName="hover:scale-110 hover:bg-red-50"
              />
              <StatItem
                onClick={(e) => onBookmark(e, item.id)}
                icon={
                  <Bookmark
                    className={cn(
                      'h-3 w-3 transition-colors',
                      item.isBookmarked
                        ? 'fill-text-strong text-text-strong'
                        : 'text-text-subtle',
                    )}
                  />
                }
                value={bookmarkCount.toLocaleString()}
                className="font-designer-12r min-w-[64px]"
                valueClassName={cn(
                  'text-[11px]',
                  item.isBookmarked
                    ? 'text-text-strong font-bold'
                    : 'text-text-subtle',
                )}
                hoverClassName="hover:scale-110 hover:bg-fill-neutral-subtle-hover"
              />
            </div>
          )}
          {isEditing ? (
            <div className="flex items-center gap-100">
              <ActionPillButton
                onClick={handleSave}
                variant="primary"
                size="md"
                icon={<Check className="h-3.5 w-3.5" />}
              >
                완료
              </ActionPillButton>
              <ActionPillButton
                onClick={handleCancel}
                variant="neutral"
                size="md"
                icon={<X className="h-3.5 w-3.5" />}
              >
                취소
              </ActionPillButton>
            </div>
          ) : (
            canEdit && (
              <ActionPillButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  requestAnimationFrame(() => {
                    cardRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  });
                }}
                variant="ghost"
                size="sm"
                className="min-w-[64px] justify-center gap-25"
                icon={<Pencil className="h-3 w-3" />}
              >
                수정
              </ActionPillButton>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default function ArchiveGrid({
  items,
  onLike,
  onView,
  onBookmark,
  onUpdate,
  canEdit,
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
          onUpdate={onUpdate}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
