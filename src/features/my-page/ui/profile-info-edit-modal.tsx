'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { MemberInfo } from '@/entities/user/api/types';
import { hashValue } from '@/shared/lib/hash';
import Button from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form/form-field';
import { Modal } from '@/shared/ui/modal';
import { UpdateUserProfileInfoRequest } from '../api/types';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useTechStacksQuery,
  useUpdateUserProfileInfoMutation,
} from '../model/use-update-user-profile-mutation';

interface Props {
  memberId: number;
  memberInfo: MemberInfo;
}

export default function ProfileInfoEditModal({ memberId, memberInfo }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger onClick={() => setIsOpen(true)}>
        <div className="rounded-75 bg-fill-neutral-default-default font-designer-13b text-text-default cursor-pointer px-150 py-75">
          편집
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header className="border-border-default border-b">
            <div className="flex items-center justify-between">
              <Modal.Title>내 정보 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <ProfileInfoEditForm
            memberId={memberId}
            memberInfo={memberInfo}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ProfileInfoEditForm({
  memberId,
  memberInfo,
  onClose,
}: {
  memberId: number;
  memberInfo: MemberInfo;
  onClose: () => void;
}) {
  const [infoForm, setInfoForm] = useState<UpdateUserProfileInfoRequest>({
    selfIntroduction: memberInfo.selfIntroduction ?? '',
    studyPlan: memberInfo.studyPlan ?? '',
    preferredStudySubjectId: memberInfo.preferredStudySubject?.studySubjectId,
    availableStudyTimeIds: (memberInfo.availableStudyTimes ?? []).map(
      (time) => time?.id ?? 0,
    ),
    techStackIds: (memberInfo.techStacks ?? []).map(
      (tech) => tech?.techStackId ?? 0,
    ),
  });

  const { mutate: updateProfileInfo } =
    useUpdateUserProfileInfoMutation(memberId);

  const handleSubmit = () => {
    const formData: UpdateUserProfileInfoRequest = {
      selfIntroduction: infoForm.selfIntroduction,
      studyPlan: infoForm.studyPlan,
      preferredStudySubjectId: infoForm.preferredStudySubjectId,
      availableStudyTimeIds: infoForm.availableStudyTimeIds
        .filter((id) => id)
        .map((id) => Number(id)),
      techStackIds: infoForm.techStackIds
        .filter((id) => id)
        .map((id) => Number(id)),
    };

    updateProfileInfo(formData);
  };

  const { data: availableStudyTimes } = useAvailableStudyTimesQuery();
  const { data: studySubjects } = useStudySubjectsQuery();
  const { data: techStacks } = useTechStacksQuery();

  return (
    <>
      <Modal.Body>
        <div className="flex flex-col gap-300">
          <FormField
            label="자기소개"
            type="textarea"
            description="간단한 자기소개를 입력해 주세요."
            value={infoForm.selfIntroduction}
            onChange={(value) =>
              setInfoForm((prev) => ({
                ...prev,
                selfIntroduction: value,
              }))
            }
            direction="vertical"
            maxLength={500}
          />
          <FormField
            label="공부 주제 및 계획"
            type="textarea"
            description="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
            value={infoForm.studyPlan}
            onChange={(value) =>
              setInfoForm((prev) => ({
                ...prev,
                studyPlan: value,
              }))
            }
            direction="vertical"
            maxLength={500}
            required
          />
          <FormField
            label="선호하는 스터디 주제"
            type="singledropdown"
            description="관심있는 스터디 유형을 선택해주세요."
            value={infoForm.preferredStudySubjectId}
            onChange={(value) =>
              setInfoForm((prev) => ({
                ...prev,
                preferredStudySubjectId: value,
              }))
            }
            direction="vertical"
            required
            options={
              studySubjects?.map(({ studySubjectId, name }) => ({
                value: studySubjectId,
                label: name,
              })) ?? []
            }
          />
          <FormField
            label="가능 시간대"
            type="togglegroup"
            value={infoForm.availableStudyTimeIds.map(String)}
            direction="vertical"
            options={
              availableStudyTimes?.map(({ availableTimeId, display }) => ({
                value: availableTimeId.toString(),
                label: display,
              })) ?? []
            }
            onChange={(availableStudyTimeIds) =>
              setInfoForm((prev) => ({
                ...prev,
                availableStudyTimeIds: availableStudyTimeIds.map(Number),
              }))
            }
            required
          />
          <FormField
            label="사용 가능한 기술 스택"
            type="multidropdown"
            description="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
            value={infoForm.techStackIds}
            onChange={(value) =>
              setInfoForm((prev) => ({
                ...prev,
                techStackIds: value,
              }))
            }
            direction="vertical"
            required
            options={(techStacks ?? []).map(
              ({ techStackId, techStackName }) => ({
                value: techStackId,
                label: techStackName,
              }),
            )}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>

          <Button
            color="primary"
            size="large"
            onClick={() => {
              handleSubmit();

              const selectedSkillNames = techStacks.filter((techStack) =>
                infoForm.techStackIds.includes(techStack.techStackId),
              );

              sendGTMEvent({
                event: 'custom_member_card',
                dl_timestamp: new Date().toISOString(),
                dl_member_id: hashValue(String(memberId)),
                dl_tags: selectedSkillNames,
              });

              onClose();
            }}
          >
            수정 완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
