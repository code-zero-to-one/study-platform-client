'use client';

import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const NAV_ITEMS = [
  { href: '/my-page', label: '프로필' },
  { href: '/my-class', label: '마이 클래스' },
  { href: '/my-posts', label: '내가 작성한 글', prefixMatch: true },
  { href: '/my-inquiry', label: '1:1 문의', prefixMatch: true },
  { href: '/builder-letter', label: '빌더 레터', prefixMatch: true },
  { href: '/class-payment-management', label: '결제 관리' },
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
            (item.prefixMatch
              ? pathname.startsWith(item.href)
              : pathname === item.href) &&
              'border-b-2 border-primary-500 text-text-brand',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
