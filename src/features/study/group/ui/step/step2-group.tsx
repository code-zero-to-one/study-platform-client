'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormField from '@/components/ui/form/form-field';
import ImageUploadInput from '@/components/ui/image-upload-input';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import { THUMBNAIL_EXTENSION } from '../../const/group-study-const';

import { GroupStudyFormValues } from '../../model/group-study-form.schema';

export default function Step2OpenGroupStudy() {
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
      ext && THUMBNAIL_EXTENSION.includes(ext as any)
        ? (ext as GroupStudyFormValues['thumbnailExtension'])
        : 'DEFAULT';

    setValue('thumbnailExtension', validExt, { shouldValidate: true });
    setValue('thumbnailFile', file, { shouldValidate: true });
    setImage(URL.createObjectURL(file));
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
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <TextAreaInput placeholder="소개를 입력하세요." maxLength={1000} />
      </FormField>
    </>
  );
}
