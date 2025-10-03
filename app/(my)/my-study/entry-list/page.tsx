import Image from 'next/image';
import EntryCard from '@/features/my-page/ui/entry-card';

export default function EntryList() {
  return (
    <div className="w-720px flex flex-col gap-300">
      <div className="font-designer-20b flex items-center">
        <Image
          src="/icons/arrow-left-line.svg"
          alt="arrow-left"
          width={40}
          height={40}
        />
        <div className="flex-1 text-center">새로운 신청자 확인하기</div>
      </div>

      <div className="flex flex-col gap-500">
        <EntryCard />
      </div>
    </div>
  );
}
