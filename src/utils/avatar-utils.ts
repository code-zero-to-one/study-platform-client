const AVATAR_COUNT = 8;

export function getDefaultAvatarSrc(
  memberId: number | null | undefined,
): string {
  if (memberId === null || memberId === undefined)
    return '/profile-default.svg';
  return `/images/${(memberId % AVATAR_COUNT) + 1}.png`;
}
