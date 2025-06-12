'use client';

import Link from 'next/link';
import UserAvatar from '@/shared/ui/avatar';
import Button from "@/shared/ui/button";
import NotiIcon from 'public/icons/notifications_none.svg';
import { deleteCookie } from '@/shared/tanstack-query/cookie';
import { logout } from '@/features/auth/api/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemberInfo } from '@/features/auth/model/useAuth';

export default function Header() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const memberInfo = useMemberInfo();
   const handleLogout = async () => {

      try {
         // 1. 서버에 로그아웃 요청 (refresh token 삭제)
         await logout();
         
         // 2. 클라이언트의 access token 삭제
         deleteCookie('accessToken');
         deleteCookie('memberId');
         
         // 3. React Query 캐시 초기화
         queryClient.clear();
         
         // 4. 홈으로 리다이렉트
         await router.push('/');
         await router.refresh();  // 전체 페이지 리프레시
      } catch (error) {
         console.error('로그아웃 실패:', error);
      }
      };
  
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
               {!memberInfo.data?.isLogin ? (
               <Link href="/login">
                  <Button color="primary" size="small">
                     로그인 / 회원가입
                  </Button>
               </Link>
               ) : (
               <Button 
                  color="primary" 
                  size="small"
                  onClick={handleLogout}
               >
                  로그아웃
               </Button>
               )}
            </div>
         </div>
      </header>
   );
}
