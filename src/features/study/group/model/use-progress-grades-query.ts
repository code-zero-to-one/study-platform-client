import { useQuery } from '@tanstack/react-query';
import { getProgressGrades } from '../api/get-progress-grades';

export const useProgressGradesQuery = () => {
  return useQuery({
    queryKey: ['progressGrades'],
    queryFn: getProgressGrades,
  });
};
