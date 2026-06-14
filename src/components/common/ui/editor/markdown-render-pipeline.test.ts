import { describe, expect, it } from 'vitest';
import { restoreEmptyParagraphsAsLineBreaks } from './markdown-render-pipeline';

describe('restoreEmptyParagraphsAsLineBreaks', () => {
  it('내용이 없는 빈 단락을 줄바꿈이 보이는 <p><br></p>로 복원한다', () => {
    expect(restoreEmptyParagraphsAsLineBreaks('<p></p>')).toBe('<p><br></p>');
  });

  it('속성이 있는 빈 단락도 복원한다 (TipTap 직렬화 형태)', () => {
    expect(restoreEmptyParagraphsAsLineBreaks('<p dir="ltr"></p>')).toBe(
      '<p><br></p>',
    );
  });

  it('공백/&nbsp;만 있는 단락도 빈 단락으로 간주해 복원한다', () => {
    expect(restoreEmptyParagraphsAsLineBreaks('<p> </p>')).toBe('<p><br></p>');
    expect(restoreEmptyParagraphsAsLineBreaks('<p>&nbsp;</p>')).toBe(
      '<p><br></p>',
    );
    expect(restoreEmptyParagraphsAsLineBreaks('<p>&#160;</p>')).toBe(
      '<p><br></p>',
    );
  });

  it('연속된 빈 단락을 각각 줄바꿈으로 복원한다', () => {
    expect(restoreEmptyParagraphsAsLineBreaks('<p></p><p></p>')).toBe(
      '<p><br></p><p><br></p>',
    );
  });

  it('내용이 있는 단락은 변경하지 않는다', () => {
    const html = '<p>본문</p>';
    expect(restoreEmptyParagraphsAsLineBreaks(html)).toBe(html);
  });

  it('빈 단락과 내용 단락이 섞여 있어도 빈 단락만 복원한다', () => {
    expect(
      restoreEmptyParagraphsAsLineBreaks('<p>첫째 줄</p><p></p><p>셋째 줄</p>'),
    ).toBe('<p>첫째 줄</p><p><br></p><p>셋째 줄</p>');
  });
});
