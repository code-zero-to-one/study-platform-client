import { XIcon } from 'lucide-react';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import ProfileEditCard from '../../widgets/my-page/Profile-edit-card';

interface Props {
  onSubmit: () => void;
}

export default function ProfileEditModal({ onSubmit }: Props) {
  return (
    <Modal.Provider>
      <Modal.Trigger className="w-full rounded-[8px] bg-[var(--color-fill-brand-default-default)] px-[8px] py-[12px] text-[16px] text-[var(--color-text-inverse)]">
        내 프로필 수정
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>내 프로필 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            {/* 기본 정보 */}
            <div className="flex flex-col gap-[24px]">
              <div className="flex">
                <div className="w-[112px] text-[14px] leading-[22px] font-[700]">
                  이미지 설정
                </div>
                <div className="h-[110px] w-[110px] rounded-full bg-red-100" />
              </div>
              <ProfileEditCard
                title="이름 확인"
                description="소셜 계정에서 불러온 닉네임 대신 이름을 입력해 주세요."
                required
              />
              <ProfileEditCard
                title="연락처"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                required
              />
              <ProfileEditCard
                title="Github"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                required={false}
              />
              <ProfileEditCard
                title="MBTI"
                description="자신의 성격 유형을 입력해 주세요."
                required={false}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <div className="flex w-full justify-center gap-[8px]">
                <Button color="secondary" className="w-[140px] cursor-pointer">
                  취소
                </Button>
                <Button className="w-[140px] cursor-pointer" onClick={onSubmit}>
                  수정 완료
                </Button>
              </div>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Provider>
  );
}
