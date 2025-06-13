import { headers } from 'next/headers';

export const getServerCookie = async (
  name: string,
): Promise<string | undefined> => {
  const allHeaders = await headers();
  const cookieHeader = allHeaders.get('cookie') as string | null;

  if (!cookieHeader) return undefined;

  const cookiesArray = cookieHeader.split('; ').map((c) => {
    const [key, ...rest] = c.split('=');
    const value = rest.join('=');

    return [key, value] as [string, string];
  });

  const cookiesMap = new Map<string, string>(cookiesArray);
  const value = cookiesMap.get(name);

  return value ? decodeURIComponent(value) : undefined;
};
