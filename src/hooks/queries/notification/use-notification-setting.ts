import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstanceV5 } from '@/api/client/axios';

interface NotificationSettingResponse {
  notifyHour?: number;
  notifyMinute?: number;
  isEnabled?: boolean;
}

interface NotificationSettingUpdateRequest {
  notifyHour: number;
  notifyMinute: number;
}

const QUERY_KEY = ['notification-setting'] as const;

export function useGetNotificationSetting() {
  return useQuery({
    queryKey: QUERY_KEY,
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
