import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/sign-up',
          '/favicon.ico',
          '/images/',
          '/icons/',
          '/fonts/',
        ],
        disallow: [
          '/my-page',
          '/my-study',
          '/my-study-review',
          '/study',
          '/redirection',
          '/admin',
          '/api/',
          '/_next/',
          '/_vercel/',
        ],
      },
    ],
    sitemap: 'https://www.zeroone.it.kr/sitemap.xml',
  }
}