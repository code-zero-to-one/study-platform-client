import { cookies } from 'next/headers';

export const getServerCookie = async (
  name: string,
): Promise<string | undefined> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(name)?.value;

  return value ?? undefined;
};
