'use client';

import Link from 'next/link';
import UserAvatar from '@/shared/ui/avatar';
import Button from "@/shared/ui/button";
import NotiIcon from 'public/icons/notifications_none.svg';

export default function Header() {
   return (
      <header className='w-full border-b border-[#E7E8EA] mix-blend-multiply bg-white'>
         <div className='container mx-auto h-16 px-6 py-75 flex items-center justify-between gap-600'>
            <div className='shrink-0 font-designer-18b text-text-strong'>
               <Link href='/'>ZERO-ONE</Link>
            </div>

            {/* 1차 MVP에선 사용하지 않아 제외 */}
            {/* <nav className='hidden flex-grow md:flex gap-150 font-designer-14m text-text-default'>
               <Link href='/about'>제로원 알아보기</Link>
               <Link href='/study'>마이스터디</Link>
            </nav> */}

            <div className='shrink-0 flex items-center gap-150'>
               <Link href='/notifications' aria-label='알림'>
                  <NotiIcon />
               </Link>
               <Link href='/my-page'>
                  <UserAvatar />
               </Link>
               <Link href="/login">
                  <Button color="primary" size="small">
                     로그인 / 회원가입
                  </Button>
               </Link>
            </div>
         </div>
      </header>
   );
}
