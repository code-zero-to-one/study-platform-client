import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { NotificationApi } from '@/api/openapi';
import type { GetMemberNotificationsTopicTypeEnum } from '@/api/openapi/api/notification-api';
import { useAuth } from '../use-auth';

const notificationApi = createApiInstance(NotificationApi);

interface NotificationsParams {
  page?: number;
  size?: number;
  hasRead?: boolean;
  topicType?: GetMemberNotificationsTopicTypeEnum;
}

export const useGetNotifications = ({
  page = 1,
  size = 10,
  hasRead,
  topicType,
}: NotificationsParams = {}) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['notifications', page, size, hasRead, topicType],
    queryFn: async () => {
      const { data } = await notificationApi.getMemberNotifications(
        page,
        size,
        hasRead,
        topicType,
      );

      return data.content;
    },
    refetchInterval: 60000, // 1 minute
    enabled: !!isAuthenticated,
  });
};

export const useGetNotificationCategories = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['notificationCategories'],
    queryFn: async () => {
      const { data } = await notificationApi.getMemberNotificationCategories();

      return data.content;
    },
    enabled: !!isAuthenticated,
  });
};

export const useHasNewNotification = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['hasNewNotification'],
    queryFn: async () => {
      const { data } = await notificationApi.hasMemberNewNotification();

      return data.content;
    },
    refetchInterval: 60000, // 1 minute
    enabled: !!isAuthenticated,
  });
};

export const useReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const { data } = await notificationApi.readMemberNotifications(ids);

      // return data.content;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({
          queryKey: ['hasNewNotification'],
        }),
      ]);
    },
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const { data } = await notificationApi.deleteMemberNotifications(ids);

      // return data.content;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({
          queryKey: ['hasNewNotification'],
        }),
      ]);
    },
  });
};
