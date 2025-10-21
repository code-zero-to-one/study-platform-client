import React from 'react';
import Button from '@/shared/ui/button';

interface SummaryStudyInfoProps {
  data: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  title: string;
}

export default function SummaryStudyInfo({
  data,
  title,
}: SummaryStudyInfoProps) {
  return (
    <div className="rounded-150 flex w-[335px] flex-col self-start border-[1px] border-[#D5D7DA] p-300">
      <p className="font-designer-18b">{title}</p>
      <div className="my-300 h-[1px] w-full bg-[#D5D7DA]" />
      <div className="grid grid-cols-2 grid-rows-2 gap-200">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-100 border-[#E7E8EA]"
          >
            <div className="flex items-center">{item.icon}</div>
            <span className="text-400 font-designer-15m truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-500 flex flex-col gap-100">
        <Button size="large" color="primary" className="h-[48px]">
          신청하기
        </Button>
        <Button
          color="secondary"
          size="large"
          className="font-designer-16b h-[48px]"
          disabled
        >
          공유하기
        </Button>
      </div>
    </div>
  );
}
