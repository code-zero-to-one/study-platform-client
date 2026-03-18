'use client';

import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import UserAvatar from '@/components/common/ui/avatar';

export default function HeaderUserDropdown({
  userImg,
}: {
  userImg: string | undefined;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full focus:outline-none">
        <div>
          <UserAvatar image={userImg} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-100 border-border-default bg-background-default shadow-2 flex w-full flex-col gap-50 border p-50">
        <DropdownMenuItem
          onClick={() => router.push('/my-page')}
          className="active:bg-fill-neutral-subtle-pressed rounded-100 h-[48px] w-full cursor-pointer p-150"
        >
          <span className="font-designer-14m text-text-subtle">마이페이지</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
