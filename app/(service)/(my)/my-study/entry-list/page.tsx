import Image from 'next/image';
import ApplicantList from '@/features/my-page/ui/applicant-list';

export default function EntryPage() {
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

      <ApplicantList />
    </div>
  );
}
