import { format } from 'date-fns';
import { MemberNotificationResponse } from '@/api/openapi';
import Badge from '../common/ui/badge';

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
    case 'MENTOR_ADMITTANCE':
      return 'red';
    case 'SYSTEM':
      return 'gray';
    case 'MARKETING':
      return 'orange';
    default:
      return 'gray';
  }
};

interface NotificationListProps {
  notifications?: MemberNotificationResponse[];
  onNotificationClick?: (notification: MemberNotificationResponse) => void;
}

export default function NotificationList({
  notifications,
  onNotificationClick,
}: NotificationListProps) {
  return (
    <ul>
      {notifications?.map((notification) => (
        <li
          key={notification.id}
          className="border-bottom-border-default bg-background-default hover:bg-background-neutral-subtle flex cursor-pointer items-center justify-between border-b py-150"
          onClick={() => onNotificationClick?.(notification)}
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
          <div className="flex items-center gap-100">
            <span className="font-designer-11r text-text-subtlest whitespace-nowrap">
              {format(notification.createdAt, 'yyyy.MM.dd HH:mm')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
