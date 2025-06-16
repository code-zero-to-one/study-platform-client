import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  UpdateUserProfileInfoRequest,
  UpdateUserProfileRequest,
} from '../api/types';
import {
  getAvailableStudyTimes,
  updateUserProfile,
  updateUserProfileInfo,
} from '../api/update-user-profile';

export const useUpdateUserProfileMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: UpdateUserProfileRequest) =>
      updateUserProfile(memberId, formData),

    onSuccess: () => {
      router.refresh();
    },
  });
};

export const useUpdateUserProfileInfoMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: UpdateUserProfileInfoRequest) =>
      updateUserProfileInfo(memberId, formData),

    onSuccess: () => {
      router.refresh();
    },
  });
};

export const useAvailableStudyTimesQuery = () => {
  return useQuery({
    queryKey: ['availableStudyTimes'],
    queryFn: getAvailableStudyTimes,
  });
};
