'use client';

import type { Editor } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { extractImageUrls } from '@/utils/markdown-content-images';
import {
  extractClipboardImageFiles,
  extractClipboardImageSource,
} from './clipboard-utils';
import {
  type MarkdownEditorImageConfig,
  MARKDOWN_IMAGE_DEFAULT_WIDTH,
  getImageFileUploadValidationError,
  getImageFileNormalizationErrorMessage,
  getExtensionFromMime,
  normalizeImageFileForUpload,
  toFileFromBlob,
} from './image-utils';

const maxImageCountError = (count: number) =>
  `이미지는 최대 ${count}개까지만 등록할 수 있습니다.`;

interface ImageInsertRange {
  from: number;
  to: number;
}

interface ImageSourceFileReplacement {
  file: File;
  source: string;
}

const getCurrentImageInsertRange = (editor: Editor): ImageInsertRange => ({
  from: editor.state.selection.from,
  to: editor.state.selection.to,
});

const insertUploadedImageUrls = (
  editor: Editor,
  imageUrls: string[],
  insertRange: ImageInsertRange,
) => {
  if (imageUrls.length === 0) {
    return;
  }

  const imageContents = imageUrls.map((src) => ({
    type: 'image',
    attrs: {
      src,
      width: MARKDOWN_IMAGE_DEFAULT_WIDTH,
    },
  }));

  try {
    editor.chain().focus().insertContentAt(insertRange, imageContents).run();
  } catch {
    editor.chain().focus().insertContent(imageContents).run();
  }
};

const replaceImageSources = (
  editor: Editor,
  replacements: Array<{ source: string; uploadedImageUrl: string }>,
) => {
  if (replacements.length === 0) {
    return;
  }

  const replacementBySource = new Map(
    replacements.map(({ source, uploadedImageUrl }) => [
      source,
      uploadedImageUrl,
    ]),
  );
  const transaction = editor.state.tr;

  editor.state.doc.descendants((node, position) => {
    if (node.type.name !== 'image') {
      return;
    }

    const source = typeof node.attrs.src === 'string' ? node.attrs.src : '';
    const uploadedImageUrl = replacementBySource.get(source);
    if (!uploadedImageUrl) {
      return;
    }

    transaction.setNodeMarkup(position, undefined, {
      ...node.attrs,
      src: uploadedImageUrl,
    });
  });

  if (transaction.docChanged) {
    editor.view.dispatch(transaction);
  }
};

/**
 * 마크다운 에디터에 이미지 업로드 및 붙여넣기 기능을 제공하는 커스텀 훅입니다.
 * 파일 검증, 크기 제한, 에러 처리를 포함합니다.
 * @param resolvedImageConfig 이미지 설정 객체 (업로드 함수, 최대 개수, 파일 크기 제한 등)
 * @returns 이미지 업로드 핸들러들과 에러 상태를 포함한 객체
 * @example
 * const { handleImageFiles, handleClipboardPaste, imageInsertError } = useImageUpload(imageConfig)
 */
