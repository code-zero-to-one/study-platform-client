'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { THUMBNAIL_EXTENSION } from '../../const/group-study-const';

import { GroupStudyFormValues } from '../../model/group-study-form.schema';
import GroupStudyThumbnailInput from '../group-study-thumbnail-input';

export default function Step2OpenGroupStudy() {
  const { setValue, getValues } = useFormContext<GroupStudyFormValues>();

  const thumbnailFile = useWatch<GroupStudyFormValues>({
    name: 'thumbnailFile',
  });
  const thumbnailExtension = useWatch<GroupStudyFormValues>({
    name: 'thumbnailExtension',
  });

  console.log('thumbnailExtension', thumbnailExtension);

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

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setValue('thumbnailExtension', 'DEFAULT', { shouldValidate: true });
      setValue('thumbnailFile', null);
      setImage(undefined);

      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert('이미지 용량은 5MB 이하만 업로드할 수 있어요.');

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
      >
        <GroupStudyThumbnailInput
          image={image}
          onChangeImage={handleImageChange}
        />
      </FormField>

      <FormField<GroupStudyFormValues, 'title'>
        name="title"
        label="스터디 제목"
        direction="vertical"
        size="medium"
        required
      >
        <BaseInput placeholder="제목을 입력하세요." hideMeta={false} />
      </FormField>

      <FormField<GroupStudyFormValues, 'summary'>
        name="summary"
        label="스터디 한 줄 소개"
        direction="vertical"
        size="medium"
        required
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
      >
        <TextAreaInput placeholder="소개를 입력하세요." maxLength={1000} />
      </FormField>
    </>
  );
}
