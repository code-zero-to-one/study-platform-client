import type { MentoringMethodType } from '@/types/mentoring/domain';
import type { MyMentoringMethod } from '@/types/mentoring/my-mentoring';
import { MENTORING_DISCORD_INVITE_URL } from './mentoring-flow-policy';

export type MentoringChannelDisplayKind = 'note' | 'online' | 'offline';

export interface MentoringChannelDisplayMeta {
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

const DISCORD_ENTRY_LABEL = '디스코드 입장 링크';
const DEFAULT_NOTE_DESCRIPTION = '서비스 내 쪽지로 진행';
const DEFAULT_OFFLINE_DESCRIPTION = '대면 장소는 확정 후 별도로 안내합니다.';
const DEFAULT_ONLINE_DESCRIPTION = 'ZERO-ONE 멘토링 디스코드에서 진행합니다.';

const normalizeDisplayText = (value: string) => {
  return value
    .replaceAll(MENTORING_DISCORD_INVITE_URL, '')
    .replace(/입장 링크\s*[:：]?\s*/gi, '')
    .replace(/\s*\/\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .replace(/[·/,\-:]+$/g, '')
    .trim();
};

export const getMentoringChannelDisplayKindFromMethod = (
  method: MentoringMethodType,
): MentoringChannelDisplayKind => {
  if (method === 'note') {
    return 'note';
  }

  if (method === 'offline') {
    return 'offline';
  }

  return 'online';
};

export const getMentoringChannelDisplayKindFromMyMethod = (
  method: MyMentoringMethod,
): MentoringChannelDisplayKind => {
  if (method === 'OFFLINE') {
    return 'offline';
  }

  return 'online';
};

export const getMentoringChannelDisplayMeta = ({
  kind,
  guide,
}: {
  kind: MentoringChannelDisplayKind;
  guide?: string | null;
}): MentoringChannelDisplayMeta => {
  const normalizedGuide =
    typeof guide === 'string' ? normalizeDisplayText(guide) : '';

  if (kind === 'note') {
    return {
      description:
        normalizedGuide.length > 0
          ? normalizedGuide
          : DEFAULT_NOTE_DESCRIPTION,
    };
  }

  if (kind === 'offline') {
    return {
      description:
        normalizedGuide.length > 0
          ? normalizedGuide
          : DEFAULT_OFFLINE_DESCRIPTION,
    };
  }

  return {
    description:
      normalizedGuide.length > 0
        ? normalizedGuide
        : DEFAULT_ONLINE_DESCRIPTION,
    actionHref: MENTORING_DISCORD_INVITE_URL,
    actionLabel: DISCORD_ENTRY_LABEL,
  };
};
