/**
 * HTML 문자열에서 특정 이미지의 src 속성을 찾아서 새로운 값으로 교체합니다.
 */
export const replaceFirstImageSource = ({
  html,
  currentSource,
  nextSource,
}: {
  html: string;
  currentSource: string;
  nextSource: string;
}) => {
  const escapedSource = currentSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const quotedPattern = new RegExp(
    `(<img[^>]*\\bsrc\\s*=\\s*)(["'])${escapedSource}\\2`,
    'i',
  );

  if (quotedPattern.test(html)) {
    return html.replace(
      quotedPattern,
      `$1"${nextSource.replace(/\$/g, '$$$$')}"`,
    );
  }

  const unquotedPattern = new RegExp(
    `(<img[^>]*\\bsrc\\s*=\\s*)${escapedSource}(?=[\\s>])`,
    'i',
  );

  return html.replace(
    unquotedPattern,
    `$1${nextSource.replace(/\$/g, '$$$$')}`,
  );
};

/**
 * HTML 문자열에서 @ 기호를 이스케이프 처리합니다.
 * 단, @@...@@ 형식의 매크로 플레이스홀더는 보호하여 이스케이프하지 않습니다.
 */
export const escapeAtSymbols = (html: string): string => {
  const macroPlaceholders: string[] = [];
  const protectedHtml = html.replace(/@@[^@]+@@/g, (match) => {
    const index = macroPlaceholders.length;
    macroPlaceholders.push(match);

    return `\uFFF0MACRO${index}\uFFF0`;
  });
  const escapedHtml = protectedHtml.replace(/@/g, '\\@');

  return escapedHtml.replace(
    /\uFFF0MACRO(\d+)\uFFF0/g,
    (_, index) => macroPlaceholders[parseInt(index, 10)],
  );
};
