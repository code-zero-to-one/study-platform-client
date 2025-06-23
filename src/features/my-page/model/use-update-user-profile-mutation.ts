import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  UpdateUserProfileInfoRequest,
  UpdateUserProfileRequest,
} from '../api/types';
import {
  getAvailableStudyTimes,
  getStudySubjects,
  getTechStacks,
  updateUserProfile,
  updateUserProfileInfo,
} from '../api/update-user-profile';

export const useUpdateUserProfileMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationKey: ['updateUserProfile', memberId],
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

export const useStudySubjectsQuery = () => {
  return useQuery({
    queryKey: ['studySubjects'],
    queryFn: getStudySubjects,
  });
};

export const useTechStacksQuery = () => {
  return useQuery({
    queryKey: ['techStacks'],
    queryFn: getTechStacks,
  });
};
