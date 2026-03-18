import Image from 'next/image';
import Link from 'next/link';
import HeaderNav from '@/components/common/layout/header-nav';
import MobileMenuDrawer from '@/components/common/layout/mobile-menu-drawer';
import PrototypeLoginToggle from '@/components/common/layout/prototype-login-toggle';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';

// [프로토타입 브랜치] 서버 사이드 인증 없이 PrototypeLoginToggle로 로그인 상태를 클라이언트에서 제어함.
export default function Header() {
  return (
    <header className="bg-white py-[11px] mix-blend-multiply">
      <div className="mx-auto flex w-full max-w-[1496px] items-center justify-between px-600">
        <div className="flex items-center gap-[7.5px] px-100 py-[11px]">
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/">
            <Image
              src="/icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-[#D5D7DA] px-[5px] py-[2.5px] text-center text-[7.5px] leading-normal font-medium">
            BETA
          </span>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
          <HeaderNav isLoggedIn={true} />

          <div className="flex items-center gap-200">
            <StudyMatchingToggle />
          </div>

          <div className="ml-150">
            <PrototypeLoginToggle />
          </div>
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <div className="lg:hidden">
          <MobileMenuDrawer isLoggedIn={true} />
        </div>
      </div>
    </header>
  );
}
