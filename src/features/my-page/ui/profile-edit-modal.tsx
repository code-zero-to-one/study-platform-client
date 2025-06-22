'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { MemberProfile } from '@/entities/user/api/types';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { FormField } from '../../../shared/ui/form/form-field';
import { UpdateUserProfileRequest } from '../api/types';

interface Props {
  onSubmit: (formData: UpdateUserProfileRequest) => void;
  memberProfile: MemberProfile;
}

const skillOptions = [
  { label: 'HTML/CSS', value: 'HTML/CSS' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React', value: 'React' },
  { label: 'Django', value: 'Django' },
  { label: 'MySQL', value: 'MySQL' },
];

export default function ProfileEditModal({ onSubmit, memberProfile }: Props) {
  const [name, setName] = useState(memberProfile.memberName ?? '');
  const [tel, setTel] = useState(memberProfile.tel ?? '');
  const [githubLink, setGithubLink] = useState(
    memberProfile.githubLink?.url ?? '',
  );
  const [blogOrSnsLink, setBlogOrSnsLink] = useState(
    memberProfile.blogOrSnsLink?.url ?? '',
  );
  const [mbti, setMbti] = useState(memberProfile.mbti ?? '');
  const [simpleIntroduction, setSimpleIntroduction] = useState(
    memberProfile.simpleIntroduction ?? '',
  );
  const [interests, setInterests] = useState<string[]>(
    memberProfile.interests?.map((item) => item.name) ?? [],
  );
  const [profileImageExtension, setProfileImageExtension] = useState<
    string | undefined
  >(undefined);

  const handleSubmit = async () => {
    if (!name || !tel) {
      alert('모든 필수 정보를 입력해주세요!');

      return;
    }

    const formData: UpdateUserProfileRequest = {
      name,
      tel,
      githubLink,
      blogOrSnsLink,
      simpleIntroduction,
      mbti,
      interests,
      profileImageExtension,
    };

    onSubmit(formData);
  };

  return (
    <Modal.Root>
      <Modal.Trigger className="rounded-100 bg-fill-brand-default-default font-designer-16b text-text-inverse w-full px-150 py-100">
        내 프로필 수정
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default border-b">
            <div className="flex items-center justify-between">
              <Modal.Title>내 프로필 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-300">
              <div className="flex gap-500">
                <div className="font-designer-14b flex w-[112px]">
                  이미지 설정
                </div>
                <div className="h-[110px] w-[110px] rounded-full bg-red-100" />
              </div>
              <FormField
                label="이름 확인"
                type="text"
                description="소셜 계정에서 불러온 닉네임 대신 이름을 입력해 주세요."
                value={name}
                onChange={setName}
                required
              />
              <FormField
                label="연락처"
                type="text"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={tel}
                onChange={setTel}
                required
              />
              <FormField
                label="Github"
                type="text"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={githubLink}
                onChange={setGithubLink}
              />
              <FormField
                label="MBTI"
                type="text"
                description="자신의 성격 유형을 입력해 주세요."
                value={mbti}
                onChange={setMbti}
              />
              <FormField
                label="관심사"
                type="multidropdown"
                value={interests}
                onChange={setInterests}
                options={skillOptions}
              />
              <FormField
                label="한마디 소개"
                type="textarea"
                description="스터디 진행을 위한 연락 가능한 정보를 입력해 주세요."
                value={simpleIntroduction}
                onChange={setSimpleIntroduction}
              />
              <FormField
                label="블로그/SNS 등 링크"
                type="text"
                description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
                value={blogOrSnsLink}
                onChange={setBlogOrSnsLink}
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
                  onClick={handleSubmit}
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
