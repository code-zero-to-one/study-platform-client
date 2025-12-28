'use client';

import { DotIcon } from 'lucide-react';
import { useState } from 'react';
import NotificationList from '@/components/lists/notification-list';

import {
  useGetNotifications,
  useHasNewNotification,
} from '@/hooks/queries/notification-api';
import NotiIcon from 'public/icons/notifications_none.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/(shadcn)/ui/dropdown-menu';
import Button from '../ui/button';

export default function NotificationDropdown() {
  const [mode, setMode] = useState<'all' | 'unread'>('all');
  const { data: notificationsData } = useGetNotifications({
    page: 1,
    size: 5,
  });
  const { data: notReadNotificationsData } = useGetNotifications({
    page: 1,
    size: 5,
    hasRead: false,
  });
  const { data: newData } = useHasNewNotification();

  const isRead = newData?.isRead;

  const notifications =
    mode === 'all'
      ? notificationsData?.content || []
      : notReadNotificationsData?.content || [];

  const totalAllCount = notificationsData?.totalElements;
  const totalUnreadCount = notReadNotificationsData?.totalElements;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <NotiIcon />

          {!isRead && (
            <DotIcon className="absolute -top-100 -left-100 fill-red-500 stroke-red-500" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="shadow-2 rounded-100 border-border-default bg-background-default w-[520px] border">
        {/* Header */}
        <div className="border-border-default flex items-center gap-150 border-b p-200">
          <button
            className={
              mode === 'all'
                ? 'font-designer-12b text-text-subtle'
                : 'font-designer-12m text-text-subtlest'
            }
            onClick={() => setMode('all')}
          >
            전체 {totalAllCount}
          </button>
          <button
            className={
              mode === 'unread'
                ? 'font-designer-12b text-text-subtle'
                : 'font-designer-12m text-text-subtlest'
            }
            onClick={() => setMode('unread')}
          >
            안읽음 {totalUnreadCount}
          </button>
        </div>

        {/* Notification List */}
        <div className="px-200 pb-150">
          {notifications.length === 0 ? (
            <div className="py-400 text-center">
              <p className="font-designer-13r text-text-subtlest">
                새로운 알림이 없습니다
              </p>
            </div>
          ) : (
            <NotificationList notifications={notifications} />
          )}
        </div>

        {/* Footer */}
        <div className="px-200 pb-[26px]">
          <Button
            color="outlined"
            size="medium"
            className="font-designer-16m w-full"
          >
            전체 알림 목록
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
