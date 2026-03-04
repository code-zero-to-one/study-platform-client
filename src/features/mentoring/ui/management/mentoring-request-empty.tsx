import Image from 'next/image';
import Button from '@/components/ui/button';
import SurfacePanel from '@/components/ui/surface-panel';

export default function MentoringRequestEmpty() {
  return (
    <SurfacePanel
      radius="lg"
      className="flex min-h-[360px] flex-col items-center justify-center px-300 py-[60px] text-center"
    >
      <div className="mb-200">
        <Image
          src="/empty-mentoring.svg"
          alt=""
          width={120}
          height={120}
          className="h-[120px] w-[120px]"
        />
      </div>
      <h2 className="font-designer-18b text-text-default mb-75">
        멘토링 신청 내역이 없어요
      </h2>
      <p className="font-designer-14r text-text-subtle mb-150">
        멘토링 설정을 완료하면 다른 사람이 멘토링을 받을 수 있어요.
      </p>
      <Button color="primary" size="medium">
        멘토링 설정
      </Button>
    </SurfacePanel>
  );
}
