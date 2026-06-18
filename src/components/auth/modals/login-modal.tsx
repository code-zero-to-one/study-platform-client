'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { testLogin } from '@/api/endpoints/auth/test-login';
import { Modal } from '@/components/common/ui/modal';
import { resetClientDerivedAuthStateWithQueryCache } from '@/features/auth/model/client-auth-cleanup';
import { writeExistingMemberSession } from '@/features/auth/model/client-auth-session';
import { useToastStore } from '@/stores/use-toast-store';
import { getAttributionParams } from '@/utils/attribution-tracker';

const handleSocialLoginClick = (provider: 'kakao' | 'google') => {
  sendGTMEvent({
    event: 'social_login_click',
    provider,
  });
};

// origin은 클릭 시점(클라이언트)에 읽어 OAuth URL 구성 — 컴포넌트 상태 비참조 → 모듈 스코프.
const redirectToOAuth = (provider: 'kakao' | 'google') => {
  handleSocialLoginClick(provider);

  const state = encodeURIComponent(window.location.origin);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (provider === 'kakao') {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/v1/auth/kakao/redirect-uri&response_type=code&state=${state}`;

    return;
  }

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=${API_BASE_URL}/api/v1/auth/google/redirect-uri&client_id=${GOOGLE_CLIENT_ID}&state=${state}`;
};

export default function LoginModal({
  openTrigger,
}: {
  openTrigger: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  // Test Login State
  const [testMemberId, setTestMemberId] = useState('1');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === 'true';

  const handleTestLogin = async () => {
    if (!testMemberId) return;

    setIsTestLoading(true);
    try {
      const { accessToken, memberId, profileImageUrl } = await testLogin(
        Number(testMemberId),
      );

      resetClientDerivedAuthStateWithQueryCache();
      const hasSavedExistingMemberSession = writeExistingMemberSession({
        accessToken,
        memberId,
        profileImageUrl,
      });

      if (!hasSavedExistingMemberSession) {
        showToast(
          '로그인 세션 저장에 실패했습니다. 다시 시도해주세요.',
          'error',
        );

        return;
      }

      setIsOpen(false);
      router.push('/home');
      router.refresh();

      // alert(`테스트 로그인 성공! (ID: ${memberId})`);
    } catch (error) {
      console.error('Test login failed:', error);
      showToast('테스트 로그인 실패 (백엔드 실행 여부를 확인하세요)', 'error');
    } finally {
      setIsTestLoading(false);
    }
  };

  // 모달 열릴 때 분석 이벤트 전송 — effect 대신 open 핸들러에서 처리.
  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    if (next) {
      const attributionParams = getAttributionParams();

      sendGTMEvent({
        event: 'login_modal_open',
        ...attributionParams,
      });
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
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
                type="button"
                className="rounded-50 flex h-[52px] items-center justify-center gap-150 border border-[#FEE500] bg-[#FFE812] px-5 text-black"
                onClick={() => redirectToOAuth('kakao')}
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
                type="button"
                className="rounded-50 flex h-[52px] items-center justify-center gap-150 border border-[#3D4148] bg-white px-5 text-black"
                onClick={() => redirectToOAuth('google')}
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
              <div className="border-border-default mt-2 w-full border-t pt-4">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="text-text-subtle text-xs font-bold">
                    🧪 개발자 테스트 로그인
                  </span>
                </div>
                <div className="flex h-[40px] justify-center gap-2">
                  <input
                    type="number"
                    aria-label="테스트 Member ID"
                    value={testMemberId}
                    onChange={(e) => setTestMemberId(e.target.value)}
                    placeholder="Member ID"
                    className="border-border-default focus:ring-fill-brand-default-default w-full max-w-[120px] rounded-md border px-3 py-1 text-sm focus:ring-2 focus:outline-none"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={handleTestLogin}
                    disabled={isTestLoading}
                    className="bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover border-border-default rounded-md border px-4 py-1 text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                  >
                    {isTestLoading ? '...' : '로그인'}
                  </button>
                </div>
                <p className="text-text-subtlest mt-2 text-center text-[10px]">
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
