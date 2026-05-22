import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstanceV5 } from '@/api/client/axios';

export interface NotificationSettingResponse {
  notifyHour?: number;
  notifyMinute?: number;
  isEnabled?: boolean;
  saved?: boolean;
}

export interface NotificationSettingUpdateRequest {
  notifyHour: number;
  notifyMinute: number;
}

export const NOTIFICATION_SETTING_QUERY_KEY = ['notification-setting'] as const;

export function useGetNotificationSetting() {
  return useQuery({
    queryKey: NOTIFICATION_SETTING_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstanceV5.get<{
        content: NotificationSettingResponse;
      }>('members/me/notification-setting');
      return data.content;
    },
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: NotificationSettingUpdateRequest) => {
      const { data } = await axiosInstanceV5.put<{
        content: NotificationSettingResponse;
      }>('members/me/notification-setting', req);
      return data.content;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(NOTIFICATION_SETTING_QUERY_KEY, data);
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_SETTING_QUERY_KEY,
      });
    },
  });
}
