import { Award, CircleHelp, FileText, MessageSquareText } from 'lucide-react';
import type { ComponentType, ComponentProps, SVGProps } from 'react';
import Badge from '@/components/common/ui/badge';
import {
  COMMUNITY_BOARD,
  COMMUNITY_MEMBER_ROLE,
  type CommunityBoard,
  type CommunityMemberRole,
} from '@/types/community/domain';

type BadgeColor = ComponentProps<typeof Badge>['color'];
type BoardIcon = ComponentType<SVGProps<SVGSVGElement>>;

const BOARD_META: Record<
  CommunityBoard,
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
    color: 'green',
    icon: Award,
    label: '자랑거리',
  },
  [COMMUNITY_BOARD.KNOWLEDGE]: {
    color: 'blue',
    icon: FileText,
    label: 'IT 지식',
  },
} as const;

export const getCommunityBoardMeta = (board: CommunityBoard) =>
  BOARD_META[board];

const ROLE_META: Record<
  CommunityMemberRole,
  { color: BadgeColor; label: string }
> = {
  [COMMUNITY_MEMBER_ROLE.NEWCOMER]: {
    color: 'gray',
    label: '일반인',
  },
  [COMMUNITY_MEMBER_ROLE.DEVELOPER]: {
    color: 'blue',
    label: '개발자',
  },
  [COMMUNITY_MEMBER_ROLE.MENTOR]: {
    color: 'orange',
    label: '멘토',
  },
} as const;

export const getCommunityRoleMeta = (role: CommunityMemberRole) =>
  ROLE_META[role];

export function CommunityBoardBadge({
  board,
  showIcon = true,
}: {
  board: CommunityBoard;
  showIcon?: boolean;
}) {
  const meta = getCommunityBoardMeta(board);
  const Icon = meta.icon;

  return (
    <Badge color={meta.color}>
      <span className="flex items-center gap-50">
        {showIcon ? <Icon className="h-14 w-14" /> : null}
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
