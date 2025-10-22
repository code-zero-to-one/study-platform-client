import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/features/auth/ui/login-modal';
import Button from '@/shared/ui/button';

export default async function Header() {
  return (
    <header
      className={clsx('w-full bg-white px-600 py-[11px] mix-blend-multiply')}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-[7.5px] px-[8px] py-[11px]">
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/home">
            <Image
              src="/icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-[#D5D7DA] px-[5px] py-[2.5px] text-center text-[7.5px] leading-normal font-[500]">
            BETA
          </span>
        </div>

        {/* 1차 MVP에선 사용하지 않아 제외 */}
        <nav className="font-designer-14m text-text-default flex flex-grow items-center gap-300 px-600">
          {/* <Link href="/study">스터디 둘러보기</Link>
          <Link href="/">팀소개</Link> */}
        </nav>

        <div>
          <LoginModal openTrigger={<Button>로그인 / 회원가입</Button>} />
        </div>
      </div>
    </header>
  );
}
