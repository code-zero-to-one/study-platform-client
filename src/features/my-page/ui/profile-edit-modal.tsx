'use client';

import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { MemberProfile } from '@/entities/user/api/types';
import { useUploadProfileImageMutation } from '@/features/auth/model/use-auth-mutation';
import SignupImageSelector from '@/features/auth/ui/sign-up-image-selector';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { FormField } from '../../../shared/ui/form/form-field';
import { UpdateUserProfileRequest } from '../api/types';

interface Props {
  onSubmit: (formData: UpdateUserProfileRequest) => void;
  memberProfile: MemberProfile;
  memberId: number;
}

const skillOptions = [
  { label: 'HTML/CSS', value: 'HTML/CSS' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React', value: 'React' },
  { label: 'Django', value: 'Django' },
  { label: 'MySQL', value: 'MySQL' },
];

export const MBTI_OPTIONS = [
  { label: 'ISTJ', value: 'ISTJ' },
  { label: 'ISFJ', value: 'ISFJ' },
  { label: 'INFJ', value: 'INFJ' },
  { label: 'INTJ', value: 'INTJ' },
  { label: 'ISTP', value: 'ISTP' },
  { label: 'ISFP', value: 'ISFP' },
  { label: 'INFP', value: 'INFP' },
  { label: 'INTP', value: 'INTP' },
  { label: 'ESTP', value: 'ESTP' },
  { label: 'ESFP', value: 'ESFP' },
  { label: 'ENFP', value: 'ENFP' },
  { label: 'ENTP', value: 'ENTP' },
  { label: 'ESTJ', value: 'ESTJ' },
  { label: 'ESFJ', value: 'ESFJ' },
  { label: 'ENFJ', value: 'ENFJ' },
  { label: 'ENTJ', value: 'ENTJ' },
];

export type MbtiValue = (typeof MBTI_OPTIONS)[number]['value'];

export default function ProfileEditModal({
  onSubmit,
  memberProfile,
  memberId,
}: Props) {
  const [name, setName] = useState<UpdateUserProfileRequest['name']>(
    memberProfile.memberName ?? '',
  );
  const [tel, setTel] = useState<UpdateUserProfileRequest['tel']>(
    memberProfile.tel ?? '',
  );
  const [githubLink, setGithubLink] = useState<
    UpdateUserProfileRequest['githubLink']
  >(memberProfile.githubLink?.url ?? '');

  const [blogOrSnsLink, setBlogOrSnsLink] = useState<
    UpdateUserProfileRequest['blogOrSnsLink']
  >(memberProfile.blogOrSnsLink?.url ?? '');

  const [mbti, setMbti] = useState<UpdateUserProfileRequest['mbti']>(
    memberProfile.mbti ?? '',
  );

  const [simpleIntroduction, setSimpleIntroduction] = useState<
    UpdateUserProfileRequest['simpleIntroduction']
  >(memberProfile.simpleIntroduction ?? '');

  const [interests, setInterests] = useState<
    UpdateUserProfileRequest['interests']
  >(memberProfile.interests?.map((item) => item.name) ?? []);

  const [profileImageExtension, setProfileImageExtension] =
    useState<UpdateUserProfileRequest['profileImageExtension']>(undefined);

  const [image, setImage] = useState(
    memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl ??
      '/profile-default.svg',
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadProfileImage = useUploadProfileImageMutation();
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));

      const ext = file.name.split('.').pop()?.toUpperCase();
      if (ext && ['JPG', 'PNG', 'GIF', 'WEBP'].includes(ext)) {
        setProfileImageExtension(ext as 'JPG' | 'PNG' | 'GIF' | 'WEBP');
      } else {
        alert('지원하지 않는 이미지 형식입니다.');
        setProfileImageExtension(undefined);
      }
    }
  };

  const handleSubmit = async () => {
    if (!name || !tel) {
      alert('모든 필수 정보를 입력해주세요!');

      return;
    }

    const isDefaultImage = image === '/profile-default.svg';

    const rawFormData: UpdateUserProfileRequest = {
      name,
      tel,
      githubLink: githubLink.trim() || undefined,
      blogOrSnsLink: blogOrSnsLink.trim() || undefined,
      simpleIntroduction: simpleIntroduction.trim() || undefined,
      mbti: mbti.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined,
      profileImageExtension: isDefaultImage ? undefined : profileImageExtension,
    };

    const formData = Object.fromEntries(
      Object.entries(rawFormData).filter(([_, v]) => v !== undefined),
    ) as UpdateUserProfileRequest;

    onSubmit(formData);

    if (fileInputRef.current?.files?.[0]) {
      const imageFormData = new FormData();
      imageFormData.append('file', fileInputRef.current.files[0]);

      try {
        await uploadProfileImage.mutateAsync({
          memberId: memberId,
          filename: `profile-formdata-${memberId}`,
          file: imageFormData,
        });

        await queryClient.invalidateQueries({ queryKey: ['memberInfo'] });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    }
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
                <div className="font-designer-14b flex w-[100px]">
                  이미지 설정
                </div>
                <SignupImageSelector
                  image={image}
                  setImage={setImage}
                  fileInputRef={fileInputRef}
                  handleImageChange={handleImageChange}
                />
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
                type="singledropdown"
                description="자신의 성격 유형을 입력해 주세요."
                value={mbti}
                onChange={setMbti}
                options={MBTI_OPTIONS}
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
