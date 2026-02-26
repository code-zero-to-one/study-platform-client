'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import { MultiDropdown, SingleDropdown } from '@/components/ui/dropdown';
import FormField from '@/components/ui/form/form-field';
import MultiItemSelector from '@/components/ui/form/multi-item-selector';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { MemberProfile } from '@/entities/user/api/types';
import { useUploadProfileImageMutation } from '@/features/auth/model/use-auth-mutation';
import SignupImageSelector from '@/features/auth/ui/sign-up-image-selector';

import { DEFAULT_OPTIONS, MBTI_OPTIONS } from '../const/my-page-const';
import {
  ProfileFormSchema,
  type ProfileFormInput,
  type ProfileFormValues,
  buildProfileDefaultValues,
  toUpdateProfilePayload,
} from '../model/profile-form.schema';
import {
  useTechStacksQuery,
  useUpdateUserProfileMutation,
} from '../model/use-update-user-profile-mutation';

interface Props {
  memberProfile: MemberProfile;
  memberId: number;
}

export default function ProfileEditModal({ memberProfile, memberId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

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
        <Modal.Content size="medium">
          <Modal.Header className="border-border-default border-b">
            <div className="flex items-center justify-between">
              <Modal.Title>내 프로필 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>

          <ProfileEditForm
            memberProfile={memberProfile}
            memberId={memberId}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ProfileEditForm({
  memberProfile,
  memberId,
  onClose,
}: Props & { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile } = useUpdateUserProfileMutation(memberId);
  const { mutateAsync: uploadProfileImage } = useUploadProfileImageMutation();
  const { data: techStacks = [] } = useTechStacksQuery();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(
    memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl ??
      undefined,
  );

  const methods = useForm<ProfileFormInput>({
    resolver: zodResolver(ProfileFormSchema),
    mode: 'onChange',
    defaultValues: buildProfileDefaultValues(memberProfile),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const techStackOptions = useMemo(
    () =>
      techStacks.map(({ techStackId, techStackName }) => ({
        value: String(techStackId),
        label: techStackName,
      })),
    [techStacks],
  );

  const onValidSubmit = async (values: ProfileFormValues) => {
    const file = fileInputRef.current?.files?.[0];
    const profileImageExtension =
      image === undefined ? 'jpg' : file?.name.split('.').pop();

    const payload = toUpdateProfilePayload(values, { profileImageExtension });
    const updatedProfile = await updateProfile(payload);

    // 이미지 업로드
    if (updatedProfile.profileImageUploadUrl) {
      const imageFormData = new FormData();

      if (file) {
        imageFormData.append('file', file);
      } else if (image === undefined) {
        const defaultProfileImage = 'profile-default.jpg';
        const response = await fetch(defaultProfileImage);
        const blob = await response.blob();
        const defaultProfileFile = new File([blob], defaultProfileImage, {
          type: 'image/jpg',
        });
        imageFormData.append('file', defaultProfileFile);
      }

      const filename = updatedProfile.profileImageUploadUrl.split('/').pop();
      if (filename) {
        try {
          await uploadProfileImage({ memberId, filename, file: imageFormData });
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    }

    await queryClient.invalidateQueries({
      queryKey: ['userProfile', memberId],
    });
    onClose();
  };

  return (
    <>
      <Modal.Body>
        <FormProvider {...methods}>
          <form
            id="profile-edit-form"
            className="flex flex-col gap-300"
            onSubmit={handleSubmit(onValidSubmit)}
          >
            <div className="flex gap-500">
              <div className="font-designer-14b flex w-[100px]">
                이미지 설정
              </div>
              <SignupImageSelector
                image={image}
                setImage={setImage}
                fileInputRef={fileInputRef}
                handleImageChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            <FormField<ProfileFormInput, 'nickname'>
              name="nickname"
              label="닉네임"
              required
              description="사람들이 나를 기억해줄 수 있는 닉네임을 입력해 주세요."
              rules={{
                setValueAs: (v: string) => (v ?? '').replace(/\s/g, ''),
              }}
            >
              <BaseInput placeholder="입력해주세요." />
            </FormField>

            <FormField<ProfileFormInput, 'mbti'>
              name="mbti"
              label="MBTI"
              description="자신의 성격 유형을 입력해 주세요."
            >
              <SingleDropdown
                options={MBTI_OPTIONS}
                placeholder="선택해주세요"
              />
            </FormField>

            <FormField<ProfileFormInput, 'interests'>
              name="interests"
              label="관심사"
            >
              <MultiItemSelector
                options={DEFAULT_OPTIONS.map((opt) => opt.label)}
              />
            </FormField>

            <FormField<ProfileFormInput, 'simpleIntroduction'>
              name="simpleIntroduction"
              label="한마디 소개"
              description="본인을 간단히 소개하는 한마디를 입력해 주세요."
              showCounterRight
              maxCharCount={200}
            >
              <TextAreaInput
                placeholder="입력해주세요."
                maxLength={200}
                hideMeta
              />
            </FormField>

            <FormField<ProfileFormInput, 'birthDate'>
              name="birthDate"
              label="생년월일"
              description="생년월일을 입력해 주세요."
            >
              <BaseInput placeholder="2000.00.00" />
            </FormField>

            {/* 기본 정보 (profile-info-edit-modal)에서 이동해옴 */}
            <FormField<ProfileFormInput, 'techStackIds', string[]>
              name="techStackIds"
              label="사용 가능한 기술 스택"
              helper="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
              required
            >
              <MultiDropdown
                options={techStackOptions}
                placeholder="선택해주세요"
              />
            </FormField>

            <FormField<ProfileFormInput, 'githubLink'>
              name="githubLink"
              label="Github"
              description="본인의 활동을 확인할 수 있는 GitHub 링크를 입력해 주세요."
              rules={{
                setValueAs: (v: string) => (v ?? '').replace(/\s/g, ''),
              }}
            >
              <BaseInput placeholder="https://github.com/zeroOne" />
            </FormField>

            <FormField<ProfileFormInput, 'blogOrSnsLink'>
              name="blogOrSnsLink"
              label="블로그/SNS 등 링크"
              description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
              rules={{
                setValueAs: (v: string) => (v ?? '').replace(/\s/g, ''),
              }}
            >
              <BaseInput placeholder="https://github.com/user_id " />
            </FormField>
          </form>
        </FormProvider>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-[8px]">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            type="submit"
            form="profile-edit-form"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '수정 중…' : '수정 완료'}
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
