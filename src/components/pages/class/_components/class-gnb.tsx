'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { MaterialIcon } from './material-icon';

interface NavItem {
  id: 'class' | 'qna' | 'community';
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'class', label: '클래스', href: '/class' },
  { id: 'qna', label: '질문답변', href: '/qna' },
  { id: 'community', label: '커뮤니티', href: '/community/feed' },
];

const resolveActive = (pathname: string): NavItem['id'] | undefined => {
  if (pathname.startsWith('/class')) return 'class';
  if (pathname.startsWith('/qna')) return 'qna';
  if (pathname.startsWith('/community')) return 'community';
  return undefined;
};

interface ClassGNBProps {
  isLoggedIn?: boolean;
  userName?: string;
  userGrade?: '빌더' | '1학년' | '2학년' | '3학년' | '4학년' | '펠로우';
}

export function ClassGNB({
  isLoggedIn = true,
  userName = '도현',
  userGrade = '빌더',
}: ClassGNBProps) {
  const pathname = usePathname();
  const active = resolveActive(pathname);

  return (
    <header className="bg-background-default sticky top-0 z-40 flex h-800 items-center border-b border-border-subtle px-600">
      <div className="mx-auto flex w-full max-w-page items-center gap-400">
        <Link
          href="/class"
          aria-label="ZERO-ONE 클래스 메인"
          className="inline-flex items-center"
        >
          <Image
            src="/images/class/zero-one-logo.png"
            alt="ZERO ONE IT"
            width={113}
            height={28}
            priority
            className="h-350 block w-auto"
          />
        </Link>

        <nav className="ml-300 flex gap-50" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              isActive={active === item.id}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-100">
          {isLoggedIn ? (
            <LoggedInControls userName={userName} userGrade={userGrade} />
          ) : (
            <LoggedOutControls />
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-75 px-150 py-100 transition-colors',
        isActive
          ? 'font-designer-15b text-text-strong'
          : 'font-designer-15m text-text-default hover:bg-fill-neutral-subtle-hover',
      )}
    >
      {children}
    </Link>
  );
}

function LoggedInControls({
  userName,
  userGrade,
}: {
  userName: string;
  userGrade: NonNullable<ClassGNBProps['userGrade']>;
}) {
  const gradeColorClass = (() => {
    switch (userGrade) {
      case '1학년':
        return 'bg-blue-100 text-blue-900';
      case '2학년':
        return 'bg-green-100 text-green-900';
      case '3학년':
        return 'bg-yellow-100 text-yellow-900';
      case '4학년':
        return 'bg-rose-200 text-rose-800';
      case '펠로우':
        return 'bg-gray-900 text-white';
      case '빌더':
      default:
        return 'bg-rose-100 text-rose-900';
    }
  })();

  return (
    <>
      <button
        type="button"
        aria-label="알림"
        className="hover:bg-fill-neutral-subtle-hover h-400 w-400 inline-flex items-center justify-center rounded-full transition-colors"
      >
        <MaterialIcon
          name="notifications"
          size={22}
          className="text-icon-default"
        />
      </button>
      <div className="flex items-center gap-150 px-100">
        <span className="font-designer-13b text-text-strong">{userName}</span>
        <span
          className={cn(
            'font-designer-11b inline-flex items-center rounded-50 px-100 py-25',
            gradeColorClass,
          )}
        >
          {userGrade}
        </span>
      </div>
      <button
        type="button"
        className="hover:bg-fill-neutral-subtle-hover font-designer-13b text-text-default rounded-75 px-150 py-100 transition-colors"
      >
        로그아웃
      </button>
    </>
  );
}

function LoggedOutControls() {
  return (
    <>
      <Link
        href="/login"
        className="hover:bg-fill-neutral-subtle-hover font-designer-13b text-text-default rounded-75 px-150 py-100 transition-colors"
      >
        로그인
      </Link>
      <Link
        href="/sign-up"
        className="font-designer-13b bg-fill-brand-default-default hover:bg-fill-brand-default-hover rounded-50 px-200 py-100 text-white transition-colors"
      >
        회원가입
      </Link>
    </>
  );
}