export function useImageUpload(
  resolvedImageConfig: MarkdownEditorImageConfig | undefined,
) {
  const [imageInsertError, setImageInsertError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  /**
   * 파일을 업로드하고 삽입할 이미지 URL을 반환합니다.
   * @param editor TipTap 에디터 인스턴스
   * @param file 업로드할 이미지 파일
   * @returns 비동기 작업
   * @example
   * await uploadFile(imageFile)
   */
  const uploadFile = useCallback(
    async (file: File) => {
      if (!resolvedImageConfig) {
        return undefined;
      }

      return resolvedImageConfig.uploadImageFile(file);
    },
    [resolvedImageConfig],
  );

  const collectUploadedImageUrls = useCallback(
    async (files: File[]) => {
      const uploadedImageUrls: string[] = [];
      const uploadErrors: string[] = [];

      for (const file of files) {
        try {
          const uploadedImageUrl = await uploadFile(file);
          if (uploadedImageUrl) {
            uploadedImageUrls.push(uploadedImageUrl);
          }
        } catch (error) {
          const message =
            error instanceof Error && error.message.trim()
              ? error.message.trim()
              : '업로드 실패';
          uploadErrors.push(`${file.name}: ${message}`);
        }
      }

      return { uploadedImageUrls, uploadErrors };
    },
    [uploadFile],
  );

  /**
   * 여러 이미지 파일들을 유효성 검사 후 에디터에 삽입합니다.
   * 최대 개수 제한, 파일 크기 제한, 확장자 검증을 수행합니다.
   * @param editor TipTap 에디터 인스턴스
   * @param files 업로드할 이미지 파일 배열
   * @returns 비동기 작업
   * @example
   * await handleImageFiles(editor, [file1, file2])
   */
  const handleImageFiles = useCallback(
    async (
      editor: Editor,
      files: File[],
      insertRange = getCurrentImageInsertRange(editor),
    ) => {
      if (!resolvedImageConfig || files.length === 0 || isUploadingImages) {
        return;
      }

      const editorHtml = editor.getHTML();
      const existingImageCount = extractImageUrls(editorHtml).length;
      const maxImageCount = resolvedImageConfig.maxImageCount;
      const remainingSlots = Math.max(0, maxImageCount - existingImageCount);

      if (remainingSlots === 0) {
        setImageInsertError(maxImageCountError(maxImageCount));

        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];
      let hitLimit = false;

      for (const file of files) {
        if (validFiles.length >= remainingSlots) {
          hitLimit = true;
          break;
        }

        let normalizedFile: File;
        try {
          normalizedFile = await normalizeImageFileForUpload(file);
        } catch (error) {
          errors.push(getImageFileNormalizationErrorMessage(file.name, error));
          continue;
        }

        const error = getImageFileUploadValidationError(
          normalizedFile,
          resolvedImageConfig,
        );
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(normalizedFile);
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
        const { uploadedImageUrls, uploadErrors } =
          await collectUploadedImageUrls(validFiles);
        insertUploadedImageUrls(editor, uploadedImageUrls, insertRange);
        errors.push(...uploadErrors);

        if (hitLimit) {
          errors.push(maxImageCountError(maxImageCount));
        }

        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }
      } finally {
        setIsUploadingImages(false);
      }
    },
    [collectUploadedImageUrls, isUploadingImages, resolvedImageConfig],
  );

  const handleImageSourceFileReplacements = useCallback(
    async (editor: Editor, replacements: ImageSourceFileReplacement[]) => {
      if (
        !resolvedImageConfig ||
        replacements.length === 0 ||
        isUploadingImages
      ) {
        return;
      }

      const replacementSources = new Set(
        replacements.map(({ source }) => source),
      );
      const existingImageCount = extractImageUrls(editor.getHTML()).filter(
        (source) => !replacementSources.has(source),
      ).length;
      const maxImageCount = resolvedImageConfig.maxImageCount;
      const remainingSlots = Math.max(0, maxImageCount - existingImageCount);

      if (remainingSlots === 0) {
        setImageInsertError(maxImageCountError(maxImageCount));

        return;
      }

      const validReplacements: Array<{ file: File; source: string }> = [];
      const errors: string[] = [];
      let hitLimit = false;

      for (const replacement of replacements) {
        if (validReplacements.length >= remainingSlots) {
          hitLimit = true;
          break;
        }

        let normalizedFile: File;
        try {
          normalizedFile = await normalizeImageFileForUpload(replacement.file);
        } catch (error) {
          errors.push(
            getImageFileNormalizationErrorMessage(replacement.file.name, error),
          );
          continue;
        }

        const error = getImageFileUploadValidationError(
          normalizedFile,
          resolvedImageConfig,
        );
        if (error) {
          errors.push(error);
        } else {
          validReplacements.push({
            file: normalizedFile,
            source: replacement.source,
          });
        }
      }

      if (validReplacements.length === 0) {
        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        const uploadedReplacements: Array<{
          source: string;
          uploadedImageUrl: string;
        }> = [];

        for (const replacement of validReplacements) {
          try {
            const uploadedImageUrl = await uploadFile(replacement.file);
            if (uploadedImageUrl) {
              uploadedReplacements.push({
                source: replacement.source,
                uploadedImageUrl,
              });
            }
          } catch (error) {
            const message =
              error instanceof Error && error.message.trim()
                ? error.message.trim()
                : '업로드 실패';
            errors.push(`${replacement.file.name}: ${message}`);
          }
        }

        replaceImageSources(editor, uploadedReplacements);

        if (hitLimit) {
          errors.push(maxImageCountError(maxImageCount));
        }

        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }
      } finally {
        setIsUploadingImages(false);
      }
    },
    [isUploadingImages, resolvedImageConfig, uploadFile],
  );

  /**
   * URL에서 이미지를 가져와 에디터에 삽입합니다.
   * 네트워크 요청을 통해 이미지를 다운로드하고 검증합니다.
   * @param editor TipTap 에디터 인스턴스
   * @param source 이미지 URL 또는 Data URI
   * @returns 비동기 작업
   * @example
   * await handlePasteImageSource(editor, 'https://example.com/image.jpg')
   */
  const handlePasteImageSource = useCallback(
    async (editor: Editor, source: string) => {
      if (!resolvedImageConfig || isUploadingImages) {
        return;
      }

      const insertRange = getCurrentImageInsertRange(editor);
      const editorHtml = editor.getHTML();
      const existingImageCount = extractImageUrls(editorHtml).length;
      if (existingImageCount >= resolvedImageConfig.maxImageCount) {
        setImageInsertError(
          maxImageCountError(resolvedImageConfig.maxImageCount),
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
        const extension = getExtensionFromMime(blob.type) || 'png';
        const normalizedFile = await normalizeImageFileForUpload(
          toFileFromBlob(blob, `pasted-image.${extension}`),
        );

        const error = getImageFileUploadValidationError(
          normalizedFile,
          resolvedImageConfig,
        );
        if (error) {
          setImageInsertError(error);

          return;
        }

        const uploadedImageUrl = await uploadFile(normalizedFile);
        if (uploadedImageUrl) {
          insertUploadedImageUrls(editor, [uploadedImageUrl], insertRange);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.trim() &&
          error.message !== 'Failed to fetch'
        ) {
          setImageInsertError(error.message.trim());

          return;
        }

        setImageInsertError(
          '이미지 URL을 가져올 수 없습니다. 이미지를 직접 복사(우클릭 → 이미지 복사)하거나 파일로 업로드해주세요.',
        );
      } finally {
        setIsUploadingImages(false);
      }
    },
    [isUploadingImages, resolvedImageConfig, uploadFile],
  );

  /**
   * Clipboard API를 사용하여 클립보드에서 이미지 파일들을 읽습니다.
   * 최신 브라우저의 navigator.clipboard.read() API를 지원합니다.
   * @returns 클립보드에서 추출한 이미지 파일 배열
   * @example
   * const files = await readClipboardImageFiles()
   * // 사용자가 Ctrl+C로 복사한 이미지 파일들을 가져옴
   */
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
        const extension = getExtensionFromMime(imageType);
        const filename = extension
          ? `pasted-image.${extension}`
          : 'pasted-image';

        files.push(toFileFromBlob(blob, filename));
      }

      return files;
    } catch {
      return [];
    }
  }, []);

  /**
   * 클립보드에서 이미지를 추출하여 에디터에 삽입합니다.
   * 직접 이미지 파일 → Clipboard API → URL 순서로 시도합니다.
   * @param editor TipTap 에디터 인스턴스
   * @param clipboardData 클립보드 데이터 (paste/drop 이벤트에서)
   * @returns 비동기 작업
   * @example
   * await handleClipboardPaste(editor, event.clipboardData)
   */
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
    handleImageSourceFileReplacements,
  };
}
