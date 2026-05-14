import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export const ROLE_LABELS: Record<string, string> = {
  BUILDER: '빌더',
  MANAGER: '매니저',
  ADMIN: '운영자',
};

const ROLE_BADGE_SRC: Record<string, string> = {
  BUILDER: '/class/builder.png',
  MANAGER: '/class/manager.png',
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

export function RoleBadge({
  role,
  width = 28,
  height = 28,
  className,
}: {
  role: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const src = ROLE_BADGE_SRC[role];
  if (!src) return null;
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={ROLE_LABELS[role] ?? role}
      className={cn('shrink-0', className)}
    />
  );
}

export function BuilderBadge() {
  return (
    <Image
      src="/class/builder.png"
      width={16}
      height={16}
      alt="빌더"
      className="h-188 w-188 shrink-0"
    />
  );
}
