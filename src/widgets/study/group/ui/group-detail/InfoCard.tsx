import { Image, LucideIcon } from 'lucide-react';
import React from 'react';

interface Props {
  title: string;
  value: string;
  icon?: LucideIcon;
}

export default function InfoCard({ icon: Icon, title, value }: Props) {
  return (
    <div className="rounded-100 gap-300 border-[1px] border-[#D5D7DA] p-300">
      <div className="flex flex-col gap-50">
        <span className="font-designer-13m text-[#A4A7AE]">{title}</span>
        <span className="font-designer-16b">{value}</span>
      </div>

      {/* <Icon src={icon} alt="사진" /> */}
    </div>
  );
}
