import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/features/auth/model/use-auth-mutation';
import SignupImageSelector from '@/features/auth/ui/sign-up-image-selector';
import { hashValue } from '@/shared/lib/hash';
import { getCookie, setCookie } from '@/shared/tanstack-query/cookie';
import { getAttributionParams } from '@/shared/lib/attribution-tracker';
import Button from '@/shared/ui/button';
import { BaseInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';

export default function SignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [checked, setChecked] = useState<boolean>(false);
  const [image, setImage] = useState(getCookie('socialImageURL') || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const signUp = useSignUpMutation();
  const uploadProfileImage = useUploadProfileImageMutation();

  useEffect(() => {
    if (open) {
      const attributionParams = getAttributionParams();
      
      sendGTMEvent({
        event: 'signup_modal_open',
        ...attributionParams,
      });
    }
  }, [open]);

  const isValidName = /^[가-힣a-zA-Z]{2,10}$/.test(name);

  // 이미지 업로드
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // 회원가입 요청 (작성완료 버튼 클릭시 회원가입 요청 & 이미지 업로드 비동기 실행
  // TODO : Response에는 generatedMemberId, URL이 들어옴 (URL 은 향후 S3 등 연동을 위한 인터페이스로 생각)
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 회원가입 요청
    signUp.mutate(
      {
        name: name,
        imageExtension: 'jpg',
      },
      {
        // 회원가입 성공 시 프로필 이미지 업로드
        onSuccess: (data) => {
          const memberId = data.content.generatedMemberId;

          if (data && memberId) {
            setCookie('memberId', memberId);

            // 회원가입 GA 이벤트 전송
            const attributionParams = getAttributionParams();
            
            sendGTMEvent({
              event: 'custom_member_join',
              dl_timestamp: new Date().toISOString(),
              dl_member_id: hashValue(memberId),
              ...attributionParams,
            });

            const formData = new FormData();

            if (fileInputRef.current?.files?.[0]) {
              // 스프링서버에서 받는 파라미터 이름이 file
              formData.append('file', fileInputRef.current.files[0]);

              uploadProfileImage.mutate({
                memberId: Number(data.content.generatedMemberId),
                filename: `profile-formdata-${data.content.generatedMemberId}`,
                file: formData,
              });
            }

            // 성공 후 홈페이지로 이동
            window.location.href = '/home';
          }
        },
        onError: (error) => {
          console.error('회원가입 실패:', error);
          // TODO: 실제 토스트 메시지 컴포넌트로 교체 필요
          alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small">
          <Modal.Header className="border-border-default border-b">
            <div className="flex items-center justify-between">
              <Modal.Title>ZERO - ONE 시작하기</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body className="px-400 py-500">
            <div className="flex flex-col items-center gap-400">
              <SignupImageSelector
                image={image}
                setImage={setImage}
                fileInputRef={fileInputRef}
                handleImageChange={handleImageChange}
              />
              <div className="font-designer-24b text-text-default mt-2 text-center">
                서비스 이용을 위해 이름을 입력해주세요.
              </div>
              <div className="flex w-full flex-col items-center gap-200">
                <div className="flex w-full flex-col gap-75">
                  <BaseInput
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const filteredValue = value
                        .replace(/[^a-zA-Zㄱ-힣]/g, '')
                        .slice(0, 10)
                        .trim();
                      setName(filteredValue);
                    }}
                    placeholder="홍길동"
                    className={`w-full`}
                    color={
                      isValidName || name.length === 0 ? 'default' : 'error'
                    }
                    maxLength={10}
                  />
                  <div
                    className={`font-designer-13r ${isValidName || name.length === 0 ? 'text-text-subtlest' : 'text-text-error'}`}
                  >
                    {isValidName || name.length === 0
                      ? '신뢰 있는 매칭을 위해 실명을 사용해주세요. (예: 홍길동 )'
                      : '이름에는 숫자나 특수문자를 사용할 수 없습니다. 두 글자 이상 입력해주세요.'}
                  </div>
                </div>
                <div className="flex w-full gap-75">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <label
                    htmlFor="agree"
                    className="font-designer-14m text-text-subtle text-sm"
                  >
                    ZERO-ONE의 이용 약관과 개인정보 처리방침에 동의할게요.
                  </label>
                </div>
              </div>
              <Button
                color="primary"
                size="large"
                className="w-full"
                type="submit"
                onClick={handleSubmit}
                disabled={!isValidName || !checked || signUp.isPending}
              >
                가입 완료
              </Button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
