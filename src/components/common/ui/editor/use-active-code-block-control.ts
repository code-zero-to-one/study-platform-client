'use client';

import type { Editor } from '@tiptap/react';
import { type RefObject, useEffect, useMemo, useState } from 'react';

export interface ActiveCodeBlockControl {
  language: string;
  top: number;
  left: number;
}

/**
 * 현재 선택된 코드블록의 위치와 언어 정보를 계산합니다.
 * 창 크기 변경 시 위치를 재계산하며, 코드블록이 활성화되지 않았으면 null을 반환합니다.
 */
export const useActiveCodeBlockControl = (
  editor: Editor | null,
  wrapperRef: RefObject<HTMLDivElement | null>,
): ActiveCodeBlockControl | null => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleResize = () => forceUpdate((prev) => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    if (!editor?.isActive('codeBlock')) {
      return null;
    }

    const editorContentWrapper = wrapperRef.current;
    if (!editorContentWrapper) {
      return null;
    }

    const { $from } = editor.state.selection;
    if ($from.parent.type.name !== 'codeBlock') {
      return null;
    }

    const codeBlockPos = $from.before();
    const codeBlockElement = editor.view.nodeDOM(codeBlockPos);
    if (!(codeBlockElement instanceof HTMLElement)) {
      return null;
    }

    const wrapperRect = editorContentWrapper.getBoundingClientRect();
    const codeBlockRect = codeBlockElement.getBoundingClientRect();
    const language =
      (editor.getAttributes('codeBlock').language as string | undefined) ??
      'plaintext';

    return {
      language,
      top: Math.max(6, codeBlockRect.top - wrapperRect.top + 6),
      left: Math.max(10, codeBlockRect.left - wrapperRect.left + 10),
    };
  }, [editor, wrapperRef]);
};
