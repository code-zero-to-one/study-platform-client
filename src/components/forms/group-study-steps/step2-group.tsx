'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import FormField from '@/components/common/ui/form/form-field';
import ImageUploadInput from '@/components/common/ui/image-upload-input';
import { BaseInput } from '@/components/common/ui/input';
import { THUMBNAIL_EXTENSION } from '@/config/group-study-const';
import {
  requestMentorMarkdownImageUploadTicket as requestMarkdownImageUploadTicket,
  uploadMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';

import type { GroupStudyFormValues } from '@/types/schemas/group-study-form.schema';

const uploadGroupStudyMarkdownImage = async (file: File) => {
  const ticket = await requestMarkdownImageUploadTicket({
    fileName: file.name,
  });

  await uploadMarkdownImageFile({
    uploadUrl: ticket.uploadUrl,
    file,
  });

  return ticket.publicUrl;
};

export default function Step2OpenGroupStudy() {
  const { setValue, getValues } = useFormContext<GroupStudyFormValues>();
  const scrollToNext = useScrollToNextField();

  const classification = useWatch<GroupStudyFormValues>({
    name: 'classification',
  });
  const thumbnailFile = useWatch<GroupStudyFormValues>({
    name: 'thumbnailFile',
  });
  const thumbnailExtension = useWatch<GroupStudyFormValues>({
    name: 'thumbnailExtension',
  });

  const [image, setImage] = useState<string | undefined>(
    getValues('thumbnailUrl') || undefined,
  );

  useEffect(() => {
    if (thumbnailFile && thumbnailFile instanceof File) {
      setImage(URL.createObjectURL(thumbnailFile));
    } else if (thumbnailExtension === 'DEFAULT') {
      setImage(undefined);
    }
  }, [thumbnailFile, thumbnailExtension]);

  const handleImageChange = (file: File | undefined) => {
    if (!file) {
      setValue('thumbnailExtension', 'DEFAULT', { shouldValidate: true });
      setValue('thumbnailFile', null);
      setImage(undefined);

      return;
    }

    const ext = file.name.split('.').pop()?.toUpperCase();
    const validExt =
      ext &&
      THUMBNAIL_EXTENSION.includes(
        ext as GroupStudyFormValues['thumbnailExtension'],
      )
        ? (ext as GroupStudyFormValues['thumbnailExtension'])
        : 'DEFAULT';

    setValue('thumbnailExtension', validExt, { shouldValidate: true });
    setValue('thumbnailFile', file, { shouldValidate: true });
    setImage(URL.createObjectURL(file));
  };

  const leaderRoleLabel = classification === 'PREMIUM_STUDY' ? '멘토' : '리더';

  return (
    <>
      <div className="font-designer-20b text-text-default">
        스터디 소개 작성
      </div>

      <FormField<GroupStudyFormValues, 'thumbnailExtension'>
        name="thumbnailExtension"
        label="썸네일"
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <ImageUploadInput image={image} onChangeImage={handleImageChange} />
      </FormField>

      <FormField<GroupStudyFormValues, 'title'>
        name="title"
        label="스터디 제목"
        direction="vertical"
        size="medium"
        required
        scrollable
        onAfterBlurFilled={() => scrollToNext('title')}
      >
        <BaseInput placeholder="제목을 입력하세요." hideMeta={false} />
      </FormField>

      <FormField<GroupStudyFormValues, 'summary'>
        name="summary"
        label="스터디 한 줄 소개"
        direction="vertical"
        size="medium"
        required
        scrollable
        onAfterBlurFilled={() => scrollToNext('summary')}
      >
        <BaseInput
          placeholder="목록에 노출될 스터디 요약을 입력하세요."
          hideMeta={false}
        />
      </FormField>

      <FormField<GroupStudyFormValues, 'description'>
        name="description"
        label="스터디 소개"
        helper={
          <span className="whitespace-pre-line">
            {`${leaderRoleLabel}님의 스터디가 돋보이도록 자세한 스터디 소개를 작성해주세요.\n이미지 업로드 시 자유롭게 크기 조정이 가능합니다.`}
          </span>
        }
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <MarkdownEditor
          placeholder="스터디 소개를 자유롭게 작성해주세요."
          uploadImage={uploadGroupStudyMarkdownImage}
        />
      </FormField>
    </>
  );
}
