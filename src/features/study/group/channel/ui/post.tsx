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
    <div className="flex flex-col">
      <div className="mb-500 flex flex-col gap-250">
        <p className="">{data?.noticeTitle}</p>

        <div className="flex gap-150">
          {/* <UserAvatar size={48} image={undefined} /> */}
          <div className="flex flex-col gap-50">
            <div className="flex gap-50">
              <span>리더 이름</span>
              <span>스터디 리더 태그</span>
            </div>
            <p>{data.updatedAt}</p>
          </div>
        </div>
      </div>
      <div className="mb-500">{data.noticeContent}</div>
    </div>
  );
}
