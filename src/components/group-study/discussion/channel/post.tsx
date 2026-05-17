import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import UserAvatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import { useIsLeader, useLeaderStore } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';

const GroupStudyNoticeModal = dynamic(
  () => import('@/components/group-study/modals/group-notice-modal'),
);

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface PostProps {
  data: {
    groupStudyId: number;
    noticeTitle: string;
    noticeContent: string;
    updatedAt: string;
  };
}
export default function Post({ data }: PostProps) {
  const leader = useLeaderStore((state) => state.leaderInfo);
  const myMemberId = useUserStore((state) => state.memberId);
  const isLeader = useIsLeader(myMemberId);

  if (!leader) return null;

  return (
    <div className="flex flex-col border-b border-[#D5D7DA]">
      <div className="mb-500 flex flex-col gap-250">
        <div className="flex items-center justify-between">
          <p className="font-designer-32b text-text-strong">
            {data?.noticeTitle}
          </p>

          {isLeader && (
            <GroupStudyNoticeModal
              trigger={<Button size="medium">공지 수정하기</Button>}
              groupStudyId={data.groupStudyId}
              defaultValues={{
                noticeTitle: data.noticeTitle,
                noticeContent: data.noticeContent,
              }}
            />
          )}
        </div>

        <div className="flex gap-150">
          <UserProfileModal
            memberId={leader.memberId}
            trigger={
              <UserAvatar
                size={48}
                image={leader.profileImage?.resizedImages[0].resizedImageUrl}
              />
            }
          />
          <div className="flex flex-col gap-50">
            <div className="flex gap-50">
              <span className="font-designer-15b">{leader.memberNickname}</span>
              <div className="text-text-brand font-designer-12m bg-fill-brand-subtle-default rounded-[3px] px-75 py-[2.5px]">
                스터디 리더
              </div>
            </div>
            <div className="font-designer-13r text-text-subtlest flex items-center gap-100">
              <span>{dayjs(data.updatedAt).format('YYYY.MM.DD  HH:mm')}</span>
              <span>작성</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-500 whitespace-pre-line">{data.noticeContent}</div>
    </div>
  );
}
