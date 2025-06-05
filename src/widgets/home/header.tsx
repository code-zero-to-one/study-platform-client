'use client';

import Link from 'next/link';
import UserAvatar from '@/shared/ui/avatar';
import Button from '@/shared/ui/button';
import NotiIcon from 'public/icons/notifications_none.svg';

export default function Header() {
  return (
    <header className="w-full border-b border-[#E7E8EA] bg-white mix-blend-multiply">
      <div className="container mx-auto flex h-16 items-center justify-between gap-600 px-6 py-75">
        <div className="font-designer-18b text-text-strong shrink-0">
          <Link href="/">ZERO-ONE</Link>
        </div>

        <nav className="font-designer-14m text-text-default hidden flex-grow gap-150 md:flex">
          <Link href="/about">제로원 알아보기</Link>
          <Link href="/study">마이스터디</Link>
        </nav>

        <div className="flex shrink-0 items-center gap-150">
          <Link href="/notifications" aria-label="알림">
            <NotiIcon />
          </Link>
          <Link href="/mypage">
            <UserAvatar />
          </Link>
          <Link href="/login">
            <Button color="primary" size="small">
              로그인 / 회원가입
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
