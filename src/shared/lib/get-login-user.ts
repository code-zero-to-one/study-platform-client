import { getServerCookie } from './server-cookie';

export async function getLoginUserId(): Promise<number | undefined> {
  const memberIdStr = await getServerCookie('memberId');
  if (!memberIdStr) return null;

  const memberId = Number(memberIdStr);
  if (isNaN(memberId) || memberId <= 0) return null;

  return memberId;
}
