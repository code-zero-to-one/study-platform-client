import Image from 'next/image';
import { IoMdPeople } from 'react-icons/io';
import { LuDot } from 'react-icons/lu';
import Badge from '@/shared/ui/badge';
import Button from '@/shared/ui/button';

export interface MyStudyInfoProps {
  imageUrl: string;
  status?: string;
  title: string;
  leaderLabel: string;
  members: string;
  startDate: string;
  endDate?: string;
  applicantsLabel: string;
}

export default function MyStudyInfoCard({
  imageUrl,
  status,
  title,
  leaderLabel,
  members,
  startDate,
  endDate,
  applicantsLabel,
}: MyStudyInfoProps) {
  return (
    <div className="flex w-full flex-col gap-100">
      <div className="relative h-[180px] w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="320px"
        />
      </div>
      {status && (
        <div className="inline-block w-auto">
          <Badge>{status}</Badge>
        </div>
      )}
      <div className="font-designer-15b">{title}</div>
      <div>
        <div className="flex flex-row items-center justify-start gap-50">
          <div className="font-designer-14m text-text-subtle">스터디 리더</div>
          <div className="flex flex-row">
            <IoMdPeople />
            <LuDot />
            <div className="font-designer-12m text-text-subtle">{members}</div>
          </div>
        </div>
        <div className="font-designer-12m text-text-subtle">
          <div>
            {startDate} ~{endDate && ` ${endDate}`}
          </div>
        </div>
      </div>
      <Button color="secondary">신청자 N명 확인하기</Button>
    </div>
  );
}
