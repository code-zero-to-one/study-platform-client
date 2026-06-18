/**
 * 사이트 공용 캐릭터 이모티콘 카탈로그.
 * key는 본문 shortcode(`:okay:` 등)이며 lowercase로 정규화해 비교한다.
 * value는 `public/emoticon/` 하위 실제 파일명이다.
 */
export const EMOTICON_CATALOG: Record<string, string> = {
  aha: 'aha.png',
  angry: 'angry.png',
  best: 'best.png',
  coffee: 'coffee.png',
  crying: 'crying.png',
  difficult: 'difficult.png',
  euang: 'Euang.png',
  expect: 'expect.png',
  happy: 'happy.png',
  hard: 'hard.png',
  hiding: 'hiding.png',
  hustle: 'hustle.png',
  joyful: 'joyful.png',
  medallion: 'medallion.png',
  okay: 'okay.png',
  question: 'Question.png',
  study: 'study.png',
  surprised: 'surprised.png',
  welcome: 'welcome.png',
  what: 'what.png',
};

/**
 * size suffix → CSS class. catalog 외 토큰은 기본 emoticon-inline.
 * - 기본(suffix 없음): 24px, 본문 인라인용
 * - _lg: 48px
 * - _xl: 96px
 * - _xxl: 150px, 강조 단독 배치용
 */
const EMOTICON_SIZE_CLASS: Record<string, string> = {
  '': 'emoticon-inline',
  lg: 'emoticon-lg',
  xl: 'emoticon-xl',
  xxl: 'emoticon-xxl',
};

const EMOTICON_SHORTCODE_REGEX = /:([a-zA-Z][a-zA-Z0-9_-]*):/g;
const SIZE_SUFFIX_REGEX = /^(.+?)_(lg|xl|xxl)$/;

const parseEmoticonToken = (token: string): { name: string; size: string } => {
  const match = token.match(SIZE_SUFFIX_REGEX);
  if (match) {
    return { name: match[1], size: match[2] };
  }
  return { name: token, size: '' };
};

/**
 * 본문에 박힌 `:name:` / `:name_lg:` / `:name_xl:` / `:name_xxl:` shortcode를 emoticon `<img>`로 치환한다.
 * catalog에 없는 토큰은 그대로 둔다(원문 보존).
 */
export const replaceEmoticonShortcodes = (input: string): string => {
  if (!input || !input.includes(':')) {
    return input;
  }

  return input.replace(EMOTICON_SHORTCODE_REGEX, (match, token: string) => {
    const { name, size } = parseEmoticonToken(token);
    const fileName = EMOTICON_CATALOG[name.toLowerCase()];
    if (!fileName) {
      return match;
    }

    const className = EMOTICON_SIZE_CLASS[size] ?? EMOTICON_SIZE_CLASS[''];
    return `<img src="/emoticon/${fileName}" alt=":${token}:" class="${className}" />`;
  });
};
