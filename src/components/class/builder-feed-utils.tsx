import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const ROLE_BADGE_CONFIG: Record<string, { label: string; bg: string }> = {
  BUILDER: { label: 'B', bg: 'bg-background-accent-purple-strong' },
  MANAGER: { label: 'M', bg: 'bg-background-brand-default' },
};

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
        'flex size-400 shrink-0 items-center justify-center rounded-full bg-gray-200',
        className,
      )}
    >
      <span className="font-designer-12b text-gray-600">
        {nickname.charAt(0)}
      </span>
    </div>
  );
}

export function RoleBadge({ variant }: { variant: string }) {
  const config = ROLE_BADGE_CONFIG[variant];
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
