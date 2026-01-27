'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { testLogin } from '@/features/auth/api/test-login';
import { setCookie } from '@/api/client/cookie';
import { useRouter } from 'next/navigation';

export default function LoginModal({
  openTrigger,
}: {
  openTrigger: ReactNode;
}) {
  const [state, setState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Test Login State
  const [testMemberId, setTestMemberId] = useState('1');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === 'true';

  const handleTestLogin = async () => {
    if (!testMemberId) return;
    
    setIsTestLoading(true);
    try {
      const { accessToken, memberId, profileImageUrl } = await testLogin(Number(testMemberId));
      
      setCookie('accessToken', accessToken);
      setCookie('memberId', memberId);
      if (profileImageUrl) {
        setCookie('socialImageURL', profileImageUrl);
      }
      
      setIsOpen(false);
      router.push('/home');
      router.refresh();
      
      // alert(`테스트 로그인 성공! (ID: ${memberId})`);
    } catch (error) {
      console.error('Test login failed:', error);
      alert('테스트 로그인 실패 (백엔드 실행 여부를 확인하세요)');
    } finally {
      setIsTestLoading(false);
    }
  };

  useEffect(() => {
    const origin = window.location.origin;
    setState(encodeURIComponent(origin));
  }, []);

  useEffect(() => {
    if (isOpen) {
      const attributionParams = getAttributionParams();

      sendGTMEvent({
        event: 'login_modal_open',
        ...attributionParams,
      });
    }
  }, [isOpen]);

  if (!state) {
    return <></>;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const KAKAO_LOGIN_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/v1/auth/kakao/redirect-uri&response_type=code&state=${state}`;
  const GOOGLE_LOGIN_URL = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=${API_BASE_URL}/api/v1/auth/google/redirect-uri&client_id=${GOOGLE_CLIENT_ID}&state=${state}`;

  const handleSocialLoginClick = (provider: 'kakao' | 'google') => {
    sendGTMEvent({
      event: 'social_login_click',
      provider,
    });
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{openTrigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="flex items-center justify-between">
            <Modal.Title />{' '}
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-300 flex h-[272px] flex-col items-center justify-center gap-150">
              <div className="font-designer-32b w-full text-center text-[#202020]">
                로그인
              </div>
              <div className="font-designer-20m text-text-default mt-2 text-center">
                ZERO - ONE에 오신 것을 환영합니다.
              </div>
            </div>
            <div className="flex flex-col gap-150 py-150">
              {/* <button
                className="flex h-[52px] px-5 justify-center items-center gap-150 rounded bg-[#03C75A]"
                onClick={() => { window.location.href = NAVER_LOGIN_URL }}
              >
                <Image src="/naver-icon.svg" alt="Naver" width={20} height={20} />
                <span className="text-[#FFF] text-center font-['Pretendard'] text-[15px] font-bold leading-[23px]">
                  네이버 계정 로그인
                </span>
              </button> */}
              <button
                className="rounded-50 flex h-[52px] items-center justify-center gap-150 border border-[#FEE500] bg-[#FFE812] px-5 text-black"
                onClick={() => {
                  handleSocialLoginClick('kakao');
                  window.location.href = KAKAO_LOGIN_URL;
                }}
              >
                <Image
                  src="/kakao-icon.svg"
                  alt="Naver"
                  width={20}
                  height={20}
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  카카오 계정 로그인
                </span>
              </button>
              <button
                className="rounded-50 flex h-[52px] items-center justify-center gap-150 border border-[#3D4148] bg-white px-5 text-black"
                onClick={() => {
                  handleSocialLoginClick('google');
                  window.location.href = GOOGLE_LOGIN_URL;
                }}
              >
                <Image
                  src="/google-icon.svg"
                  alt="Naver"
                  width={20}
                  height={20}
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  Google 계정 로그인
                </span>
              </button>
            </div>

            {/* Test Login Section (Dev Only) */}
            {isDev && (
              <div className="mt-2 border-t border-border-default pt-4 w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs font-bold text-text-subtle">🧪 개발자 테스트 로그인</span>
                </div>
                <div className="flex gap-2 justify-center h-[40px]">
                  <input
                    type="number"
                    value={testMemberId}
                    onChange={(e) => setTestMemberId(e.target.value)}
                    placeholder="Member ID"
                    className="w-full max-w-[120px] px-3 py-1 text-sm border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-fill-brand-default-default"
                    min="1"
                  />
                  <button
                    onClick={handleTestLogin}
                    disabled={isTestLoading}
                    className="px-4 py-1 text-sm bg-fill-neutral-default-default text-text-default font-medium rounded-md hover:bg-fill-neutral-default-hover disabled:opacity-50 transition-colors whitespace-nowrap border border-border-default"
                  >
                    {isTestLoading ? '...' : '로그인'}
                  </button>
                </div>
                <p className="text-[10px] text-text-subtlest text-center mt-2">
                  * 로컬/개발 환경에서만 보입니다 (Member ID 입력)
                </p>
              </div>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
