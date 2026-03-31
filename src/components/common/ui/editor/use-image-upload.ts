'use client';

import type { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { extractImageUrls } from '@/utils/markdown-content';
import {
  type MarkdownEditorImageConfig,
  MARKDOWN_IMAGE_DEFAULT_WIDTH,
  extractClipboardImageFiles,
  extractClipboardImageSource,
  getExtensionFromMime,
  toFileFromBlob,
  validateImageFileForUpload,
} from './image-utils';

export function useImageUpload(
  resolvedImageConfig: MarkdownEditorImageConfig | undefined,
) {
  const [imageInsertError, setImageInsertError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const uploadAndInsertFile = useCallback(
    async (editor: Editor, file: File) => {
      if (!resolvedImageConfig) {
        return;
      }

      const publicUrl = await resolvedImageConfig.uploadImageFile(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: publicUrl,
          width: MARKDOWN_IMAGE_DEFAULT_WIDTH,
        })
        .run();
    },
    [resolvedImageConfig],
  );

  const handleImageFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      if (!resolvedImageConfig || files.length === 0 || isUploadingImages) {
        return;
      }

      const existingCount = extractImageUrls(editor.getHTML()).length;
      const remaining = Math.max(
        0,
        resolvedImageConfig.maxImageCount - existingCount,
      );

      if (remaining === 0) {
        setImageInsertError(
          `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];
      let hitLimit = false;

      for (const file of files) {
        if (validFiles.length >= remaining) {
          hitLimit = true;
          break;
        }

        const error = validateImageFileForUpload(file, resolvedImageConfig);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        for (const file of validFiles) {
          try {
            await uploadAndInsertFile(editor, file);
          } catch {
            errors.push(`${file.name}: 업로드 실패`);
          }
        }

        if (hitLimit) {
          errors.push(
            `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지만 등록할 수 있습니다.`,
          );
        }

        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }
      } finally {
        setIsUploadingImages(false);
      }
    },
    [isUploadingImages, resolvedImageConfig, uploadAndInsertFile],
  );

  const handlePasteImageSource = useCallback(
    async (editor: Editor, source: string) => {
      if (!resolvedImageConfig || isUploadingImages) {
        return;
      }

      const existingCount = extractImageUrls(editor.getHTML()).length;
      if (existingCount >= resolvedImageConfig.maxImageCount) {
        setImageInsertError(
          `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error('이미지를 가져올 수 없습니다.');
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('이미지 파일이 아닙니다.');
        }

        const extension = getExtensionFromMime(blob.type);
        const file = toFileFromBlob(
          blob,
          extension ? `pasted-image.${extension}` : 'pasted-image',
        );

        const error = validateImageFileForUpload(file, resolvedImageConfig);
        if (error) {
          setImageInsertError(error);

          return;
        }

        await uploadAndInsertFile(editor, file);
      } catch {
        setImageInsertError(
          '이미지 URL을 가져올 수 없습니다. 이미지를 직접 복사(우클릭 → 이미지 복사)하거나 파일로 업로드해주세요.',
        );
      } finally {
        setIsUploadingImages(false);
      }
    },
    [resolvedImageConfig, uploadAndInsertFile, isUploadingImages],
  );

  const readClipboardImageFiles = useCallback(async (): Promise<File[]> => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.read !== 'function'
    ) {
      return [];
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];

      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) =>
          type.startsWith('image/'),
        );

        if (!imageType) {
          continue;
        }

        const blob = await clipboardItem.getType(imageType);
        const ext = getExtensionFromMime(imageType);
        files.push(
          toFileFromBlob(blob, ext ? `pasted-image.${ext}` : 'pasted-image'),
        );
      }

      return files;
    } catch {
      return [];
    }
  }, []);

  const handleClipboardPaste = useCallback(
    async (editor: Editor, clipboardData: DataTransfer) => {
      const directFiles = extractClipboardImageFiles(clipboardData);
      if (directFiles.length > 0) {
        await handleImageFiles(editor, directFiles);

        return;
      }

      const clipboardApiFiles = await readClipboardImageFiles();
      if (clipboardApiFiles.length > 0) {
        await handleImageFiles(editor, clipboardApiFiles);

        return;
      }

      const pastedImageSource = extractClipboardImageSource(clipboardData);
      if (pastedImageSource) {
        await handlePasteImageSource(editor, pastedImageSource);
      }
    },
    [handleImageFiles, handlePasteImageSource, readClipboardImageFiles],
  );

  return {
    imageInsertError,
    isUploadingImages,
    setImageInsertError,
    handleImageFiles,
    handleClipboardPaste,
  };
}
