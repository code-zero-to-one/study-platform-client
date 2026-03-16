'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';


import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useLogoutMutation } from '@/hooks/queries/use-auth-mutation';

const LoginModal = dynamic(
  () => import('@/components/common/modals/login-modal'),
);

const NAV_ITEMS = [
  { href: '/home', label: '1:1 스터디' },
  { href: '/mentoring', label: '1:1 멘토링' },
  { href: '/group-study', label: '그룹스터디' },
  { href: '/premium-study', label: '멘토스터디' },
  { href: '/insights', label: '인사이트' },
];

interface MobileMenuDrawerProps {
  isLoggedIn: boolean;
}

export default function MobileMenuDrawer({
  isLoggedIn,
}: MobileMenuDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { mutateAsync: logout } = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* 햄버거 버튼 — header 내부에 유지 */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
        className="flex flex-col items-center justify-center gap-[5px] p-100"
      >
        <svg
          width="22"
          height="2"
          viewBox="0 0 22 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="22" height="2" fill="currentColor" />
        </svg>
        <svg
          width="22"
          height="2"
          viewBox="0 0 22 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="22" height="2" fill="currentColor" />
        </svg>
        <svg
          width="22"
          height="2"
          viewBox="0 0 22 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="22" height="2" fill="currentColor" />
        </svg>
      </button>

      {/* 드로어 패널 — 헤더의 mix-blend-multiply compositing group을 탈출하기 위해 portal로 body에 렌더링 */}
      {mounted &&
        createPortal(
          <>
            {/* 오버레이 */}
            <div
              className={cn(
                'fixed inset-0 z-40 bg-background-dimmer transition-opacity duration-300',
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              onClick={close}
            />

            {/* 좌측 슬라이드 패널 */}
            <div
              className={cn(
                'fixed left-0 top-0 z-50 flex h-full w-4/5 max-w-xs flex-col bg-background-default transition-transform duration-300',
                isOpen ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              {/* 패널 헤더 */}
              <div className="flex items-center justify-between border-b border-border-subtle px-400 py-300">
                <div className="flex items-center gap-[7.5px]">
                  <Image
                    src="/icons/logo.svg"
                    alt="Logo"
                    width={18}
                    height={18}
                  />
                  <Image
                    src="/icons/logo_title.svg"
                    alt="ZERO-ONE"
                    width={106}
                    height={11}
                  />
                </div>
                <button
                  onClick={close}
                  aria-label="메뉴 닫기"
                  className="p-100"
                >
                  <Image
                    src="/icons/modal-close.svg"
                    alt="닫기"
                    width={24}
                    height={24}
                  />
                </button>
              </div>

              {/* 네비게이션 */}
              <nav className="flex flex-col px-400 py-300">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={cn(
                        'font-designer-14m py-200 text-text-subtle',
                        isActive && 'text-text-brand',
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* 하단 인증 버튼 */}
              <div className="mt-auto border-t border-border-subtle px-400 py-300">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-200">
                    <Link
                      href="/my-page"
                      onClick={close}
                      className="font-designer-14m text-text-subtle"
                    >
                      마이페이지
                    </Link>
                    <button
                      onClick={async () => {
                        close();
                        await logout();
                      }}
                      className="font-designer-14m text-left text-text-subtle"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <LoginModal
                    openTrigger={
                      <button className="font-designer-14m text-text-subtle">
                        로그인 / 회원가입
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
