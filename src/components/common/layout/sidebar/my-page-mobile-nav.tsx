'use client';

import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const NAV_ITEMS = [
  { href: '/my-page', label: '프로필' },
  { href: '/notification', label: '알림' },
  { href: '/my-activity', label: '내 활동' },
  { href: '/my-study', label: '마이스터디' },
  { href: '/my-study-review', label: '스터디 후기' },
  { href: '/payment-management', label: '결제 관리' },
];

export default function MyPageMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex overflow-x-auto border-b border-border-subtle lg:hidden">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className={cn(
            'font-designer-14m shrink-0 px-300 py-200 text-text-subtle',
            (pathname === item.href || pathname.startsWith(item.href + '/')) &&
              'border-b-2 border-text-default text-text-default',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
