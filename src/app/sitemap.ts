import type { MetadataRoute } from 'next';
import {
  GroupStudyManagementApi,
  GetGroupStudiesStatusesEnum,
} from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import type { GroupStudyListItemDto } from '@/api/openapi/models';
import { fetchArticles } from '@/api/strapi/api/fetch-articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.zeroone.it.kr';

  // 정적 페이지
  // 우선순위 및 갱신 빈도에 따라 설정
  // priority: 1.0 (가장 중요), 0.5 (중간), 0.1 (낮음)
  // changeFrequency: always, hourly, daily, weekly, monthly, yearly, never
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0, // 홈페이지는 최우선
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // 높음
    },
    {
      url: `${baseUrl}/study`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // 높음 (스터디 리스트는 자주 변경)
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // 높음 (블로그 콘텐츠)
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
        [GetGroupStudiesStatusesEnum.InProgress],
      ),
      groupStudyApi.getGroupStudies(
        'PREMIUM_STUDY',
        1,
        100,
        undefined,
        undefined,
        undefined,
        [GetGroupStudiesStatusesEnum.InProgress],
      ),
    ]);

    const normalStudyItems: GroupStudyListItemDto[] =
      normalStudies.data?.content?.content ?? [];
    const premiumStudyItems: GroupStudyListItemDto[] =
      premiumStudies.data?.content?.content ?? [];
    const allStudies: GroupStudyListItemDto[] = [
      ...normalStudyItems,
      ...premiumStudyItems,
    ];

    studyPages.push(
      ...allStudies
        .filter((item) => item.basicInfo?.groupStudyId)
        .map((item) => ({
          url: `${baseUrl}/study/${item.basicInfo!.groupStudyId}`,
          lastModified: item.basicInfo?.updatedAt
            ? new Date(item.basicInfo.updatedAt)
            : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7, // 스터디 상세: 중간 우선도
        })),
    );
  } catch (error) {
    console.error('Failed to fetch study pages for sitemap:', error);
  }

  // 동적 페이지: 인사이트 상세 페이지
  const insightPages: MetadataRoute.Sitemap = [];
  try {
    const articlesRes = await fetchArticles({ pageSize: 1000 });
    const articles = articlesRes.data || [];

    insightPages.push(
      ...articles.map((article) => ({
        url: `${baseUrl}/insights/${article.slug}`,
        lastModified: article.updatedAt
          ? new Date(article.updatedAt)
          : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // 인사이트 상세: 중간-높음 우선도
      })),
    );
  } catch (error) {
    console.error('Failed to fetch insight pages for sitemap:', error);
  }

  // Sitemap 병합 및 반환
  // 정적 페이지 → 스터디 페이지 → 인사이트 페이지 순서로 정렬
  return [...staticPages, ...studyPages, ...insightPages];
}
