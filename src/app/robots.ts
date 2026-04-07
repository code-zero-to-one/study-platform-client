import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/home',
          '/study',
          '/study/*',
          '/community',
          '/insights',
          '/insights/*',
        ],
        disallow: [
          '/login',
          '/sign-up',
          '/my-page',
          '/my-study',
          '/my-study-review',
          '/redirection',
          '/admin',
          '/admin/*',
          '/api/',
          '/_next/',
          '/_vercel/',
        ],
      },
    ],
    sitemap: 'https://www.zeroone.it.kr/sitemap.xml',
  };
}
