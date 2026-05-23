import { useQuery } from '@tanstack/react-query';
import { axiosInstanceV5 } from '@/api/client/axios';
import type {
  AdminCoursePaymentDetailResponse,
  AdminCoursePaymentListItemResponse,
  AdminCoursePaymentSearchParams,
  CoursePaymentPageResponse,
} from '@/types/api/course.types';

interface ApiBaseResponse<T> {
  content: T;
}

export const useGetAdminCoursePayments = ({
  courseId,
  memberId,
  status,
  paymentCode,
  page = 0,
  size = 20,
  enabled = true,
}: AdminCoursePaymentSearchParams & { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [
      'adminCoursePayments',
      courseId,
      memberId,
      status,
      paymentCode,
      page,
      size,
    ],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<
        ApiBaseResponse<
          CoursePaymentPageResponse<AdminCoursePaymentListItemResponse>
        >
      >('admin/course-payments', {
        params: {
          courseId,
          memberId,
          status,
          paymentCode,
          page,
          size,
        },
      });

      return data.content;
    },
    enabled,
  });
};

export const useGetAdminCoursePaymentDetail = ({
  paymentId,
  enabled = true,
}: {
  paymentId?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['adminCoursePaymentDetail', paymentId],
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<
        ApiBaseResponse<AdminCoursePaymentDetailResponse>
      >(`admin/course-payments/${paymentId}`);

      return data.content;
    },
    enabled: enabled && typeof paymentId === 'number',
  });
};
