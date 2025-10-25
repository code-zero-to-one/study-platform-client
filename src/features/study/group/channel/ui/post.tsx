import dayjs from 'dayjs';
import React from 'react';
import UserAvatar from '@/shared/ui/avatar';

interface PostProps {
  data: {
    groupStudyId: number;
    noticeTitle: string;
    noticeContent: string;
    updatedAt: string;
  };
}
export default function Post({ data }: PostProps) {
  return (
    <div className="flex flex-col border-b-[1px] border-[#D5D7DA]">
      <div className="mb-500 flex flex-col gap-250">
        <p className="font-designer-32b text-text-strong">
          {data?.noticeTitle}
        </p>

        <div className="flex gap-150">
          <UserAvatar size={48} image={undefined} />
          <div className="flex flex-col gap-50">
            <div className="flex gap-50">
              <span className="font-designer-15b">리더 이름</span>
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
      <div className="mb-500">{data.noticeContent}</div>
    </div>
  );
}
