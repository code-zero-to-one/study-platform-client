'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormField from '@/components/common/ui/form/form-field';
import ImageUploadInput from '@/components/common/ui/image-upload-input';
import { BaseInput } from '@/components/common/ui/input';
import { THUMBNAIL_EXTENSION } from '@/config/group-study-const';
import { getGroupStudyDescriptionTextLength } from '@/features/group-study/model/group-study-description';
import GroupStudyMarkdownEditor from '@/features/group-study/ui/group-study-markdown-editor';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import {
  GROUP_STUDY_DESCRIPTION_MAX_LENGTH,
  type GroupStudyFormValues,
} from '@/types/schemas/group-study-form.schema';

export default function GroupStudyStepIntroduction() {
  const { setValue, getValues } = useFormContext<GroupStudyFormValues>();
  const scrollToNext = useScrollToNextField();

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
      const url = URL.createObjectURL(thumbnailFile);
      setImage(url);

      return () => URL.revokeObjectURL(url);
    } else if (thumbnailExtension === 'DEFAULT') {
      setImage(undefined);
    }
  }, [thumbnailFile, thumbnailExtension]);

  const handleImageChange = (file: File | undefined) => {
    if (!file) {
      setValue('thumbnailExtension', 'DEFAULT', { shouldValidate: true });
      setValue('thumbnailFile', null);

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
  };

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
        <BaseInput
          placeholder="제목을 입력하세요."
          hideMeta={false}
          maxLength={100}
        />
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
          maxLength={200}
        />
      </FormField>

      <FormField<GroupStudyFormValues, 'description'>
        name="description"
        label="스터디 소개"
        direction="vertical"
        size="medium"
        required
        scrollable
        showCounterRight
        maxCharCount={GROUP_STUDY_DESCRIPTION_MAX_LENGTH}
        getCharCount={getGroupStudyDescriptionTextLength}
      >
        <GroupStudyMarkdownEditor placeholder="스터디 소개를 자유롭게 작성해주세요." />
      </FormField>
    </>
  );
}
