'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import type {
  GroupStudyFormValues,
  GroupStudyPendingDescriptionImage,
} from '@/types/schemas/group-study-form.schema';
import {
  createGroupStudyPendingDescriptionImage,
  GROUP_STUDY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  GROUP_STUDY_MARKDOWN_MAX_IMAGE_COUNT,
  GROUP_STUDY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '../_model/group-study-markdown';

interface GroupStudyMarkdownEditorProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (next: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const revokeObjectUrl = (url: string) => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

function GroupStudyMarkdownEditor({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: GroupStudyMarkdownEditorProps) {
  const { setValue, getValues } = useFormContext<GroupStudyFormValues>();
  const watchedPendingImages = useWatch<GroupStudyFormValues>({
    name: 'descriptionPendingImages',
  }) as GroupStudyFormValues['descriptionPendingImages'] | undefined;
  const pendingImages = useMemo(
    () => watchedPendingImages ?? [],
    [watchedPendingImages],
  );
  const previousObjectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const previousObjectUrls = previousObjectUrlsRef.current;
    const nextObjectUrls = new Set(
      pendingImages.map(
        (pendingImage: GroupStudyPendingDescriptionImage) =>
          pendingImage.objectUrl,
      ),
    );

    for (const objectUrl of previousObjectUrls) {
      if (!nextObjectUrls.has(objectUrl)) {
        revokeObjectUrl(objectUrl);
      }
    }

    previousObjectUrlsRef.current = nextObjectUrls;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      for (const objectUrl of previousObjectUrlsRef.current) {
        revokeObjectUrl(objectUrl);
      }
    };
  }, []);

  const handleQueueImageFile = useCallback(
    async (file: File) => {
      const pendingImage = createGroupStudyPendingDescriptionImage(file);
      const currentPendingImages = getValues('descriptionPendingImages') ?? [];

      setValue(
        'descriptionPendingImages',
        [...currentPendingImages, pendingImage],
        {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        },
      );

      return pendingImage.objectUrl;
    },
    [getValues, setValue],
  );

  return (
    <MarkdownEditor
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      imageConfig={{
        allowedImageExtensions: GROUP_STUDY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
        maxImageCount: GROUP_STUDY_MARKDOWN_MAX_IMAGE_COUNT,
        maxImageFileSize: GROUP_STUDY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
        uploadImageFile: handleQueueImageFile,
      }}
    />
  );
}

export default memo(GroupStudyMarkdownEditor);
