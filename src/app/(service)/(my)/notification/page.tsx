'use client';

import { format } from 'date-fns';
import { useState } from 'react';

import type { GetMemberNotificationsTopicTypeEnum } from '@/api/openapi/api/notification-api';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SingleDropdown from '@/components/ui/dropdown/single';
import Pagination from '@/components/ui/pagination';
import {
  useGetNotifications,
  useGetNotificationCategories,
  useReadNotifications,
} from '@/hooks/queries/notification-api';
import NotificationIcon from 'public/images/notification.svg';

const READ_STATUS_OPTIONS = [
  { value: 'all', label: '상태 전체' },
  { value: 'read', label: '읽음' },
  { value: 'unread', label: '안 읽음' },
];

const getBadgeColor = (
  topicType: string,
): 'primary' | 'green' | 'red' | 'blue' | 'orange' | 'gray' | 'purple' => {
  switch (topicType) {
    case 'ONE_ON_ONE_STUDY':
      return 'blue';
    case 'GROUP_STUDY':
      return 'purple';
    case 'PAYMENT':
      return 'green';
    case 'ETC':
      return 'gray';
    default:
      return 'gray';
  }
};

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
    readNotifications([]);
  };

  return (
    <div className="flex flex-col gap-300">
      {/* Header */}
      <div className="flex items-center gap-75">
        <NotificationIcon />
        <h1 className="font-designer-24b text-text-default">알림</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="w-[140px]">
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
            className="font-designer-13r h-[32px]"
            onClick={handleMarkAllAsRead}
          >
            모든 읽음 처리
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

      {/* Notification List */}
      <ul>
        {notifications?.map((notification) => (
          <li
            key={notification.id}
            className="border-bottom-border-default bg-background-default flex items-center justify-between border-b py-150"
          >
            <div className="flex items-center gap-150">
              <Badge
                color={getBadgeColor(notification.topicType)}
                shape="rectangle"
              >
                {notification.topicDescription}
              </Badge>
              <span
                className={`${notification.isRead ? 'font-designer-13r' : 'font-designer-13b'} text-text-default`}
              >
                {notification.title}
              </span>
            </div>
            <span className="font-designer-11r text-text-subtlest whitespace-nowrap">
              {format(notification.createdAt, 'yyyy.MM.dd HH:mm')}
            </span>
          </li>
        ))}
      </ul>

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
