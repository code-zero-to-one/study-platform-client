import { XIcon } from 'lucide-react';
import Button from '@/shared/ui/button';
import Chip from '@/shared/ui/chip';
import Dropdown from '@/shared/ui/dropdown';
import { Modal } from '@/shared/ui/modal';
import ProfileInfoEditInput from './profileinfo-edit-input';
import ProfileInfoEditCard from '../../widgets/my-page/Profileinfo-edit-card';

interface Props {
  onSubmit: () => void;
}

export default function ProfileInfoEditModal({ onSubmit }: Props) {
  return (
    <Modal.Provider>
      <Modal.Trigger>
        <div className="cursor-pointer rounded-[3px] border border-[var(--color-button-secondary-border)] bg-[var(--color-button-secondary-background)] px-150 py-75 text-[14px] font-[500]">
          편집
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>내 정보 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-300">
              <ProfileInfoEditCard title="자기소개">
                <ProfileInfoEditInput
                  placeholder="입력하세요."
                  guideText="간단한 자기소개를 입력해 주세요."
                  maxLength={30}
                />
              </ProfileInfoEditCard>
              <ProfileInfoEditCard title="공부 주제 및 계획" isRequired>
                <ProfileInfoEditInput
                  placeholder="입력하세요."
                  guideText="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
                  maxLength={30}
                />
              </ProfileInfoEditCard>
              <ProfileInfoEditCard title="선호하는 스터디 주제" isRequired>
                <div className="flex flex-col gap-[6px]">
                  <Dropdown
                    defaultValue="cs-basic"
                    options={[
                      {
                        label: 'CS 기본기',
                        value: 'cs-basic',
                      },
                      {
                        label: 'CS 심화',
                        value: 'cs-advanced',
                      },
                    ]}
                    placeholder="선택하세요"
                    onSelect={() => {}}
                  />
                  <div className="flex justify-between text-[13px] leading-[20px] font-[400] text-[var(--color-text-subtlest)]">
                    <div>자신의 성격 유형을 입력해 주세요.</div>
                    <div>3/30</div>
                  </div>
                </div>
              </ProfileInfoEditCard>
              <ProfileInfoEditCard title="가능 시간대" isRequired>
                <div className="flex flex-wrap gap-[8px]">
                  <Chip text="오전 (09:00~12:00)" isActive />
                  <Chip text="점심 (12:00~13:00)" />
                  <Chip text="오후 (13:00~18:00)" isActive />
                  <Chip text="저녁 (18:00~21:00)" />
                  <Chip text="심야 (21:00~23:00)" />
                  <Chip text="시간 협의 가능" />
                </div>
              </ProfileInfoEditCard>

              <ProfileInfoEditCard title="사용 가능한 기술 스택" isRequired>
                <div className="flex flex-wrap gap-[8px]">
                  <Chip text="HTML/CSS" isActive />
                  <Chip text="JavaScript" />
                  <Chip text="React" isActive />
                  <Chip text="Express" />
                  <Chip text="Django" />
                  <Chip text="Java" />
                  <Chip text="Git/GitHub" />
                  <Chip text="MySQL" />
                </div>
              </ProfileInfoEditCard>
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
