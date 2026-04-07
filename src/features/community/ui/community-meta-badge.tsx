import { Award, CircleHelp, FileText, MessageSquareText } from 'lucide-react';
import type { ComponentType, ComponentProps, SVGProps } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import {
  COMMUNITY_BOARD,
  COMMUNITY_MEMBER_ROLE,
  COMMUNITY_UNSUPPORTED_BOARD,
  type CommunityMemberRole,
  type CommunityPostBoard,
} from '@/types/community/domain';
import CommunityFeaturedFlameIcon from './community-featured-flame-icon';

type BadgeColor = ComponentProps<typeof Badge>['color'];
type BoardIcon = ComponentType<SVGProps<SVGSVGElement>>;

const BOARD_META: Record<
  CommunityPostBoard,
  { color: BadgeColor; icon: BoardIcon; label: string }
> = {
  [COMMUNITY_BOARD.QNA]: {
    color: 'purple',
    icon: CircleHelp,
    label: '질문답변',
  },
  [COMMUNITY_BOARD.FREE]: {
    color: 'gray',
    icon: MessageSquareText,
    label: '자유',
  },
  [COMMUNITY_BOARD.ACHIEVEMENT]: {
    color: 'orange',
    icon: Award,
    label: '자랑거리',
  },
  [COMMUNITY_BOARD.KNOWLEDGE]: {
    color: 'blue',
    icon: FileText,
    label: 'IT 지식',
  },
  [COMMUNITY_UNSUPPORTED_BOARD]: {
    color: 'gray',
    icon: MessageSquareText,
    label: '알 수 없는 게시판',
  },
} as const;

export const getCommunityBoardMeta = (board: CommunityPostBoard) =>
  BOARD_META[board];

const COMMUNITY_ROLE_BADGE_META: Record<
  | typeof COMMUNITY_MEMBER_ROLE.NEWCOMER
  | typeof COMMUNITY_MEMBER_ROLE.DEVELOPER,
  { color: BadgeColor; label: string }
> = {
  [COMMUNITY_MEMBER_ROLE.NEWCOMER]: {
    color: 'gray',
    label: 'IT문자',
  },
  [COMMUNITY_MEMBER_ROLE.DEVELOPER]: {
    color: 'blue',
    label: '개발자',
  },
} as const;

const COMMUNITY_DEVELOPER_ROLE_SET = new Set<CommunityMemberRole>([
  COMMUNITY_MEMBER_ROLE.DEVELOPER,
  COMMUNITY_MEMBER_ROLE.MENTOR,
]);

export const getCommunityRoleMeta = (role: CommunityMemberRole) =>
  COMMUNITY_DEVELOPER_ROLE_SET.has(role)
    ? COMMUNITY_ROLE_BADGE_META[COMMUNITY_MEMBER_ROLE.DEVELOPER]
    : COMMUNITY_ROLE_BADGE_META[COMMUNITY_MEMBER_ROLE.NEWCOMER];

export function CommunityBoardBadge({
  board,
  showIcon = true,
}: {
  board: CommunityPostBoard;
  showIcon?: boolean;
}) {
  const meta = getCommunityBoardMeta(board);
  const Icon = meta.icon;

  return (
    <Badge color={meta.color}>
      <span className="flex items-center gap-50">
        {showIcon ? <Icon className="h-200 w-200" /> : null}
        {meta.label}
      </span>
    </Badge>
  );
}

export function CommunityMemberRoleBadge({
  role,
}: {
  role: CommunityMemberRole;
}) {
  const meta = getCommunityRoleMeta(role);

  return (
    <Badge color={meta.color}>
      <span className="font-designer-12m">{meta.label}</span>
    </Badge>
  );
}

export function CommunityFeaturedRankBadge({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <Badge color="primary" className={compact ? 'px-75 py-25' : undefined}>
      <span
        className={cn(
          'flex items-center font-designer-12b',
          compact ? 'gap-25 font-designer-11b' : 'gap-50',
        )}
      >
        <CommunityFeaturedFlameIcon
          className={compact ? 'h-150 w-150' : undefined}
        />
        {label}
      </span>
    </Badge>
  );
}
