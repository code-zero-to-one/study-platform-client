import type { MetadataRoute } from 'next';
import { Configuration } from '@/api/openapi/configuration';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import type { GroupStudyBasicInfoResponseDto } from '@/api/openapi/models';
import { fetchArticles } from '@/api/strapi/api/fetch-articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.zeroone.it.kr';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/study`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // 동적 페이지: 스터디 상세 페이지
  const studyPages: MetadataRoute.Sitemap = [];
  try {
    const config = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
    const groupStudyApi = new GroupStudyManagementApi(config, config.basePath);

    // 진행 중인 스터디만 가져오기 (inProgress: true)
    // 일반 그룹 스터디와 프리미엄 스터디 모두 조회
    const [normalStudies, premiumStudies] = await Promise.all([
      groupStudyApi.getGroupStudies(
        'GROUP_STUDY',
        1,
        100,
        undefined,
        undefined,
        undefined,
        true,
      ),
      groupStudyApi.getGroupStudies(
        'PREMIUM_STUDY',
        1,
        100,
        undefined,
        undefined,
        undefined,
        true,
      ),
    ]);

    const allStudies = [
      ...((normalStudies.data?.content as GroupStudyBasicInfoResponseDto[]) ||
        []),
      ...((premiumStudies.data?.content as GroupStudyBasicInfoResponseDto[]) ||
        []),
    ];

    studyPages.push(
      ...allStudies
        .filter((study) => study.groupStudyId)
        .map((study) => ({
          url: `${baseUrl}/study/${study.groupStudyId}`,
          lastModified: study.updatedAt
            ? new Date(study.updatedAt)
            : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        })),
    );
  } catch (error) {
    console.error('Failed to fetch study pages for sitemap:', error);
  }

  // 동적 페이지: 인사이트 상세 페이지
  const insightPages: MetadataRoute.Sitemap = [];
  try {
    const articlesRes = await fetchArticles();
    const articles = articlesRes.data || [];

    insightPages.push(
      ...articles.map((article) => ({
        url: `${baseUrl}/insights/${article.slug}`,
        lastModified: article.updatedAt
          ? new Date(article.updatedAt)
          : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    );
  } catch (error) {
    console.error('Failed to fetch insight pages for sitemap:', error);
  }

  return [...staticPages, ...studyPages, ...insightPages];
}
