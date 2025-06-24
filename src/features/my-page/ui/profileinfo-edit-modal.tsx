'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { MemberInfo } from '@/entities/user/api/types';
import { hashValue } from '@/shared/lib/hash';
import { getCookie } from '@/shared/tanstack-query/cookie';
import Button from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form/form-field';
import { Modal } from '@/shared/ui/modal';
import { UpdateUserProfileInfoRequest } from '../api/types';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useTechStacksQuery,
} from '../model/use-update-user-profile-mutation';

interface Props {
  memberInfo: MemberInfo;
  onSubmit: (formData: UpdateUserProfileInfoRequest) => void;
}

export default function ProfileInfoEditModal({ memberInfo, onSubmit }: Props) {
  const [selfIntroduction, setSelfIntroduction] = useState<
    UpdateUserProfileInfoRequest['selfIntroduction']
  >(memberInfo.selfIntroduction ?? '');
  const [studyPlan, setStudyPlan] = useState<
    UpdateUserProfileInfoRequest['studyPlan']
  >(memberInfo.studyPlan ?? '');
  const [preferredSubject, setPreferredSubject] = useState<
    UpdateUserProfileInfoRequest['preferredStudySubject']
  >(memberInfo.preferredStudySubject?.studySubjectId ?? undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    UpdateUserProfileInfoRequest['availableStudyTimeIds']
  >((memberInfo.availableStudyTimes ?? []).map((time) => time?.id ?? 0));
  const [selectedSkills, setSelectedSkills] = useState<
    UpdateUserProfileInfoRequest['techStackIds']
  >((memberInfo.techStacks ?? []).map((tech) => tech?.techStackId ?? 0));

  const handleSubmit = () => {
    const formData: UpdateUserProfileInfoRequest = {
      selfIntroduction,
      studyPlan,
      preferredStudySubject: preferredSubject,
      availableStudyTimeIds: availableTimeSlots
        .filter((id) => id)
        .map((id) => Number(id)),
      techStackIds: selectedSkills.filter((id) => id).map((id) => Number(id)),
    };
    onSubmit(formData);
  };

  const { data: availableStudyTimes } = useAvailableStudyTimesQuery();
  const { data: studySubjects } = useStudySubjectsQuery();
  const { data: techStacks } = useTechStacksQuery();

  return (
    <Modal.Root>
      <Modal.Trigger>
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
          <Modal.Body>
            <div className="flex flex-col gap-300">
              <FormField
                label="자기소개"
                type="textarea"
                description="간단한 자기소개를 입력해 주세요."
                value={selfIntroduction}
                onChange={setSelfIntroduction}
                direction="vertical"
                maxLength={500}
              />
              <FormField
                label="공부 주제 및 계획"
                type="textarea"
                description="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
                value={studyPlan}
                onChange={setStudyPlan}
                direction="vertical"
                maxLength={500}
                required
              />
              <FormField
                label="선호하는 스터디 주제"
                type="singledropdown"
                description="관심있는 스터디 유형을 선택해주세요."
                value={preferredSubject}
                onChange={setPreferredSubject}
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
                value={availableTimeSlots}
                direction="vertical"
                options={
                  availableStudyTimes?.map(({ availableTimeId, display }) => ({
                    value: availableTimeId.toString(),
                    label: display,
                  })) ?? []
                }
                onChange={setAvailableTimeSlots}
                required
              />
              <FormField
                label="사용 가능한 기술 스택"
                type="multidropdown"
                description="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
                value={selectedSkills}
                onChange={setSelectedSkills}
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
            <Modal.Close asChild>
              <div className="flex w-full justify-center gap-[8px]">
                <Button color="secondary" className="w-[140px] cursor-pointer">
                  취소
                </Button>
                <Button
                  className="w-[140px] cursor-pointer"
                  onClick={() => {
                    handleSubmit();

                    const memberId = getCookie('memberId');
                    const selectedSkillNames = techStacks.filter((techStack) =>
                      selectedSkills.includes(techStack.techStackId),
                    );

                    sendGTMEvent({
                      event_name: 'member_card',
                      timestamp: new Date().toISOString(),
                      dl_member_id: hashValue(memberId),
                      dl_tags: selectedSkillNames,
                    });
                  }}
                >
                  수정 완료
                </Button>
              </div>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
