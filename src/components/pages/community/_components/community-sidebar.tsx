'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface CommunityNavItem {
  label: string;
  href: string;
  matcher: (pathname: string) => boolean;
}

const NAV_ITEMS: CommunityNavItem[] = [
  {
    label: '홈',
    href: '/community',
    matcher: (p) => p === '/community',
  },
  {
    label: '빌더 피드',
    href: '/community/feed',
    matcher: (p) => p.startsWith('/community/feed'),
  },
  {
    label: '질문답변',
    href: '/community/qna',
    matcher: (p) => p.startsWith('/community/qna'),
  },
  {
    label: '테크 한입',
    href: '/community/tech',
    matcher: (p) => p.startsWith('/community/tech'),
  },
  {
    label: '자유게시판',
    href: '/community/free',
    matcher: (p) => p.startsWith('/community/free'),
  },
];

export function CommunitySidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border-subtle box-border hidden w-[260px] flex-col gap-150 border-x-1 px-300 pt-500 lg:flex">
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.href}
          href={item.href}
          isActive={item.matcher(pathname)}
        >
          {item.label}
        </SidebarItem>
      ))}
    </aside>
  );
}

function SidebarItem({
  children,
  isActive,
  href,
}: {
  children: React.ReactNode;
  isActive: boolean;
  href: string;
}) {
  return (
    <div className="flex py-[14px] pr-150 pl-150">
      <Link
        href={href}
        className={cn(
          'font-designer-18m text-text-default block w-full cursor-pointer',
          isActive && 'font-designer-18b text-text-default',
        )}
      >
        {children}
      </Link>
    </div>
  );
}
