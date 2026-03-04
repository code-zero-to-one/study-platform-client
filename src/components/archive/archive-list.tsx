import { Bookmark, Check, Eye, Heart, Pencil, Search, X } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import ActionPillButton from '@/components/ui/action-pill-button';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Checkbox from '@/components/ui/checkbox';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import StatItem from '@/components/ui/stat-item';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import type { UpdateArchiveRequest } from '@/features/study/one-to-one/archive/api/update-archive';
import { ArchiveItem } from '@/types/one-to-one-study/archive';

interface ArchiveListProps {
  items: ArchiveItem[];
  canEdit: boolean;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (item: ArchiveItem) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onUpdate: (id: number, request: UpdateArchiveRequest) => void;
}

const LibraryRow = ({
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
  const rowRef = React.useRef<HTMLDivElement | null>(null);
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
    setDescription(item.description ?? '');
    setLink(item.link ?? '');
    setNextPrivate(!!item.isPrivate);
  };

  return (
    <div
      ref={rowRef}
      onClick={() => {
        if (isEditing) return;
        onView(item);
      }}
      className="group border-border-subtlest hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center gap-300 border-b px-300 py-200 transition-colors last:border-0"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-100">
        {isEditing ? (
          <div className="flex flex-col gap-150">
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
            <div className="flex items-center justify-between gap-150">
              <div className="font-designer-12r text-text-subtle flex items-center gap-100">
                <UserProfileModal
                  memberId={item.authorId}
                  trigger={
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-default hover:text-text-brand flex items-center gap-100"
                    >
                      <UserAvatar
                        image={
                          item.profileImage?.resizedImages?.[0]?.resizedImageUrl
                        }
                        size={18}
                      />
                      {item.author}
                    </button>
                  }
                />
                <span className="bg-border-subtle h-[10px] w-[1px]" />
                <span>{item.date}</span>
              </div>
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
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-100">
              <h3 className="font-designer-16b text-text-strong group-hover:text-text-information truncate transition-colors">
                {item.title}
              </h3>
              {canEdit && (
                <Badge
                  shape="round"
                  color={isPrivate ? 'orange' : 'primary'}
                  className="font-designer-11m px-150 py-25"
                >
                  {isPrivate ? '비공개' : '공개'}
                </Badge>
              )}
            </div>
            <p className="font-designer-12r text-text-subtle line-clamp-2 min-h-[64px]">
              {item.description ?? ''}
            </p>
            <div className="font-designer-12r text-text-subtle flex items-center gap-100">
              <UserProfileModal
                memberId={item.authorId}
                trigger={
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-text-default hover:text-text-brand flex items-center gap-100"
                  >
                    <UserAvatar
                      image={
                        item.profileImage?.resizedImages?.[0]?.resizedImageUrl
                      }
                      size={18}
                    />
                    {item.author}
                  </button>
                }
              />
              <span className="bg-border-subtle h-[10px] w-[1px]" />
              <span>{item.date}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-200">
        {!isEditing && (
          <div className="flex items-center justify-center gap-150">
            <StatItem
              icon={<Eye className="h-3 w-3" />}
              value={item.views.toLocaleString()}
              className="font-designer-13m text-text-subtle min-w-[64px]"
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
              className="font-designer-13m min-w-[64px]"
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
              className="font-designer-13m min-w-[64px]"
              valueClassName={cn(
                item.isBookmarked
                  ? 'text-text-strong font-bold'
                  : 'text-text-subtle',
              )}
              hoverClassName="hover:scale-110 hover:bg-fill-neutral-subtle-hover"
            />
          </div>
        )}
        {!isEditing && canEdit && (
          <ActionPillButton
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              requestAnimationFrame(() => {
                rowRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              });
            }}
            variant="ghost"
            size="xs"
            className="min-w-[64px] justify-center gap-25"
            icon={<Pencil className="h-3 w-3" />}
          >
            수정
          </ActionPillButton>
        )}
      </div>
    </div>
  );
};

export default function ArchiveList({
  items,
  onLike,
  onView,
  onBookmark,
  onUpdate,
  canEdit,
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
            onUpdate={onUpdate}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
}
