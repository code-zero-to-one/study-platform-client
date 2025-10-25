import dayjs from 'dayjs';
import UserAvatar from '@/shared/ui/avatar';

interface CommentProps {
  data: {
    authorName: string;
    isLeader: boolean;
    updatedAt: string;
    content: string;
    imageLocation: string;
  };
}
export default function Comment({ data }: CommentProps) {
  return (
    <div className="flex items-center gap-150">
      <UserAvatar size={40} image={undefined} />
      <div className="flex flex-col gap-100">
        <div className="flex items-center gap-100">
          <span className="font-designer-15b">{data.authorName}</span>
          {data.isLeader && (
            <div className="text-text-brand font-designer-12m bg-fill-brand-subtle-default rounded-[3px] px-[6px] py-[2.5px]">
              스터디 리더
            </div>
          )}
          <span className="font-designer-13r text-text-subtlest">
            {dayjs(data.updatedAt).format('YYYY.MM.DD  HH:mm')}
          </span>
        </div>
        <p className="font-designer-15r">{data.content}</p>
      </div>
    </div>
  );
}
