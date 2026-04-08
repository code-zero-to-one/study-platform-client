'use client';

import { useState } from 'react';

import { MemberNotificationResponse } from '@/api/openapi';
import type { GetMemberNotificationsTopicTypeEnum } from '@/api/openapi/api/notification-api';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import Pagination from '@/components/common/ui/pagination';
import NotificationList from '@/components/home/lists/notification-list';
import {
  useGetNotifications,
  useGetNotificationCategories,
  useReadNotifications,
} from '@/hooks/queries/user/notification-api';
import NotificationIcon from 'public/images/notification.svg';

const READ_STATUS_OPTIONS = [
  { value: 'all', label: '상태 전체' },
  { value: 'read', label: '읽음' },
  { value: 'unread', label: '안 읽음' },
];

export default function NotificationPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] =
    useState<GetMemberNotificationsTopicTypeEnum | null>(null);
  const [readStatus, setReadStatus] = useState<'all' | 'read' | 'unread'>(
    'all',
  );

  const PAGE_SIZE = 10;
  const { data: notificationsData } = useGetNotifications({
    page: page,
    size: PAGE_SIZE,
    hasRead: readStatus === 'all' ? null : readStatus === 'read' ? true : false,
    topicType: category,
  });
  const { data: categoriesData } = useGetNotificationCategories();

  const notifications = notificationsData?.content;
  const categories = categoriesData?.notificationCategories || [];

  const { mutate: readNotifications } = useReadNotifications();

  const categoryOptions = [
    { value: null, label: '카테고리 전체' },
    ...categories.map((category) => ({
      value: category.name,
      label: category.description,
    })),
  ];

  const handleCategoryChange = (value: string | null) => {
    setCategory(value as GetMemberNotificationsTopicTypeEnum | null);
    setPage(1);
  };

  const handleMarkAllAsRead = () => {
    const ids = notifications.map((notification) => notification.id);

    readNotifications(ids);
  };

  const handleNotificationClick = (
    notification: MemberNotificationResponse,
  ) => {
    if (!notification.isRead) {
      readNotifications([notification.id]);
    }
  };

  return (
    <div className="flex flex-col gap-300">
      {/* Header */}
      <div className="flex items-center gap-75">
        <NotificationIcon />
        <h1 className="font-designer-24b text-text-default">알림</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-140">
          <SingleDropdown
            size="s"
            options={categoryOptions}
            value={category}
            onChange={handleCategoryChange}
            placeholder="카테고리 전체"
          />
        </div>
        <div className="flex gap-100">
          <Button
            color="outlined"
            className="font-designer-13r h-400"
            onClick={handleMarkAllAsRead}
          >
            모두 읽음 처리
          </Button>

          <div className="w-[120px]">
            <SingleDropdown
              size="s"
              options={READ_STATUS_OPTIONS}
              value={readStatus}
              onChange={(value) => {
                setReadStatus(value as 'all' | 'read' | 'unread');
                setPage(1);
              }}
              placeholder="상태 전체"
            />
          </div>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      {/* Pagination */}
      <div className="mt-200">
        <Pagination
          page={page}
          totalPages={notificationsData?.totalPages ?? 1}
          onChangePage={setPage}
        />
      </div>
    </div>
  );
}
