<<<<<<< HEAD
import { XIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from './api/useAuthMutation';
import SignupImageSelector from './SignupImageSelector';
import SignupNameInput from './SignupNameInput';

=======
<<<<<<< Updated upstream
import { XIcon } from "lucide-react";
import { useState, useRef } from "react";
import Button from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import SignupImageSelector from "./SignupImageSelector";
import SignupNameInput from "./SignupNameInput";
// import { useSignUpMutation } from "./api/useAuthMutation";

export default function SignupModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState("/profile-default.svg");
=======
import { XIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { setCookie } from '@/shared/api/cookie';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { getMemberId, getProfileImage } from './api/auth';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from './api/useAuthMutation';
import SignupImageSelector from './SignupImageSelector';
import SignupNameInput from './SignupNameInput';

>>>>>>> d9c47b5 (chore : 임시커밋)
export default function SignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [image, setImage] = useState('/images/profile-default.svg');
<<<<<<< HEAD
=======
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> d9c47b5 (chore : 임시커밋)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const signUp = useSignUpMutation();
  const uploadProfileImage = useUploadProfileImageMutation();

  // 이름 유효성 검사
  const validateName = (value: string) => {
    if (!/^[가-힣a-zA-Z]{2,10}$/.test(value)) {
      setError('이름에는 숫자나 특수문자를 사용할 수 없습니다.');
    } else {
      setError('');
    }
    setName(value);
  };

  // 이미지 업로드
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0])); // 이미지 미리보기
      setSelectedImage(e.target.files[0]);
    }
  };

  // 회원가입 요청 (작성완료 버튼 클릭시 회원가입 요청 & 이미지 업로드 비동기 실행
  // TODO : Response에는 generatedMemberId, URL이 들어옴 (URL 은 향후 S3 등 연동을 위한 인터페이스로 생각)
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
    // signUp.mutate({
    //   name: name,
    //   image: image,
    // });
    alert("작성완료"); // TODO : 토스트 메세지로 수정필요
=======
>>>>>>> d9c47b5 (chore : 임시커밋)

    // 회원가입 요청
    signUp.mutate(
      {
        name: name,
        imageExtension: 'jpg',
      },
      {
        // 회원가입 성공 시 프로필 이미지 업로드드
<<<<<<< HEAD
        onSuccess: (data) => {
          if (data && data.generatedMemberId) {
            const formData = new FormData();

            if (fileInputRef.current?.files?.[0]) {
              formData.append('image', fileInputRef.current.files[0]);

              uploadProfileImage.mutate({
                memberId: data.generatedMemberId,
=======
        onSuccess: async (data) => {
          if (data && data.content.generatedMemberId) {
            const formData = new FormData();

            if (selectedImage) {
              formData.append('image', selectedImage);

              uploadProfileImage.mutate({
                memberId: data.content.generatedMemberId,
>>>>>>> d9c47b5 (chore : 임시커밋)
                filename: 'profile.jpg',
                formData: formData,
              });
            }

<<<<<<< HEAD
            // 성공 후 홈페이지로 이동
            window.location.href = '/';
=======
            try {
              const data = await getMemberId();
              console.log('memberId', data.content);
              const profileImage = await getProfileImage(data.content);
              console.log('profileImage', profileImage);

              setCookie('memberId', data.content);
              console.log(
                'profileImage',
                profileImage.content.memberProfile.profileImage.resizedImages[0]
                  .resizedImageUrl,
              );
              setCookie(
                'profileImage',
                profileImage.content.memberProfile.profileImage
                  ?.resizedImages[0].resizedImageUrl,
              );
            } catch (error) {
              console.error('프로필 이미지 조회 실패:', error);
            }

            // 성공 후 홈페이지로 이동
            // window.location.href = "/";
>>>>>>> d9c47b5 (chore : 임시커밋)
          }
        },
        onError: (error) => {
          console.error('회원가입 실패:', error);
          // TODO: 실제 토스트 메시지 컴포넌트로 교체 필요
          alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> d9c47b5 (chore : 임시커밋)
  };

  return (
    <Modal.Provider open={open} onOpenChange={onClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>ZERO - ONE 시작하기</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col items-center gap-[12px]">
              <SignupImageSelector
                image={image}
                setImage={setImage}
                fileInputRef={fileInputRef}
                handleImageChange={handleImageChange}
              />
              <div className="mt-2 text-center text-lg font-semibold">
                서비스 이용을 위해
                <br />
                닉네임 대신 이름을 입력해주세요.
              </div>
              <SignupNameInput
                name={name}
                setName={validateName}
                error={error}
              />
              <Button
                color="primary"
                size="large"
                className="w-full"
                type="submit"
                onClick={handleSubmit}
              >
                작성 완료
              </Button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  );
}
