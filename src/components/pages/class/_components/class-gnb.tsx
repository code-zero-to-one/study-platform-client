'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useToastStore } from '@/stores/use-toast-store';
import { MaterialIcon } from './material-icon';

interface NavItem {
  id: 'class' | 'community' | 'insights';
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'class', label: '클래스', href: '/class' },
  { id: 'community', label: '커뮤니티', href: '/community' },
  { id: 'insights', label: '인사이트', href: '/insights' },
];

const resolveActive = (pathname: string): NavItem['id'] | undefined => {
  if (pathname.startsWith('/class')) return 'class';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/insights')) return 'insights';
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
          className="flex items-center gap-100 px-100 py-125"
        >
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Image
            src="/icons/logo_title.svg"
            alt="ZERO-ONE"
            width={106}
            height={11}
          />
          <span className="border-border-default rounded-full border-[0.5px] px-75 py-25 text-center text-[7.5px] leading-normal font-medium">
            BETA
          </span>
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
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goMyPage = () => {
    setOpen(false);
    router.push('/my-page');
  };
  const onLogout = () => {
    setOpen(false);
    showToast('로그아웃 되었어요', 'info');
  };

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
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'flex items-center gap-150 px-100 py-50 rounded-75 transition-colors cursor-pointer',
            open
              ? 'bg-fill-neutral-subtle-hover'
              : 'hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <span className="font-designer-13b text-text-strong">{userName}</span>
          <span
            className={cn(
              'font-designer-11b inline-flex items-center rounded-50 px-100 py-25',
              gradeColorClass,
            )}
          >
            {userGrade}
          </span>
          <MaterialIcon
            name={open ? 'expand_less' : 'expand_more'}
            size={16}
            className="text-icon-subtle"
          />
        </button>

        {open ? (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 180,
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 12,
              boxShadow:
                '0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)',
              padding: 6,
              zIndex: 50,
            }}
          >
            <DropdownItem icon="person" onClick={goMyPage}>
              마이페이지
            </DropdownItem>
            <DropdownItem
              icon="school"
              onClick={() => {
                setOpen(false);
                router.push('/my-class');
              }}
            >
              나의 클래스
            </DropdownItem>
            <div
              style={{ height: 1, background: '#F5F5F5', margin: '4px 6px' }}
            />
            <DropdownItem icon="logout" onClick={onLogout}>
              로그아웃
            </DropdownItem>
          </div>
        ) : null}
      </div>
    </>
  );
}

function DropdownItem({
  icon,
  onClick,
  children,
}: {
  icon: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: 'transparent',
        border: 0,
        borderRadius: 6,
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        color: '#181D27',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#FAFAFA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <MaterialIcon name={icon} size={16} style={{ color: '#535862' }} />
      {children}
    </button>
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
