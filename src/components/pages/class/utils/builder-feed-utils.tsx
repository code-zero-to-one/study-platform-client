import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export const ROLE_LABELS: Record<string, string> = {
  BUILDER: '빌더',
  MANAGER: '매니저',
  ADMIN: '운영자',
};

const ROLE_BADGE_CONFIG: Record<string, { label: string; bg: string }> = {
  BUILDER: { label: 'B', bg: 'bg-background-accent-purple-strong' },
  MANAGER: { label: 'M', bg: 'bg-background-brand-default' },
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

export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_BADGE_CONFIG[role];
  if (!config) return null;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-designer-10b text-text-inverse',
        'h-188 w-175',
        config.bg,
      )}
    >
      {config.label}
    </span>
  );
}
