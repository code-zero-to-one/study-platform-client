import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
}

export default function InfoCard({ icon, title, value }: Props) {
  return (
    <div className="rounded-100 flex flex-col gap-300 border-[1px] border-[#D5D7DA] p-300">
      <div className="flex flex-col gap-50">
        <span className="font-designer-13m text-[#A4A7AE]">{title}</span>
        <span className="font-designer-16b">{value}</span>
      </div>
      <div className="flex justify-end">{icon}</div>
    </div>
  );
}
