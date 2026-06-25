import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import MarkdownContent from '@/components/common/ui/editor/markdown-content';
import MarkdownContentCore from './markdown-content-core';

/**
 * 레슨 본문 렌더링 검증 스토리.
 * Storybook 테스트(헤드리스 크로미움)에서 실제 렌더 결과를 단언한다.
 */
const meta: Meta<typeof MarkdownContentCore> = {
  title: 'rich-text/MarkdownContentCore',
  component: MarkdownContentCore,
};

export default meta;

type Story = StoryObj<typeof MarkdownContentCore>;

// 블록 HTML이 없는 "마크다운 + 인라인 HTML 폴백" 혼합 본문.
const MIXED_MARKDOWN = [
  '## 섹션 제목',
  '',
  '**바이브 코딩**이라는 영역과 <strong>연 매출 5억+</strong>를 다룹니다.',
  '',
  ':welcome_xxl:',
  '',
  '| 항목 | 설명 |',
  '| --- | --- |',
  '| 예시 | 내용 |',
].join('\n');

/**
 * 학생 화면: 마크다운 `**` 볼드와 HTML 폴백 `<strong>`가 모두 굵게,
 * 표·이모티콘·제목이 정상 렌더되고 literal `**`는 남지 않는다.
 */
export const StudentRendering: Story = {
  args: { content: MIXED_MARKDOWN },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('div');
    await waitFor(() => {
      expect(root).toBeTruthy();
      expect(root?.querySelectorAll('strong').length).toBeGreaterThanOrEqual(2);
    });

    // 마크다운 볼드와 HTML 폴백 볼드가 모두 <strong>으로 렌더
    expect(canvas.getByText('바이브 코딩').tagName).toBe('STRONG');
    expect(canvas.getByText('연 매출 5억+').tagName).toBe('STRONG');
    // literal `**`가 화면에 남지 않음
    expect(root?.innerHTML).not.toContain('**');
    // 표·제목·이모티콘 렌더
    expect(root?.querySelector('table')).toBeTruthy();
    expect(root?.querySelector('h2')).toBeTruthy();
    expect(root?.querySelector('img.emoticon-xxl')).toBeTruthy();
  },
};

/**
 * 미리보기(admin `MarkdownContent`) = 학생(`MarkdownContentCore`).
 * 같은 본문에 대해 두 렌더러의 본문 HTML(래퍼 className 제외)이 동일해야 한다.
 */
export const PreviewEqualsStudent: Story = {
  render: () => (
    <div>
      <div data-testid="preview">
        <MarkdownContent content={MIXED_MARKDOWN} />
      </div>
      <div data-testid="student">
        <MarkdownContentCore content={MIXED_MARKDOWN} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const previewRoot = canvasElement.querySelector(
      '[data-testid="preview"] > div',
    );
    const studentRoot = canvasElement.querySelector(
      '[data-testid="student"] > div',
    );

    const normalize = (html: string | undefined): string =>
      (html ?? '').replace(/\s+/g, ' ').trim();

    await waitFor(() => {
      // admin 렌더러는 useEffect에서 innerHTML을 주입하므로 채워질 때까지 대기
      expect(normalize(previewRoot?.innerHTML).length).toBeGreaterThan(0);
      expect(normalize(studentRoot?.innerHTML).length).toBeGreaterThan(0);
    });

    expect(normalize(previewRoot?.innerHTML)).toBe(
      normalize(studentRoot?.innerHTML),
    );
  },
};
