import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { isApiError } from '@/shared/tanstack-query/api-error';
import {
  UpdateUserProfileInfoRequest,
  UpdateUserProfileRequest,
} from '../api/types';
import {
  getAvailableStudyTimes,
  getStudyDashboard,
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
    onError: (error) => {
      if (isApiError(error)) {
        if (error.errorCode === 'MPR001') {
          alert('관심사가 중복됐습니다.');
        } else if (error.errorCode === 'MEM001') {
          alert('회원 정보가 존재하지 않습니다.');
        }
      }
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

export const useStudyDashboardQuery = () => {
  return useQuery({
    queryKey: ['studyDashboard'],
    queryFn: () => getStudyDashboard(),
    staleTime: 60 * 1000,
  });
};
