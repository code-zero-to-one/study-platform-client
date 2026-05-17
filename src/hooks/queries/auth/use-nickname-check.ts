import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { MemberProfileApi } from '@/api/openapi';

const memberProfileApi = createApiInstance(MemberProfileApi);

/**
 * 닉네임 중복 체크 Query
 * debounce된 닉네임 값과 함께 사용해야 합니다.
 */
export const useNicknameCheckQuery = (nickname: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['nicknameCheck', nickname],
    queryFn: async () => {
      const { data } =
        await memberProfileApi.checkNicknameAvailability(nickname);

      return data.content;
    },
    enabled: enabled && nickname.length >= 2 && nickname.length <= 10,
    staleTime: 0, // 항상 최신 데이터 확인
    retry: false, // 중복 체크는 실패해도 재시도하지 않음
  });
};
