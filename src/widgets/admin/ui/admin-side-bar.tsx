import Image from 'next/image';
import Link from 'next/link';
import TabMenu from '@/shared/ui/tab-menu';
import LogoutIcon from 'public/icons/logout.svg';

export default function AdminSideBar() {
  return (
    <aside className="border-border-subtle h-screen w-fit border-r p-200">
      <div className="border-border-subtle flex items-center gap-150 border-b py-200">
        {/* 사용자 프로필 이미지 */}

        <div className="w-[136px]">
          <p className="font-designer-14m text-text-default">관리자</p>
          <p className="font-designer-12r text-text-subtle">kimkim@gmail.com</p>
        </div>

        <LogoutIcon />
      </div>

      <nav className="mt-200">
        <TabMenu active={true}>
          <Link href="/admin">사용자 관리</Link>
        </TabMenu>
      </nav>
    </aside>
  );
}
