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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const signUp = useSignUpMutation();

  // 이름 유효성 검사
  const validateName = (value: string) => {
    if (!/^[가-힣a-zA-Z]{2,10}$/.test(value)) {
      setError("이름에는 숫자나 특수문자를 사용할 수 없습니다.");
    } else {
      setError("");
    }
    setName(value);
  };

  // 이미지 업로드
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // 작성완료 버튼
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // signUp.mutate({
    //   name: name,
    //   image: image,
    // });
    alert("작성완료"); // TODO : 토스트 메세지로 수정필요
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
              <div className="text-center text-lg font-semibold mt-2">
                서비스 이용을 위해<br />
                닉네임 대신 이름을 입력해주세요.
              </div>
              <SignupNameInput
                name={name}
                setName={validateName}
                error={error}
              />
              <Button
                color="primary" size="large" className="w-full"
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