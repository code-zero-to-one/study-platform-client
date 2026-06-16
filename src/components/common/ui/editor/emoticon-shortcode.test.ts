import { describe, expect, it } from 'vitest';
import {
  buildEmoticonToken,
  emoticonNameFromSrc,
  emoticonSizeClass,
  emoticonSizeFromClass,
  replaceEmoticonShortcodes,
} from './emoticon-shortcode';

describe('replaceEmoticonShortcodes', () => {
  it('카탈로그에 있는 :name: 을 emoticon img로 치환한다', () => {
    expect(replaceEmoticonShortcodes(':okay:')).toBe(
      '<img src="/emoticon/okay.png" alt=":okay:" class="emoticon-inline" />',
    );
  });

  it('크기 suffix(_lg/_xl/_xxl)를 해당 class로 변환한다', () => {
    expect(replaceEmoticonShortcodes(':okay_lg:')).toContain(
      'class="emoticon-lg"',
    );
    expect(replaceEmoticonShortcodes(':happy_xxl:')).toContain(
      'class="emoticon-xxl"',
    );
  });

  it('카탈로그에 없는 토큰은 원문 그대로 둔다', () => {
    expect(replaceEmoticonShortcodes(':nope:')).toBe(':nope:');
    expect(replaceEmoticonShortcodes('비율 50:50 입니다')).toBe(
      '비율 50:50 입니다',
    );
  });

  it('대소문자 무관하게 매칭한다', () => {
    expect(replaceEmoticonShortcodes(':OKAY:')).toContain('/emoticon/okay.png');
  });
});

describe('emoticon size helpers', () => {
  it('size 토큰 ↔ class 를 왕복 변환한다', () => {
    expect(emoticonSizeClass('')).toBe('emoticon-inline');
    expect(emoticonSizeClass('lg')).toBe('emoticon-lg');
    expect(emoticonSizeFromClass('emoticon-inline')).toBe('');
    expect(emoticonSizeFromClass('emoticon-xl')).toBe('xl');
    expect(emoticonSizeFromClass('foo emoticon-lg bar')).toBe('lg');
  });

  it('알 수 없는 class 는 기본 size("")로 처리한다', () => {
    expect(emoticonSizeFromClass('not-emoticon')).toBe('');
  });
});

describe('emoticonNameFromSrc', () => {
  it('src 경로에서 카탈로그 name을 역추출한다(대소문자/경로 무관)', () => {
    expect(emoticonNameFromSrc('/emoticon/okay.png')).toBe('okay');
    expect(emoticonNameFromSrc('/emoticon/Question.png')).toBe('question');
    expect(emoticonNameFromSrc('https://x.test/emoticon/Euang.png')).toBe(
      'euang',
    );
  });

  it('카탈로그에 없는 파일은 빈 문자열을 반환한다', () => {
    expect(emoticonNameFromSrc('/emoticon/unknown.png')).toBe('');
  });
});

describe('buildEmoticonToken', () => {
  it('size 가 없으면 name, 있으면 name_size 토큰을 만든다', () => {
    expect(buildEmoticonToken('okay', '')).toBe('okay');
    expect(buildEmoticonToken('okay', 'lg')).toBe('okay_lg');
  });
});
