import { XIcon } from 'lucide-react';
import Button from '@/shared/ui/button';
import Chip from '@/shared/ui/chip';
import Dropdown from '@/shared/ui/dropdown';
import { Modal } from '@/shared/ui/modal';
import ProfileInfoEditInput from './profileinfo-edit-input';
import ProfileInfoEditCard from '../../widgets/my-page/Profileinfo-edit-card';
import {
  useGetAvailableStudyTimes,
  useGetProfile,
  useUpdateProfileInfo,
} from '@/hooks/profile';
import { useEffect, useState } from 'react';
import { useGetTechStacks } from '@/hooks/tech-stacks';

export default function ProfileInfoEditModal() {
  const { data: profile } = useGetProfile({ memberId: '1' });
  const { mutate: updateProfileInfo } = useUpdateProfileInfo({
    memberId: '1',
  });
  const { data: techStacks } = useGetTechStacks();
  const { data: availableStudyTimes } = useGetAvailableStudyTimes();
  const [selfIntroduction, setSelfIntroduction] = useState(
    profile?.memberInfo.selfIntroduction,
  );
  const [studyPlan, setStudyPlan] = useState(profile?.memberInfo.studyPlan);
  const [preferredStudySubjectId, setPreferredStudySubjectId] = useState(
    profile?.memberInfo.preferredStudySubjectId,
  );
  const [selectedAvailableStudyTimeIds, setSelectedAvailableStudyTimeIds] =
    useState(profile?.memberInfo.availableStudyTimes);
  const [techStackIds, setTechStackIds] = useState(
    profile?.memberInfo.techStacks,
  );
  // const [selectedTechStackIds, setSelectedTechStackIds] = useState(
  //   profile?.memberInfo.techStacks,
  // );

  const handleSubmit = () => {
    updateProfileInfo({
      selfIntroduction,
      studyPlan,
      preferredStudySubjectId,
      availableStudyTimeIds: selectedAvailableStudyTimeIds,
      techStackIds,
    });
  };

  useEffect(() => {
    setSelfIntroduction(profile?.memberInfo.selfIntroduction);
    setStudyPlan(profile?.memberInfo.studyPlan);
    setPreferredStudySubjectId(profile?.memberInfo.preferredStudySubjectId);
    setSelectedAvailableStudyTimeIds(profile?.memberInfo.availableStudyTimes);
    setTechStackIds(profile?.memberInfo.techStacks);
  }, [profile]);

  return (
    <Modal.Provider>
      <Modal.Trigger>
        <div className="cursor-pointer rounded-[3px] border border-[var(--color-button-secondary-border)] bg-[var(--color-button-secondary-background)] px-[12px] py-[6px] text-[14px] font-[500]">
          편집
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <div className="flex items-center justify-between">
              <Modal.Title>내 정보 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-[24px]">
                <ProfileInfoEditCard title="자기소개">
                  <ProfileInfoEditInput
                    defaultValue={profile?.memberInfo.selfIntroduction}
                    placeholder="입력하세요."
                    guideText="간단한 자기소개를 입력해 주세요."
                    maxLength={30}
                    onChange={(value) => setSelfIntroduction(value)}
                  />
                </ProfileInfoEditCard>
                <ProfileInfoEditCard title="공부 주제 및 계획" isRequired>
                  <ProfileInfoEditInput
                    placeholder="입력하세요."
                    guideText="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
                    maxLength={30}
                    onChange={(value) => setStudyPlan(value)}
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
                      onSelect={(value) => setPreferredStudySubjectId(value)}
                    />
                    <div className="flex justify-between text-[13px] leading-[20px] font-[400] text-[var(--color-text-subtlest)]">
                      <div>자신의 성격 유형을 입력해 주세요.</div>
                      <div>3/30</div>
                    </div>
                  </div>
                </ProfileInfoEditCard>
                <ProfileInfoEditCard title="가능 시간대" isRequired>
                  <div className="flex flex-wrap gap-[8px]">
                    {availableStudyTimes?.map((availableStudyTime) => (
                      <Chip
                        key={availableStudyTime.availableTimeId}
                        text={availableStudyTime.display}
                        isActive={selectedAvailableStudyTimeIds?.includes(
                          availableStudyTime.availableTimeId,
                        )}
                      />
                    ))}
                  </div>
                </ProfileInfoEditCard>

                <ProfileInfoEditCard title="사용 가능한 기술 스택" isRequired>
                  <div className="flex flex-wrap gap-[8px]">
                    {techStacks?.map((techStack) => (
                      <Chip
                        key={techStack.teckStackId}
                        text={techStack.techStackName}
                        isActive={techStackIds?.includes(techStack.teckStackId)}
                        onClose={() => {
                          if (techStackIds?.includes(techStack.teckStackId)) {
                            setTechStackIds(
                              techStackIds?.filter(
                                (id) => id !== techStack.teckStackId,
                              ),
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </ProfileInfoEditCard>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <div className="flex w-full justify-center gap-[8px]">
                <Button color="secondary" className="w-[140px] cursor-pointer">
                  취소
                </Button>
                <Button
                  className="w-[140px] cursor-pointer"
                  onClick={handleSubmit}
                >
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
