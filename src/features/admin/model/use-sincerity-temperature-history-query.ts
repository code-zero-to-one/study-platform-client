import { useQuery } from '@tanstack/react-query';
import { getSincerityTemperatureHistory } from '../api/sincerity-temperature-history';
import { GetSincerityTemperatureHistoryRequest } from '../api/types';

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
