import { useQuery } from '@tanstack/react-query';
import { getTechStacks } from '@/api/teck-stacks';

export const useGetTechStacks = () => {
  return useQuery({ queryKey: ['tech-stacks'], queryFn: getTechStacks });
};
