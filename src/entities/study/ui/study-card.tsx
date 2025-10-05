import React from 'react';
import Badge from '@/shared/ui/badge';

export interface GroupStudy {
  basicInfo: {
    groupStudyId: number; // int64
    type: string;
    targetRole: string;
    maxMembers: number; // int32
    experienceLevel: string;
    method: string;
    regularMeeting: string;
    startDate: string; // date
    durationWeeks: number; // int32
    price: number;
    status: string;
    createdAt: string; // date-time
    updatedAt: string; // date-time
  };
  simpleDetailInfo: {
    title: string;
    summary: string;
  };
}

export default function StudyCard(props: GroupStudy) {
  const { basicInfo, simpleDetailInfo } = props;

  const basicInfoItems = [
    {
      label: '유형',
      value:
        basicInfo.method === 'online'
          ? '온라인'
          : basicInfo.method === 'offline'
            ? '오프라인'
            : '혼합',
    },
    { label: '주제', value: `${basicInfo.maxMembers}명` },
    {
      label: '경력',
      value:
        basicInfo.experienceLevel === 'beginner'
          ? '초급'
          : basicInfo.experienceLevel === 'intermediate'
            ? '중급'
            : '고급',
    },
    { label: '정기모임', value: `${basicInfo.durationWeeks}주` },
    {
      label: '모집인원',
      value: `/${basicInfo.maxMembers}`,
    },
    {
      label: '참가비',
      value:
        basicInfo.price === 0
          ? '무료'
          : `${basicInfo.price.toLocaleString()}원`,
    },
  ];

  return (
    <div className="rounded-100 flex w-full justify-between gap-500 border border-solid border-[#D5D7DA] p-400">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-100">
          <div className="flex gap-100">
            <span className="font-designer-18b max-w-[673px] truncate text-[#252B37]">
              {simpleDetailInfo.title}
            </span>
            <Badge color="red">제로원 스터디</Badge>
          </div>
          <p className="font-designer-15r line-clamp-2 text-[15px] leading-[29px] text-[#535862]">
            {simpleDetailInfo.summary}
          </p>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-y-50">
          {basicInfoItems.map((item, idx) => (
            <div key={idx} className="flex gap-50">
              <span className="font-designer-13m leading-250 text-[#A4A7AE]">
                {item.label}
              </span>
              <span className="font-designer-13m text-[#535862]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[160px] w-[240px]">img</div>
    </div>
  );
}
