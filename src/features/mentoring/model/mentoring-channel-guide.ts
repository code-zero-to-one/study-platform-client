import { MENTORING_DISCORD_INVITE_URL } from '@/features/mentoring/model/mentoring-flow-policy';
import type { MentoringMethodType } from '@/types/mentoring/domain';

const LEGACY_ONLINE_GUIDE_PATTERNS = [
  /google meet/i,
  /화상 링크 전달 예정/,
  /통화 또는 짧은 온라인 미팅으로 진행/,
  /온라인 링크 전달 예정/,
  /링크 사전 전달/,
];

const MENTORING_DISCORD_SESSION_GUIDE = `ZERO-ONE 멘토링 디스코드에서 진행합니다. 입장 링크: ${MENTORING_DISCORD_INVITE_URL}`;

const isReservationOnlineMethod = (method: MentoringMethodType) => {
  return method === 'simple' || method === 'deep';
};

const isLegacyOnlineGuide = (placeNote: string) => {
  return LEGACY_ONLINE_GUIDE_PATTERNS.some((pattern) => pattern.test(placeNote));
};

export const getDefaultMentoringPlaceNote = (method: MentoringMethodType) => {
  if (method === 'note') {
    return '서비스 내 쪽지로 진행';
  }

  if (method === 'offline') {
    return '대면 장소는 확정 후 별도로 안내합니다.';
  }

  return MENTORING_DISCORD_SESSION_GUIDE;
};

export const getMentoringPlaceNotePlaceholder = (
  method: MentoringMethodType,
) => {
  if (method === 'offline') {
    return '예: 강남역 인근 카페 / 성수역 스터디룸';
  }

  return '기본 진행은 디스코드입니다. 필요한 추가 안내가 있으면 함께 남겨주세요.';
};

export const getMentoringSessionGuide = ({
  method,
  placeNote,
}: {
  method: MentoringMethodType;
  placeNote?: string | null;
}) => {
  const trimmedPlaceNote = placeNote?.trim();

  if (method === 'note') {
    return '서비스 내 쪽지로 진행';
  }

  if (method === 'offline') {
    return trimmedPlaceNote || '대면 장소는 확정 후 별도로 안내합니다.';
  }

  if (!trimmedPlaceNote || isLegacyOnlineGuide(trimmedPlaceNote)) {
    return MENTORING_DISCORD_SESSION_GUIDE;
  }

  if (trimmedPlaceNote.includes(MENTORING_DISCORD_INVITE_URL)) {
    return trimmedPlaceNote;
  }

  if (/discord|디스코드/i.test(trimmedPlaceNote)) {
    return `${trimmedPlaceNote} / 입장 링크: ${MENTORING_DISCORD_INVITE_URL}`;
  }

  if (isReservationOnlineMethod(method)) {
    return `${MENTORING_DISCORD_SESSION_GUIDE} / 추가 안내: ${trimmedPlaceNote}`;
  }

  return trimmedPlaceNote;
};
