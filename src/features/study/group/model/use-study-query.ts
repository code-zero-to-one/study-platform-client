import { useQuery } from '@tanstack/react-query';
import { getGroupStudyDetail } from '../api/get-gruoup-study-detail';

// study-detail
export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: () => getGroupStudyDetail({ groupStudyId }),
    enabled: !!groupStudyId, // id가 존재할 때만 실행
  });
};
