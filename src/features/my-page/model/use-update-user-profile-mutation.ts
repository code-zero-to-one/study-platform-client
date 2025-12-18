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
  getCareers,
  getJobs,
  getStudyDashboard,
  getStudyFormatTypes,
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

export const useStudyDashboardQuery = () => {
  return useQuery({
    queryKey: ['studyDashboard'],
    queryFn: () => getStudyDashboard(),
    staleTime: 60 * 1000,
  });
};

/** 
 * 서버에서 조회되는 Enum 값들 (기본적으로 백엔드에서 관리)
 **/
export const useJobsQuery = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });
};

export const useCareersQuery = () => {
  return useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });
};

export const useStudyFormatTypesQuery = () => {
  return useQuery({
    queryKey: ['studyFormatTypes'],
    queryFn: getStudyFormatTypes,
  });
};