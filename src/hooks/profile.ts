import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableStudyTimes,
  getProfile,
  updateProfile,
  updateProfileInfo,
  UpdateProfileInfoRequest,
  UpdateProfileRequest,
} from '@/api/profile';

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

export const useUpdateProfileInfo = ({ memberId }: { memberId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInfoRequest) =>
      updateProfileInfo({ memberId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', memberId] });
    },
  });
};

export const useGetAvailableStudyTimes = () => {
  return useQuery({
    queryKey: ['available-study-times'],
    queryFn: getAvailableStudyTimes,
  });
};

export const useGetSelectedAvailableStudyTimeDisplays = ({
  memberId,
}: {
  memberId: string;
}) => {
  const { data: availableStudyTimes } = useGetAvailableStudyTimes();
  const { data: profile } = useGetProfile({ memberId });

  const availableStudyTimeNames = availableStudyTimes
    ?.map((availableStudyTime) =>
      profile?.memberInfo.availableStudyTimes.includes(
        availableStudyTime.availableTimeId,
      )
        ? availableStudyTime.display
        : null,
    )
    .filter(Boolean);

  return availableStudyTimeNames;
};
