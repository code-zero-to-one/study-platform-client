import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '../../shared/ui/modal';

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // TODO : 실제 백엔드에서 제공하는 URL로 교체필요
  const NAVER_LOGIN_URL = 'http://43.203.249.13:9090/om/api/auth/naver';
  const KAKAO_LOGIN_URL =
    'https://kauth.kakao.com/oauth/authorize?client_id=3194796599a4325c0223d154319351a4&redirect_uri=http://43.203.249.13:9090/api/v1/auth/kakao/redirect-uri&response_type=code';
  // const KAKAO_LOGIN_URL = "https://kauth.kakao.com/oauth/authorize?client_id=3194796599a4325c0223d154319351a4&redirect_uri=http://192.168.219.220:8080/api/v1/auth/kakao/redirect-uri&response_type=code";
  const GOOGLE_LOGIN_URL =
    'https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=http://192.168.219.220:8080/api/v1/auth/google/redirect-uri&client_id=616205933420-b45d510q23togkaqo069j8igmsjhp9v0.apps.googleusercontent.com';

  return (
    <Modal.Provider open={open} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title className="w-full text-center font-['Pretendard'] text-[32px] leading-[49px] font-bold text-[#202020]">
                로그인
              </Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
            <div className="mt-2 text-center text-[20px] leading-[30px] font-medium text-[#252B37]">
              ZERO - ONE에 오신 것을 환영합니다.
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="mt-5 mb-5 flex flex-col gap-[12px]">
              <button
                className="flex h-[52px] items-center justify-center gap-3 rounded bg-[#03C75A] px-5"
                onClick={() => {
                  window.location.href = NAVER_LOGIN_URL;
                }}
              >
                <Image
                  src="/icons/naver-icon.svg"
                  alt="Naver"
                  className="h-5 w-5"
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#FFF]">
                  네이버 계정 로그인
                </span>
              </button>
              <button
                className="flex h-[52px] items-center justify-center gap-3 rounded border border-[#FEE500] bg-[#FFE812] px-5 text-black"
                onClick={() => {
                  window.location.href = KAKAO_LOGIN_URL;
                }}
              >
                <Image
                  src="/icons/kakao-icon.svg"
                  alt="Kakao"
                  className="h-5 w-5"
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  카카오 계정 로그인
                </span>
              </button>
              <button
                className="flex h-[52px] items-center justify-center gap-3 rounded border border-[#3D4148] bg-white px-5 text-black"
                onClick={() => {
                  window.location.href = GOOGLE_LOGIN_URL;
                }}
              >
                <Image
                  src="/icons/google-icon.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                <span className="text-center font-['Pretendard'] text-[15px] leading-[23px] font-bold text-[#181D27]">
                  Google 계정 로그인
                </span>
              </button>
            </div>
            <div className="mt-[20px] flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" id="agree" />
              <label htmlFor="agree">
                ZERO-ONE의 이용 약관과 개인정보 처리방침에 동의할게요.
              </label>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  );
}
