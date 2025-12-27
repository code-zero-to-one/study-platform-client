'use client';

import { useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SingleDropdown from '@/components/ui/dropdown/single';
import Pagination from '@/components/ui/pagination';
import NotificationIcon from 'public/images/notification.svg';

// Mock data for demonstration
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    topicType: 'ONE_ON_ONE_STUDY',
    topicDescription: '스터디',
    title: '[Spring Boot 스터디] 종료되었습니다.',
    content: '[Spring Boot 스터디] 종료되었습니다.',
    isRead: false,
    createdAt: '2025.07.25 09:30',
  },
  {
    id: 2,
    topicType: 'PAYMENT',
    topicDescription: '결제/정산',
    title: '[멘토 스터디] 교육비 200,000원 결제가 완료되었습니다.',
    content: '[멘토 스터디] 교육비 200,000원 결제가 완료되었습니다.',
    isRead: false,
    createdAt: '2025.06.26 20:30',
  },
  {
    id: 3,
    topicType: 'PAYMENT',
    topicDescription: '멘토인증',
    title: '멘토 인증 안내 메세지',
    content: '멘토 인증 안내 메세지',
    isRead: false,
    createdAt: '2025.06.26 20:30',
  },
  {
    id: 4,
    topicType: 'ETC',
    topicDescription: '시스템',
    title: '[중요] 서비스 점검 안내: 11월 10일 02:00~04:00',
    content: '[중요] 서비스 점검 안내: 11월 10일 02:00~04:00',
    isRead: false,
    createdAt: '2025.06.26 20:30',
  },
  {
    id: 5,
    topicType: 'GROUP_STUDY',
    topicDescription: '마케팅',
    title: '이번주까지만 마감! 멘토 후기글 이벤트',
    content: '이번주까지만 마감! 멘토 후기글 이벤트',
    isRead: false,
    createdAt: '2025.06.26 20:30',
  },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: '카테고리 전체' },
  { value: 'ONE_ON_ONE_STUDY', label: '1:1 스터디' },
  { value: 'GROUP_STUDY', label: '그룹스터디' },
  { value: 'PAYMENT', label: '결제' },
  { value: 'ETC', label: '기타' },
];

const READ_STATUS_OPTIONS = [
  { value: 'all', label: '모든 읽음 처리' },
  { value: 'read', label: '읽음' },
  { value: 'unread', label: '안 읽음' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '상태 전체' },
  { value: 'oldest', label: '오래된 순' },
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
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [readStatus, setReadStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('latest');

  const totalPages = 10;

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
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(value) => setCategory(value ?? 'all')}
            placeholder="카테고리 전체"
          />
        </div>
        <div className="flex gap-100">
          <Button
            color="outlined"
            className="font-designer-13r h-[32px]"
            onClick={() => {
              setReadStatus('all');
            }}
          >
            모든 읽음 처리
          </Button>

          <div className="w-[120px]">
            <SingleDropdown
              size="s"
              options={SORT_OPTIONS}
              value={sortOrder}
              onChange={(value) => setSortOrder(value ?? 'latest')}
              placeholder="상태 전체"
            />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <ul>
        {MOCK_NOTIFICATIONS.map((notification) => (
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
              <span className="font-designer-13r text-text-default">
                {notification.title}
              </span>
            </div>
            <span className="font-designer-11r text-text-subtlest whitespace-nowrap">
              {notification.createdAt}
            </span>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-200">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
        />
      </div>
    </div>
  );
}
