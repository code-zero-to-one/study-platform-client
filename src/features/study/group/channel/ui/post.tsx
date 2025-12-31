import dayjs from 'dayjs';
import UserAvatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { useLeaderStore } from '@/stores/useLeaderStore';
import GroupStudyNoticeModal from '../../ui/group-notice-modal';

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

  return (
    <div className="flex flex-col border-b-[1px] border-[#D5D7DA]">
      <div className="mb-500 flex flex-col gap-250">
        <div className="flex items-center justify-between">
          <p className="font-designer-32b text-text-strong">
            {data?.noticeTitle}
          </p>

          <GroupStudyNoticeModal
            trigger={<Button size="medium">공지 수정하기</Button>}
            groupStudyId={data.groupStudyId}
            defaultValues={{
              noticeTitle: data.noticeTitle,
              noticeContent: data.noticeContent,
            }}
          />
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
              <div className="text-text-brand font-designer-12m bg-fill-brand-subtle-default rounded-[3px] px-[6px] py-[2.5px]">
                스터디 리더
              </div>
            </div>
            <div className="font-designer-13r text-text-subtlest flex items-center gap-[8px]">
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
