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
export const EMOTICON_SIZE_CLASS: Record<string, string> = {
  '': 'emoticon-inline',
  lg: 'emoticon-lg',
  xl: 'emoticon-xl',
  xxl: 'emoticon-xxl',
};

const EMOTICON_CLASS_TO_SIZE: Record<string, string> = Object.fromEntries(
  Object.entries(EMOTICON_SIZE_CLASS).map(([size, className]) => [
    className,
    size,
  ]),
);

const EMOTICON_FILE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(EMOTICON_CATALOG).map(([name, file]) => [
    file.toLowerCase(),
    name,
  ]),
);

const EMOTICON_SHORTCODE_REGEX = /:([a-zA-Z][a-zA-Z0-9_-]*):/g;
const SIZE_SUFFIX_REGEX = /^(.+?)_(lg|xl|xxl)$/;
const EMOTICON_TOKEN_ALT_REGEX = /^:([a-zA-Z][a-zA-Z0-9_-]*):$/;

export const parseEmoticonToken = (
  token: string,
): { name: string; size: string } => {
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

/** size 토큰('' | lg | xl | xxl)을 emoticon CSS class로 변환한다. */
export const emoticonSizeClass = (size: string): string =>
  EMOTICON_SIZE_CLASS[size] ?? EMOTICON_SIZE_CLASS[''];

/** emoticon class 문자열에서 size 토큰을 역추출한다. */
export const emoticonSizeFromClass = (className: string): string => {
  const sizeClass =
    className.split(/\s+/).find((token) => token.startsWith('emoticon-')) ??
    'emoticon-inline';
  return EMOTICON_CLASS_TO_SIZE[sizeClass] ?? '';
};

/** `/emoticon/okay.png` 같은 src에서 카탈로그 name을 역추출한다(없으면 ''). */
export const emoticonNameFromSrc = (src: string): string => {
  const file = (src.split('/').pop() ?? '').toLowerCase();
  return EMOTICON_FILE_TO_NAME[file] ?? '';
};

/** name + size를 본문 shortcode 토큰(`okay`, `okay_lg`)으로 만든다. */
export const buildEmoticonToken = (name: string, size: string): string =>
  size ? `${name}_${size}` : name;

/**
 * 에디터가 렌더한 emoticon `<img>`를 다시 `:name:` shortcode 텍스트로 직렬화한다.
 * (에디터에선 이미지로 보여주되 저장 본문은 shortcode로 유지하기 위함)
 * emoticon 외 이미지는 건드리지 않는다.
 */
export const serializeEmoticonImagesToShortcodes = (html: string): string => {
  if (!html || !html.includes('emoticon-') || typeof window === 'undefined') {
    return html;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  let changed = false;

  document.querySelectorAll('img[class*="emoticon-"]').forEach((image) => {
    const alt = image.getAttribute('alt') ?? '';
    const altMatch = alt.match(EMOTICON_TOKEN_ALT_REGEX);
    let token = altMatch?.[1];

    if (!token) {
      const name = emoticonNameFromSrc(image.getAttribute('src') ?? '');
      if (name) {
        token = buildEmoticonToken(
          name,
          emoticonSizeFromClass(image.getAttribute('class') ?? ''),
        );
      }
    }

    if (
      token &&
      EMOTICON_CATALOG[parseEmoticonToken(token).name.toLowerCase()]
    ) {
      image.replaceWith(document.createTextNode(`:${token}:`));
      changed = true;
    }
  });

  return changed ? document.body.innerHTML : html;
};
