import { Modal } from '../../shared/ui/modal';
import { XIcon } from 'lucide-react';

export default function LoginModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    console.log(Modal);
    console.log(open);
    console.log(onClose);

  // TODO : 실제 백엔드에서 제공하는 URL로 교체필요요
  const NAVER_LOGIN_URL = "https://0to1-backend.com/api/auth/naver";
  const KAKAO_LOGIN_URL = "https://0to1-backend.com/api/auth/kakao";
  const GOOGLE_LOGIN_URL = "https://0to1-backend.com/api/auth/google";

  return (
    <Modal.Provider open={open} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>로그인</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-6">ZERO - ONE에 오신 것을 환영합니다.</div>
            <div className="flex flex-col gap-3">
              <button
                className="bg-[#03C75A] text-white py-2 rounded flex items-center justify-center gap-2"
                onClick={() => window.location.href = NAVER_LOGIN_URL}
              >
                <img src="/naver-icon.svg" alt="Naver" className="w-5 h-5" />
                네이버 계정 로그인
              </button>
              <button
                className="bg-[#FEE500] text-black py-2 rounded border flex items-center justify-center border-[#FEE500]"
                onClick={() => window.location.href = KAKAO_LOGIN_URL}
              >
                <img src="/kakao-icon.svg" alt="Kakao" className="w-5 h-5" />
                카카오 계정 로그인
              </button>
              <button
                className="bg-white text-black py-2 rounded border flex items-center justify-center gap-2"
                onClick={() => window.location.href = GOOGLE_LOGIN_URL}
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                Google 계정 로그인
              </button>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
              <input type="checkbox" id="agree" />
              <label htmlFor="agree">ZERO-ONE의 이용 약관과 개인정보 처리방침에 동의할게요.</label>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  )
}
