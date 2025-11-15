'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { Modal } from '../../../shared/ui/modal';

export default function LoginModal({
  openTrigger,
}: {
  openTrigger: ReactNode;
}) {
  const [state, setState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setState(encodeURIComponent(origin));
  }, []);

  useEffect(() => {
    if (isOpen) {
      sendGTMEvent({
        event: 'login_modal_open',
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
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
