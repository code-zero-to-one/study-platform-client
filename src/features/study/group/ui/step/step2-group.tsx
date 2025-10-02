'use client';

import { useState } from 'react';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { OpenGroupFormValues } from '../../model/open-group-form.schema';
import GroupStudyThumbnailInput from '../group-study-thumbnail-input';

const THUMBNAIL_EXTENSIONS = [
  { label: 'DEFAULT', value: 'DEFAULT' },
  { label: 'JPG', value: 'JPG' },
  { label: 'PNG', value: 'PNG' },
  { label: 'GIF', value: 'GIF' },
  { label: 'WEBP', value: 'WEBP' },
  { label: 'SVG', value: 'SVG' },
  { label: 'JPEG', value: 'JPEG' },
];

export default function Step2OpenGroupStudy() {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [thumbnailExt, setThumbnailExt] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <div className="font-designer-20b text-text-default">
        스터디 소개 작성
      </div>

      <FormField<OpenGroupFormValues, 'thumbnailExtension'>
        name="thumbnailExtension"
        label="썸네일"
        direction="vertical"
        size="medium"
        required
      >
        <GroupStudyThumbnailInput image={image} onChangeImage={setImage} />
      </FormField>

      <FormField<OpenGroupFormValues, 'title'>
        name="title"
        label="스터디 제목"
        direction="vertical"
        size="medium"
        required
      >
        <BaseInput placeholder="제목을 입력하세요." />
      </FormField>

      <FormField<OpenGroupFormValues, 'summary'>
        name="summary"
        label="스터디 한 줄 소개"
        direction="vertical"
        size="medium"
        required
      >
        <BaseInput placeholder="목록에 노출될 스터디 요약을 입력하세요." />
      </FormField>

      <FormField<OpenGroupFormValues, 'description'>
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
