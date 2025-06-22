'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/features/auth/api/auth';
import { useMemberInfo } from '@/features/auth/model/use-auth';
import { deleteCookie } from '@/shared/tanstack-query/cookie';
import UserAvatar from '@/shared/ui/avatar';
import Button from '@/shared/ui/button';
import { HeaderDropdown } from '@/shared/ui/dropdown';
import NotiIcon from 'public/icons/notifications_none.svg';

export default function Header() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const memberInfo = useMemberInfo();
  console.log("프로필 이미지 주소",memberInfo.data?.content?.memberProfile?.profileImage?.resizedImages[0]?.resizedImageUrl);

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
      router.push('/');
      router.refresh(); // 전체 페이지 리프레시
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className="w-full border-b border-[#E7E8EA] bg-white mix-blend-multiply">
      <div className="container mx-auto flex h-16 items-center justify-between gap-600 px-6 py-75">
        <div className="font-designer-18b text-text-strong shrink-0">
          <Link href="/">ZERO-ONE</Link>
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
               <HeaderDropdown.Provider
                  placeholder={<UserAvatar image={memberInfo.data?.content?.memberProfile?.profileImage?.resizedImages[0]?.resizedImageUrl || 'profile-default.svg'} />}
                  options={[
                     {
                        label: '내 정보 수정',
                        value: '/my-page',
                     },
                     {
                        label: '로그아웃',
                        value: 'logout',                        
                     }
                  ]}
                  onChange={async (value) => {
                     if (value === '/my-page') {
                        await router.push(value);
                     } else if (value === 'logout') {
                        await handleLogout();
                     }
                  }}
               />
               {!memberInfo.data?.isLogin && (
               <Link href="/login">
                  <Button color="primary" size="small">
                     로그인 / 회원가입
                  </Button>
               </Link>
               )}
            </div>
         </div>
      </header>
   );
}
