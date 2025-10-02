'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SingleDropdown } from '@/shared/ui/dropdown';

export default function AdminPage() {
  return (
    <div className="flex">
      <aside className="border-border-subtle h-screen w-fit border-r p-200">
        <div className="border-border-subtle flex items-center gap-150 border-b py-200">
          <Image
            src="icons/book.svg"
            width={40}
            height={40}
            alt="admin-image"
            className="rounded-full"
          />

          <div className="w-[136px]">
            <p className="font-designer-14m text-text-default">관리자</p>
            <p className="font-designer-12r text-text-subtle">
              kimkim@gmail.com
            </p>
          </div>

          <Image src="icons/logout.svg" width={16} height={16} alt="logout" />
        </div>

        <nav className="mt-200">
          <Link
            href="/admin"
            className="bg-background-accent-blue-strong text-text-inverse font-designer-14m rounded-100 inline-block w-full px-200 py-150"
          >
            사용자 관리
          </Link>
        </nav>
      </aside>

      <div className="flex-1 p-300">
        <div className="flex items-center">
          <div>
            <h1 className="font-bold-h4">사용자 관리</h1>
            <span className="font-designer-16r text-text-subtle">총 </span>
            <span className="font-designer-16r text-text-information">50</span>
            <span className="font-designer-16r text-text-subtle">
              명의 사용자
            </span>
          </div>
        </div>

        <div className="mt-300 mb-200 flex justify-end gap-150 py-100">
          <div className="flex w-[300px] gap-150">
            <SingleDropdown
              options={[
                {
                  value: '일반',
                  label: '일반',
                },
                {
                  value: '멘토',
                  label: '멘토',
                },
              ]}
              placeholder="권한"
            />
            <SingleDropdown
              options={[
                {
                  value: '활성',
                  label: '활성',
                },
                {
                  value: '일시정지',
                  label: '일시정지',
                },
                {
                  value: '영구정지',
                  label: '영구정지',
                },
                {
                  value: '휴면',
                  label: '휴면',
                },
              ]}
              placeholder="계정 상태"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
