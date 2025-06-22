'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/ui/modal';

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    const origin = window.location.origin;
    setState(encodeURIComponent(origin));
  }, []);

  if (!state) {
    return <div>로딩중...</div>;
  }

  // TODO : 실제 백엔드에서 제공하는 URL로 교체필요
  const NAVER_LOGIN_URL = '';
  const KAKAO_LOGIN_URL = `https://kauth.kakao.com/oauth/authorize?client_id=3194796599a4325c0223d154319351a4&redirect_uri=https://test-api.zeroone.it.kr/api/v1/auth/kakao/redirect-uri&response_type=code&state=${state}`;
  const GOOGLE_LOGIN_URL = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=https://test-api.zeroone.it.kr:9090/api/v1/auth/google/redirect-uri&client_id=616205933420-b45d510q23togkaqo069j8igmsjhp9v0.apps.googleusercontent.com&state=${state}`;

  return (
    <Modal.Root open={open} onOpenChange={onClose}>
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
                className="flex h-[52px] px-5 justify-center items-center gap-3 rounded bg-[#03C75A]"
                onClick={() => { window.location.href = NAVER_LOGIN_URL }}
              >
                <Image src="/naver-icon.svg" alt="Naver" width={20} height={20} />
                <span className="text-[#FFF] text-center font-['Pretendard'] text-[15px] font-bold leading-[23px]">
                  네이버 계정 로그인
                </span>
              </button> */}
              <button
                className="rounded-50 flex h-[52px] items-center justify-center gap-3 border border-[#FEE500] bg-[#FFE812] px-5 text-black"
                onClick={() => {
                  window.location.href = KAKAO_LOGIN_URL;
                }}
              >
                <Image
                  src="/kakao-icon.svg"
                  alt="Naver"
                  width={20}
                  height={20}
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  카카오 계정 로그인
                </span>
              </button>
              <button
                className="rounded-50 flex h-[52px] items-center justify-center gap-3 border border-[#3D4148] bg-white px-5 text-black"
                onClick={() => {
                  window.location.href = GOOGLE_LOGIN_URL;
                }}
              >
                <Image
                  src="/google-icon.svg"
                  alt="Naver"
                  width={20}
                  height={20}
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  Google 계정 로그인
                </span>
              </button>
            </div>
            <div className="font-designer-14m text-text-subtle mb-250 flex items-center gap-75">
              <input type="checkbox" id="agree" />
              <label htmlFor="agree">
                ZERO-ONE의 이용 약관과 개인정보 처리방침에 동의할게요.
              </label>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
