import { useQuery } from '@tanstack/react-query';
import { getSincerityTemperatureHistory } from '@/api/endpoints/admin/sincerity-temperature-history';
import { GetSincerityTemperatureHistoryRequest } from '@/types/api/admin.types';

export const useGetSincerityTemperatureHistoryQuery = ({
  memberId,
  page,
}: GetSincerityTemperatureHistoryRequest) => {
  return useQuery({
    queryKey: ['sincerityTemperatureHistory', memberId, page],
    queryFn: () =>
      getSincerityTemperatureHistory({
        memberId,
        page,
      }),
  });
};
