'use client';

import { DotIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MemberNotificationResponse } from '@/api/openapi';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import Button from '@/components/common/ui/button';
import NotificationList from '@/components/lists/notification-list';

import {
  useGetNotifications,
  useReadNotifications,
} from '@/hooks/queries/notification-api';
import NotiIcon from 'public/icons/notifications_none.svg';

export default function NotificationDropdown() {
  const router = useRouter();

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

  const { mutate: readNotifications } = useReadNotifications();

  const handleNotificationClick = (
    notification: MemberNotificationResponse,
  ) => {
    if (!notification.isRead) {
      if (!notification.id) return;
      readNotifications([notification.id]);
    }
  };

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

          {totalUnreadCount !== undefined && totalUnreadCount > 0 && (
            <DotIcon className="absolute -top-100 -right-100 fill-red-500 stroke-red-500" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={16}
        className="shadow-2 rounded-100 border-border-default bg-background-default w-[min(520px,calc(100vw-32px))] border"
      >
        {/* Header */}
        <div className="border-border-default flex items-center gap-150 border-b p-200">
          <button
            className={cn(
              'cursor-pointer',
              mode === 'all'
                ? 'font-designer-12b text-text-subtle'
                : 'font-designer-12m text-text-subtlest',
            )}
            onClick={() => setMode('all')}
          >
            전체 {totalAllCount}
          </button>
          <button
            className={cn(
              'cursor-pointer',
              mode === 'unread'
                ? 'font-designer-12b text-text-subtle'
                : 'font-designer-12m text-text-subtlest',
            )}
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
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-200 pb-300">
          <Button
            color="outlined"
            size="medium"
            className="font-designer-16m w-full"
            onClick={() => router.push('/notification')}
          >
            전체 알림 목록
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
