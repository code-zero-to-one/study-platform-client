import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { MyClassProfileApi } from '@/api/openapi';
import { useAuthReady } from '@/features/auth/model/use-auth';

const myClassProfileApi = createApiInstance(MyClassProfileApi);

export const useMyClassProfileQuery = () => {
  const { isAuthReady } = useAuthReady();

  return useQuery({
    queryKey: ['myClassProfile'],
    queryFn: async () => {
      const { data } = await myClassProfileApi.getMyClassProfile();
      return data.content;
    },
    enabled: isAuthReady,
  });
};
