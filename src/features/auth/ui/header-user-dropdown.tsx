'use client';

import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/shadcn/ui/dropdown-menu';
import UserAvatar from '@/shared/ui/avatar';
import { useLogoutMutation } from '../model/use-auth-mutation';

export default function HeaderUserDropdown({ userImg }: { userImg: string }) {
  const { mutateAsync: logout } = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div>
          <UserAvatar image={userImg} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        {[
          {
            label: '내 정보 수정',
            value: '/my-page',
            onMenuClick: () => router.push('/my-page'),
          },
          {
            label: '로그아웃',
            value: 'logout',
            onMenuClick: handleLogout,
          },
        ].map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={option.onMenuClick}
            className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
          >
            <span className="font-designer-14m text-text-subtle">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
