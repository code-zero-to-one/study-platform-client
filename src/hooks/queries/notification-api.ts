import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { NotificationApi } from '@/api/openapi';
import type { GetMemberNotificationsTopicTypeEnum } from '@/api/openapi/api/notification-api';

const notificationApi = createApiInstance(NotificationApi);

interface MemberNotificationsParams {
  page?: number;
  size?: number;
  hasRead?: boolean;
  topicType?: GetMemberNotificationsTopicTypeEnum;
}

export const useGetMemberNotifications = ({
  page = 1,
  size = 10,
  hasRead,
  topicType,
}: MemberNotificationsParams = {}) => {
  return useQuery({
    queryKey: ['memberNotifications', page, size, hasRead, topicType],
    queryFn: async () => {
      const { data } = await notificationApi.getMemberNotifications(
        page,
        size,
        hasRead,
        topicType,
      );

      return data.content;
    },
  });
};

export const useGetMemberNotificationCategories = () => {
  return useQuery({
    queryKey: ['memberNotificationCategories'],
    queryFn: async () => {
      const { data } = await notificationApi.getMemberNotificationCategories();

      return data.content;
    },
  });
};

export const useHasMemberNewNotification = () => {
  return useQuery({
    queryKey: ['hasMemberNewNotification'],
    queryFn: async () => {
      const { data } = await notificationApi.hasMemberNewNotification();

      return data.content;
    },
  });
};

export const useReadMemberNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const { data } = await notificationApi.readMemberNotifications(ids);

      return data.content;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['memberNotifications'] }),
        queryClient.invalidateQueries({
          queryKey: ['hasMemberNewNotification'],
        }),
      ]);
    },
  });
};

export const useDeleteMemberNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const { data } = await notificationApi.deleteMemberNotifications(ids);

      // return data.content;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['memberNotifications'] }),
        queryClient.invalidateQueries({
          queryKey: ['hasMemberNewNotification'],
        }),
      ]);
    },
  });
};
