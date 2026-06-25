import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from '@storybook/test';
import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import MarkdownEditor from './markdown-editor';

const meta: Meta<typeof MarkdownEditor> = {
  title: 'editor/MarkdownEditor (markdown 저장)',
  component: MarkdownEditor,
};

export default meta;

type Story = StoryObj<typeof MarkdownEditor>;

const INITIAL_MD = [
  '**굵게** 텍스트입니다.',
  '',
  '| 항목 | 설명 |',
  '| --- | --- |',
  '| 예시 | 내용 |',
].join('\n');

/**
 * 활성화된 마크다운 저장 모드(`outputFormat="markdown"`)를 실제 브라우저에서 검증.
 * 마크다운 로드 → 실제 TipTap 렌더(볼드/표) → 편집 → onChange가 GFM 마크다운으로 직렬화.
 */
export const MarkdownSaveRoundTrip: Story = {
  render: () => {
    const Harness = () => {
      const [saved, setSaved] = useState('');
      return (
        <div>
          <MarkdownEditor
            outputFormat="markdown"
            value={INITIAL_MD}
            onChange={setSaved}
          />
          <pre data-testid="saved-markdown">{saved}</pre>
        </div>
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    // 1) 로드: 마크다운이 실제 에디터에서 볼드/표로 렌더됐는지(역직렬화)
    const tiptap = canvasElement.querySelector<
      HTMLElement & { __tiptap?: Editor }
    >('.tiptap');
    await waitFor(() => {
      expect(tiptap).toBeTruthy();
      expect(tiptap?.querySelector('strong')).toBeTruthy();
      expect(tiptap?.querySelector('table')).toBeTruthy();
    });

    // 2) 저장: 편집을 가하면 onChange가 GFM 마크다운을 내보내는지(직렬화)
    const editor = tiptap?.__tiptap;
    expect(editor).toBeTruthy();
    editor?.chain().focus('end').insertContent(' 추가').run();

    const output = canvasElement.querySelector(
      '[data-testid="saved-markdown"]',
    );
    await waitFor(() => {
      const md = output?.textContent ?? '';
      // 볼드는 `**`로, 표는 파이프 행으로 직렬화 — literal HTML 덩어리가 아님
      expect(md).toContain('**굵게**');
      expect(md).toContain('| 항목 | 설명 |');
      expect(md).toContain('| --- | --- |');
      expect(md).toContain('추가');
      expect(md).not.toContain('<p>');
    });
  },
};
