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
  useGetStudySubjects,
  useUpdateProfileInfo,
} from '@/hooks/profile';
import { useEffect, useState } from 'react';
import { useGetTechStacks } from '@/hooks/tech-stacks';
import ChipDropdown from '@/shared/ui/chip-dropdown';

export default function ProfileInfoEditModal() {
  const { data: profile } = useGetProfile({ memberId: '1' });
  const { mutate: updateProfileInfo } = useUpdateProfileInfo({
    memberId: '1',
  });
  const { data: techStacks } = useGetTechStacks();
  const { data: availableStudyTimes } = useGetAvailableStudyTimes();
  const { data: studySubjects } = useGetStudySubjects();
  const [selfIntroduction, setSelfIntroduction] = useState(
    profile?.memberInfo.selfIntroduction,
  );
  const [studyPlan, setStudyPlan] = useState(profile?.memberInfo.studyPlan);
  const [preferredStudySubjectId, setPreferredStudySubjectId] = useState(
    profile?.memberInfo.preferredStudySubjectId,
  );
  const [selectedAvailableStudyTimeIds, setSelectedAvailableStudyTimeIds] =
    useState(
      profile?.memberInfo.availableStudyTimes.map(
        (availableStudyTime) => availableStudyTime.id,
      ),
    );
  const [techStackIds, setTechStackIds] = useState(
    profile?.memberInfo.techStacks.map((techStack) => techStack.techStackId),
  );

  const handleSubmit = () => {
    const profileInfoData = {
      selfIntroduction,
      studyPlan,
      preferredStudySubjectId,
      availableStudyTimeIds: selectedAvailableStudyTimeIds,
      techStackIds,
    };

    // undefined가 아닌 값만 필터링
    const filteredData = Object.fromEntries(
      Object.entries(profileInfoData).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    updateProfileInfo(filteredData);
  };

  useEffect(() => {
    setSelectedAvailableStudyTimeIds(
      profile?.memberInfo.availableStudyTimes.map(
        (availableStudyTime) => availableStudyTime.id,
      ),
    );
    setTechStackIds(
      profile?.memberInfo.techStacks.map((techStack) => techStack.techStackId),
    );
    setPreferredStudySubjectId(profile?.memberInfo.preferredStudySubjectId);
    setStudyPlan(profile?.memberInfo.studyPlan);
    setSelfIntroduction(profile?.memberInfo.selfIntroduction);
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
                    defaultValue={profile?.memberInfo?.studyPlan}
                  />
                </ProfileInfoEditCard>
                <ProfileInfoEditCard title="선호하는 스터디 주제" isRequired>
                  <div className="flex flex-col gap-[6px]">
                    <Dropdown
                      defaultValue={
                        studySubjects?.find(
                          (studySubject) =>
                            studySubject?.studySubjectId ===
                            profile?.memberInfo?.preferredStudySubjectId,
                        ).studySubjectId
                      }
                      options={studySubjects?.map((studySubject) => ({
                        label: studySubject.studySubjectName,
                        value: studySubject.studySubjectId,
                      }))}
                      placeholder="선택하세요"
                      onSelect={(value) => setPreferredStudySubjectId(value)}
                    />
                  </div>
                </ProfileInfoEditCard>
                <ProfileInfoEditCard title="가능 시간대" isRequired>
                  <div className="flex flex-wrap gap-[8px]">
                    {availableStudyTimes?.map((availableStudyTime) => (
                      <Chip
                        id={availableStudyTime.availableTimeId}
                        key={availableStudyTime.availableTimeId}
                        text={availableStudyTime.display}
                        isActive={selectedAvailableStudyTimeIds?.includes(
                          availableStudyTime.availableTimeId,
                        )}
                        onClick={(id) => {
                          if (selectedAvailableStudyTimeIds?.includes(id)) {
                            setSelectedAvailableStudyTimeIds(
                              selectedAvailableStudyTimeIds?.filter(
                                (availableStudyTimeId) =>
                                  availableStudyTimeId !== id,
                              ),
                            );
                          } else {
                            setSelectedAvailableStudyTimeIds([
                              ...selectedAvailableStudyTimeIds,
                              id,
                            ]);
                          }
                        }}
                      />
                    ))}
                  </div>
                </ProfileInfoEditCard>

                <ProfileInfoEditCard title="사용 가능한 기술 스택" isRequired>
                  <ChipDropdown
                    options={techStacks?.map((techStack) => ({
                      label: techStack.techStackName,
                      value: techStack.teckStackId.toString(),
                    }))}
                    defaultValueIds={techStackIds}
                    onChange={(value) => {
                      setTechStackIds(value);
                    }}
                  />
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
                  disabled={
                    !selfIntroduction ||
                    !studyPlan ||
                    !preferredStudySubjectId ||
                    selectedAvailableStudyTimeIds?.length === 0 ||
                    techStackIds?.length === 0
                  }
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
