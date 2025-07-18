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
import {
  DEFAULT_OPTIONS,
  DEFAULT_PROFILE_IMAGE_URL,
  MBTI_OPTIONS,
} from '../consts/my-page-const';
import { useUpdateUserProfileMutation } from '../model/use-update-user-profile-mutation';

interface Props {
  memberProfile: MemberProfile;
  memberId: number;
}

export type MbtiValue = (typeof MBTI_OPTIONS)[number]['value'];

export default function ProfileEditModal({ memberProfile, memberId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<UpdateUserProfileRequest['name']>(
    memberProfile.memberName ?? '',
  );
  // 이름 유효성 검사: 2~10자, 한글 또는 영문만 허용
  const isNameValid = /^[가-힣a-zA-Z]{2,10}$/.test(name);

  const [tel, setTel] = useState<UpdateUserProfileRequest['tel']>(
    memberProfile.tel ?? '',
  );
  // 연락처 유효성 검사: "(2~3자리 지역번호)-(3~4자리 번호)-(4자리 번호)" 형식
  const isTelValid = /^\d{2,3}-\d{3,4}-\d{4}$/.test(tel);

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

  const [image, setImage] = useState(
    memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl ??
      DEFAULT_PROFILE_IMAGE_URL,
  );

  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, data: updatedProfile } =
    useUpdateUserProfileMutation(memberId);
  const { mutateAsync: uploadProfileImage } = useUploadProfileImageMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];

    const hasImageFile = !!file;
    const ext = file?.name.split('.').pop()?.toUpperCase();
    const profileImageExtension =
      ext && ['JPG', 'PNG', 'GIF', 'WEBP'].includes(ext) ? ext : undefined;

    const rawFormData: UpdateUserProfileRequest = {
      name,
      tel,
      githubLink: githubLink.trim() || undefined,
      blogOrSnsLink: blogOrSnsLink.trim() || undefined,
      simpleIntroduction: simpleIntroduction.trim() || undefined,
      mbti: mbti.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined,
      profileImageExtension: hasImageFile ? profileImageExtension : undefined,
    };

    const formData = Object.fromEntries(
      Object.entries(rawFormData).filter(([_, v]) => v !== undefined),
    ) as UpdateUserProfileRequest;

    await updateProfile(formData);

    if (
      fileInputRef.current?.files?.[0] &&
      updatedProfile.profileImageUploadUrl
    ) {
      const imageFormData = new FormData();
      imageFormData.append('file', fileInputRef.current.files[0]);

      const filename = updatedProfile.profileImageUploadUrl.split('/').pop();
      if (!filename) return;

      try {
        await uploadProfileImage({
          memberId,
          filename,
          file: imageFormData,
        });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    }
    console.log('memberinfo 업데이트');
    await queryClient.invalidateQueries({ queryKey: ['memberInfo'] });
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger
        onClick={() => setIsOpen(true)}
        className="rounded-100 bg-fill-brand-default-default font-designer-16b text-text-inverse w-full px-150 py-100"
      >
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
                error={!isNameValid}
                description={
                  isNameValid
                    ? '소셜 계정에서 불러온 닉네임 대신 이름을 입력해 주세요.'
                    : '이름은 2~10자의 한글 또는 영문만 허용됩니다.'
                }
                value={name}
                onChange={setName}
                required
              />
              <FormField
                label="연락처"
                type="text"
                error={!isTelValid}
                description={
                  isTelValid
                    ? '스터디 진행을 위한 연락 가능한 정보를 입력해 주세요.'
                    : '연락처는 숫자와 하이픈(-)을 포함한 형식으로 입력해주세요.'
                }
                value={tel}
                onChange={(value) => {
                  const onlyNumberAndHyphen = value.replace(/[^\d-]/g, '');
                  setTel(onlyNumberAndHyphen);
                }}
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
                label="관심 태그"
                type="userselect"
                value={interests}
                onChange={setInterests}
                options={DEFAULT_OPTIONS}
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
            <div className="flex justify-end gap-[8px]">
              <Button
                color="secondary"
                size="large"
                onClick={() => setIsOpen(false)}
              >
                취소
              </Button>
              <Button
                size="large"
                onClick={async () => {
                  await handleSubmit(); // 여기서 이미지 업로드 포함
                  setIsOpen(false); // 모달 닫기
                }}
                disabled={!isNameValid || !isTelValid}
              >
                수정 완료
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
