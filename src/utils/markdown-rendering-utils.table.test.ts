import { describe, expect, it } from 'vitest';
import {
  hasPWrappedMarkdownTable,
  restoreEmptyParagraphsAsLineBreaks,
  unwrapPWrappedMarkdownTables,
} from '@/utils/markdown-rendering-utils';

const malformed =
  '<p>본문</p><p>| 의문 | 사실은 |</p><p>| --- | --- |</p><p>| a | b |</p><p>끝</p>';

describe('p-wrapped markdown table recovery', () => {
  it('detects <p>-wrapped table rows that include a separator row', () => {
    expect(hasPWrappedMarkdownTable(malformed)).toBe(true);
  });

  it('does not flag pure HTML or non-table pipe rows', () => {
    expect(hasPWrappedMarkdownTable('<p>안녕</p><p>둘째 문단</p>')).toBe(false);
    // 구분행(| --- |)이 없으면 표로 보지 않는다
    expect(hasPWrappedMarkdownTable('<p>| a | b |</p><p>| c | d |</p>')).toBe(
      false,
    );
  });

  it('unwraps <p>-wrapped rows into raw markdown table lines', () => {
    const out = unwrapPWrappedMarkdownTables(malformed);
    expect(out).toContain('| 의문 | 사실은 |\n| --- | --- |\n| a | b |');
    expect(out).not.toContain('<p>| 의문');
    // 표 밖 문단은 보존
    expect(out).toContain('<p>본문</p>');
    expect(out).toContain('<p>끝</p>');
  });

  it('leaves content without a p-wrapped table untouched', () => {
    const pure = '<p>안녕 <strong>빌더</strong>입니다.</p>';
    expect(unwrapPWrappedMarkdownTables(pure)).toBe(pure);
  });
});

describe('empty paragraph line breaks', () => {
  it('converts empty <p></p> to <p><br></p> (visible blank line)', () => {
    expect(
      restoreEmptyParagraphsAsLineBreaks('<p>가</p><p></p><p>나</p>'),
    ).toBe('<p>가</p><p><br></p><p>나</p>');
    // 공백만 있는 빈 문단도 처리
    expect(restoreEmptyParagraphsAsLineBreaks('<p>  </p>')).toBe('<p><br></p>');
  });

  it('converts attribute-carrying empty <p> (TipTap/editor 직렬화) too', () => {
    // TipTap/ProseMirror은 빈 문단에 dir/style/class/data-* 를 붙여 직렬화한다
    expect(restoreEmptyParagraphsAsLineBreaks('<p dir="ltr"></p>')).toBe(
      '<p><br></p>',
    );
    expect(
      restoreEmptyParagraphsAsLineBreaks('<p class="x" data-y="z"></p>'),
    ).toBe('<p><br></p>');
    expect(restoreEmptyParagraphsAsLineBreaks('<p style="margin:0"></p>')).toBe(
      '<p><br></p>',
    );
    // &nbsp; 만 든 문단
    expect(restoreEmptyParagraphsAsLineBreaks('<p>&nbsp;</p>')).toBe(
      '<p><br></p>',
    );
    // 멀티 빈 줄(2줄 이상) 모두 보존
    expect(
      restoreEmptyParagraphsAsLineBreaks(
        '<p>가</p><p dir="ltr"></p><p></p><p>나</p>',
      ),
    ).toBe('<p>가</p><p><br></p><p><br></p><p>나</p>');
  });

  it('leaves non-empty paragraphs untouched', () => {
    const html = '<p class="a">안녕 <strong>빌더</strong></p><p>둘째</p>';
    expect(restoreEmptyParagraphsAsLineBreaks(html)).toBe(html);
  });
});
