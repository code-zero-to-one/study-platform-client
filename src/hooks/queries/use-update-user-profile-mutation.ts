import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { axiosInstanceV2 } from '@/api/client/axiosV2';
import type {
  AvailableStudyTimeResponse,
  CareerResponse,
  JobResponse,
  StudyFormatTypeResponse,
  StudyDashboardResponse,
  StudySubjectResponse,
  TechStackResponse,
  UpdateUserProfileInfoRequest,
  UpdateUserProfileInfoResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@/types/api/my-page.types';

export const useUpdateUserProfileMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationKey: ['updateUserProfile', memberId],
    mutationFn: async (
      formData: UpdateUserProfileRequest,
    ): Promise<UpdateUserProfileResponse> => {
      const res = await axiosInstanceV2.patch(
        `/api/v1/members/${memberId}/profile`,
        formData,
      );

      return res.data.content;
    },

    onSuccess: () => {
      router.refresh();
    },
  });
};

export const useUpdateUserProfileInfoMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      formData: UpdateUserProfileInfoRequest,
    ): Promise<UpdateUserProfileInfoResponse> => {
      const res = await axiosInstanceV2.patch(
        `/api/v1/members/${memberId}/profile/info`,
        formData,
      );

      return res.data.content;
    },

    onSuccess: () => {
      router.refresh();
    },
  });
};

export const useAvailableStudyTimesQuery = () => {
  return useQuery({
    queryKey: ['availableStudyTimes'],
    queryFn: async (): Promise<AvailableStudyTimeResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/available-study-times');

      return res.data.content;
    },
  });
};

export const useStudySubjectsQuery = () => {
  return useQuery({
    queryKey: ['studySubjects'],
    queryFn: async (): Promise<StudySubjectResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/study-subjects');

      return res.data.content;
    },
  });
};

export const useTechStacksQuery = () => {
  return useQuery({
    queryKey: ['techStacks'],
    queryFn: async (): Promise<TechStackResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/tech-stacks');

      return res.data.content;
    },
  });
};

export const useStudyDashboardQuery = () => {
  return useQuery({
    queryKey: ['studyDashboard'],
    queryFn: async (): Promise<StudyDashboardResponse> => {
      const res = await axiosInstanceV2.get('/api/v1/study/dashboard');

      return res.data.content;
    },
    staleTime: 60 * 1000,
  });
};

/**
 * 서버에서 조회되는 Enum 값들 (기본적으로 백엔드에서 관리)
 **/
export const useJobsQuery = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async (): Promise<JobResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/jobs');

      return res.data.content;
    },
  });
};

export const useCareersQuery = () => {
  return useQuery({
    queryKey: ['careers'],
    queryFn: async (): Promise<CareerResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/careers');

      return res.data.content;
    },
  });
};

export const useStudyFormatTypesQuery = () => {
  return useQuery({
    queryKey: ['studyFormatTypes'],
    queryFn: async (): Promise<StudyFormatTypeResponse[]> => {
      const res = await axiosInstanceV2.get('/api/v1/study-format-types');

      return res.data.content;
    },
  });
};
