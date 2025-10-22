import Button from '@/shared/ui/button';

export default async function LandingForm() {
  return (
    <form className="h-[768px] w-[720px]">
      <div className="flex w-full flex-col gap-75">
        <div className="">연락 받을 이메일 주소를 입력해주세요.</div>
        <input
          type="text"
          placeholder="zeroone@email.com"
          className="w-full rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px]"
        />
        <Button color="primary" className="w-full py-[16px]">
          오픈 알림 신청하기
        </Button>
      </div>
    </form>
  );
}
