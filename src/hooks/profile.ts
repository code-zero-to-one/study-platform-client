import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, UpdateProfileRequest } from '@/api/profile';

export const useGetProfile = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['profile', memberId],
    queryFn: () => getProfile({ memberId }),
    enabled: !!memberId,
  });
};

export const useUpdateProfile = ({ memberId }: { memberId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      updateProfile({ memberId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', memberId] });
    },
  });
};
