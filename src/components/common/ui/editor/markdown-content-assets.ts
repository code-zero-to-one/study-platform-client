const getRawMarkdownAssetBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_PROD_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ''
  ).trim();
};

const unwrapMarkdownAssetMacro = (value: string) => {
  const trimmedValue = value.trim();
  const macroMatch = trimmedValue.match(/^@@(.+?)@@$/);

  return macroMatch?.[1]?.trim() ?? trimmedValue;
};

export const resolveMarkdownAssetUrl = (
  value: string,
  assetBaseUrl = getRawMarkdownAssetBaseUrl().replace(/\/api\/v1\/?$/, ''),
) => {
  const assetUrl = unwrapMarkdownAssetMacro(value);

  if (!assetUrl || assetUrl.toUpperCase() === 'LOCAL') {
    return undefined;
  }

  if (
    assetUrl.startsWith('http://') ||
    assetUrl.startsWith('https://') ||
    assetUrl.startsWith('blob:') ||
    assetUrl.startsWith('data:') ||
    assetUrl.startsWith('mailto:') ||
    assetUrl.startsWith('tel:') ||
    assetUrl.startsWith('#')
  ) {
    return assetUrl;
  }

  if (assetUrl.startsWith('/images/') && assetBaseUrl) {
    return `${assetBaseUrl}${assetUrl}`;
  }

  if (assetUrl.startsWith('images/') && assetBaseUrl) {
    return `${assetBaseUrl}/${assetUrl}`;
  }

  if (assetUrl.startsWith('/')) {
    return assetUrl;
  }

  if (assetBaseUrl) {
    return `${assetBaseUrl}/${assetUrl.replace(/^\/+/, '')}`;
  }

  return assetUrl;
};
