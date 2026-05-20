'use client';

import {
  BookOpen,
  CreditCard,
  FileEdit,
  LogOut,
  Mail,
  PenLine,
  User,
  type LucideIcon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  prefixMatch?: boolean;
}[] = [
  { href: '/my-page', label: '프로필', icon: User },
  { href: '/my-class', label: '마이 클래스', icon: BookOpen },
  {
    href: '/my-posts',
    label: '내가 작성한 글',
    icon: PenLine,
    prefixMatch: true,
  },
  {
    href: '/my-inquiry',
    label: '1:1 문의',
    icon: FileEdit,
    prefixMatch: true,
  },
  {
    href: '/builder-letter',
    label: '빌더 레터',
    icon: Mail,
    prefixMatch: true,
  },
  { href: '/payment-management', label: '결제 관리', icon: CreditCard },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: logout } = useLogoutMutation();

  return (
    <div className="border-border-subtle box-border hidden w-[300px] flex-col gap-150 border-x-1 px-300 pt-500 lg:flex">
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.href}
          onClick={() => router.push(item.href)}
          isActive={
            item.prefixMatch
              ? pathname.startsWith(item.href)
              : pathname === item.href
          }
          icon={item.icon}
        >
          {item.label}
        </SidebarItem>
      ))}
      <div className="bg-border-subtlest h-[1px]" />
      <SidebarItem onClick={() => logout()} isActive={false} icon={LogOut}>
        로그아웃
      </SidebarItem>
    </div>
  );
}

function SidebarItem({
  children,
  isActive,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <div className="flex py-175 pr-150 pl-150">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex cursor-pointer items-center gap-250',
          isActive
            ? 'font-designer-18b text-text-default'
            : 'font-designer-18m text-text-subtle',
        )}
      >
        <Icon size={24} />
        {children}
      </button>
    </div>
  );
}
