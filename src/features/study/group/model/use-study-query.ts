import { QueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getGroupStudyDetail } from '../api/get-gruoup-study-detail';

// study-detail
export const getGroupStudyDetailQueryKey = (id: number) =>
  ['groupStudyDetail', id] as const;

export const fetchGroupStudyDetail = async (id: number) => {
  const { data } = await axios.get(`/api/v1/group-studies/${id}`);

  return data;
};

export const prefetchGroupStudyDetail = (qc: QueryClient, id: number) =>
  qc.prefetchQuery({
    queryKey: getGroupStudyDetailQueryKey(id),
    queryFn: () => fetchGroupStudyDetail(id),
    staleTime: 1000 * 60 * 5,
  });

export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: () => getGroupStudyDetail({ groupStudyId }),
    enabled: !!groupStudyId, // id가 존재할 때만 실행
  });
};
