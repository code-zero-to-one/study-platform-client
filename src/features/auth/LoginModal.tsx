import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '../../shared/ui/modal';

export default function LoginModal({ open, onClose }: { open: boolean, onClose: () => void }) {

  // TODO : 실제 백엔드에서 제공하는 URL로 교체필요
  const NAVER_LOGIN_URL = "http://43.203.249.13:9090/om/api/auth/naver";
  const KAKAO_LOGIN_URL = "https://kauth.kakao.com/oauth/authorize?client_id=3194796599a4325c0223d154319351a4&redirect_uri=http://43.203.249.13:9090/api/v1/auth/kakao/redirect-uri&response_type=code";
  // const KAKAO_LOGIN_URL = "https://kauth.kakao.com/oauth/authorize?client_id=3194796599a4325c0223d154319351a4&redirect_uri=http://192.168.219.220:8080/api/v1/auth/kakao/redirect-uri&response_type=code";
  const GOOGLE_LOGIN_URL = "https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=http://192.168.219.220:8080/api/v1/auth/google/redirect-uri&client_id=616205933420-b45d510q23togkaqo069j8igmsjhp9v0.apps.googleusercontent.com";

  return (
    <Modal.Provider open={open} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title className="text-[#202020] text-center font-bold text-[32px] leading-[49px] font-['Pretendard'] w-full">
                로그인
              </Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
            <div className="text-center mt-2 text-[#252B37] text-[20px] font-medium leading-[30px]">
              ZERO - ONE에 오신 것을 환영합니다.
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-[12px] mt-5 mb-5">
              <button
                className="flex h-[52px] px-5 justify-center items-center gap-3 rounded bg-[#03C75A]"
                onClick={() => {
                  window.location.href = NAVER_LOGIN_URL;
                }}
              >
                <Image src="/icons/naver-icon.svg" alt="Naver" className="w-5 h-5" />
                <span className="text-[#FFF] text-center font-['Pretendard'] text-[15px] font-bold leading-[23px]">
                  네이버 계정 로그인
                </span>
              </button>
              <button
                className="flex h-[52px] px-5 justify-center items-center gap-3 rounded bg-[#FFE812] text-black border border-[#FEE500]"
                onClick={() => {
                  window.location.href = KAKAO_LOGIN_URL;
                }}
              >
                <Image src="/icons/kakao-icon.svg" alt="Kakao" className="w-5 h-5" />
                <span className="text-[#181D27] text-center font-['Pretendard'] text-[15px] font-bold leading-[23px]">
                  카카오 계정 로그인
                </span>
              </button>
              <button
                className="flex h-[52px] px-5 justify-center items-center gap-3 rounded bg-white text-black border border-[#3D4148]"
                onClick={() => {
                  window.location.href = GOOGLE_LOGIN_URL;
                }}
              >
                <Image src="/icons/google-icon.svg" alt="Google" className="w-5 h-5" />
                <span className="text-[#181D27] text-center font-['Pretendard'] text-[15px] font-bold leading-[23px]">
                  Google 계정 로그인
                </span>
              </button>
            </div>
            <div className="mt-[20px] text-xs text-gray-500 flex items-center gap-2">
              <input type="checkbox" id="agree" />
              <label htmlFor="agree">ZERO-ONE의 이용 약관과 개인정보 처리방침에 동의할게요.</label>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  )
}
