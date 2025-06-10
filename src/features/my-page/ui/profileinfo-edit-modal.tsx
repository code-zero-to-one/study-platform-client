'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/shared/ui/button';
import Dropdown from '@/shared/ui/dropdown';
import MultiDropdown from '@/shared/ui/dropdown/multi';
import { Modal } from '@/shared/ui/modal';
import { ToggleButton } from '@/shared/ui/toggle/button';
import EditInput from '../../../shared/ui/input/edit';
import ProfileInfoEditCard from '../../../widgets/my-page/Profileinfo-edit-card';

interface Props {
  onSubmit: () => void;
}

const TIME_SLOT_OPTIONS = [
  { key: 'morning', label: '오전 (09:00~12:00)' },
  { key: 'lunch', label: '점심 (12:00~13:00)' },
  { key: 'afternoon', label: '오후 (13:00~18:00)' },
  { key: 'evening', label: '저녁 (18:00~21:00)' },
  { key: 'night', label: '심야 (21:00~23:00)' },
  { key: 'flexible', label: '시간 협의 가능' },
];

const skillOptions = [
  { label: 'HTML/CSS', value: 'html' },
  { label: 'JavaScript', value: 'js' },
  { label: 'React', value: 'react' },
  { label: 'Django', value: 'django' },
  { label: 'MySQL', value: 'mysql' },
];

export default function ProfileInfoEditModal({ onSubmit }: Props) {

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleTimeSlot = (key: string) => {
    setAvailableTimeSlots((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  return (
    <Modal.Provider>
      <Modal.Trigger>
        <div className="cursor-pointer rounded-[3px] border border-[var(--color-button-secondary-border)] bg-[var(--color-button-secondary-background)] px-150 py-75 text-[14px] font-[500]">
          편집
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size='medium'>
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
                <EditInput
                  placeholder="입력하세요."
                  guideText="간단한 자기소개를 입력해 주세요."
                  maxLength={30}
                />
              </ProfileInfoEditCard>
              <ProfileInfoEditCard title="공부 주제 및 계획" isRequired>
                <EditInput
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
                    onSelect={() => { }}
                  />
                  <div className="flex justify-between text-[13px] leading-[20px] font-[400] text-[var(--color-text-subtlest)]">
                    <div>자신의 성격 유형을 입력해 주세요.</div>
                    <div>3/30</div>
                  </div>
                </div>
              </ProfileInfoEditCard>
              <ProfileInfoEditCard title="가능 시간대" isRequired>
                <div className="grid grid-cols-4 gap-100">
                  {TIME_SLOT_OPTIONS.map(({ key, label }) => (
                    <ToggleButton.Provider
                      key={key}
                      pressed={availableTimeSlots.includes(key)}
                      onPressedChange={() => toggleTimeSlot(key)}
                    >
                      {label}
                    </ToggleButton.Provider>
                  ))}
                </div>
              </ProfileInfoEditCard>

              <ProfileInfoEditCard title="사용 가능한 기술 스택" isRequired>
                <MultiDropdown
                  options={skillOptions}
                  selected={selectedSkills}
                  onChange={setSelectedSkills}
                  placeholder="기술을 선택해주세요"
                />
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
