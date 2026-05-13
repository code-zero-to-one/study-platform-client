import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export const ROLE_LABELS: Record<string, string> = {
  BUILDER: '빌더',
  ADMIN: '운영자',
};

export function formatRelativeTime(dateStr: string): string {
  const minutes = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 60000,
  );
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function AuthorAvatar({
  nickname,
  className,
}: {
  nickname: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-400 w-400 shrink-0 items-center justify-center rounded-full bg-gray-200',
        className,
      )}
    >
      <span className="font-designer-12b text-gray-600">
        {nickname.charAt(0)}
      </span>
    </div>
  );
}

export function BuilderBadge() {
  return (
    <div className="flex h-188 w-188 shrink-0 items-center justify-center rounded-full bg-[#6938ef]">
      <span className="text-[10px] font-semibold leading-none text-white">
        B
      </span>
    </div>
  );
}
