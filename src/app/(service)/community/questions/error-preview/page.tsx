import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/common/ui/button';
import PageContainer from '@/components/common/ui/page-container';
import {
  COMMUNITY_QNA_ROUTE_PREVIEW_KIND,
  type CommunityQnaRoutePreviewKind,
  getCommunityQnaRoutePreviewErrorInfo,
  isCommunityQnaRoutePreviewKind,
} from '@/features/community/model/community-qna-route-fallback';
import {
  CommunityQnaNotFoundState,
  CommunityQnaRouteErrorState,
  CommunityQnaRouteLoading,
} from '@/features/community/ui/community-qna-route-fallback';

interface CommunityQuestionErrorPreviewPageProps {
  searchParams: Promise<{
    kind?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: 'QnA 에러 화면 미리보기 | ZERO-ONE',
  robots: { index: false, follow: false },
};

const COMMUNITY_QNA_ROUTE_PREVIEW_ITEMS: readonly {
  href: string;
  kind: CommunityQnaRoutePreviewKind;
  label: string;
}[] = [
  {
    href: '/community/questions/error-preview?kind=loading',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.LOADING,
    label: '로딩',
  },
  {
    href: '/community/questions/error-preview?kind=not-found',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NOT_FOUND,
    label: '질문 없음',
  },
  {
    href: '/community/questions/error-preview?kind=network',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NETWORK,
    label: '네트워크',
  },
  {
    href: '/community/questions/error-preview?kind=server',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.SERVER,
    label: '서버',
  },
  {
    href: '/community/questions/error-preview?kind=client',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.CLIENT,
    label: '응답 형식',
  },
  {
    href: '/community/questions/error-preview?kind=auth',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.AUTH,
    label: '권한',
  },
  {
    href: '/community/questions/error-preview?kind=unknown',
    kind: COMMUNITY_QNA_ROUTE_PREVIEW_KIND.UNKNOWN,
    label: '기타',
  },
] as const;

const normalizePreviewKind = (
  value: string | readonly string[] | undefined,
): CommunityQnaRoutePreviewKind => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!isCommunityQnaRoutePreviewKind(rawValue)) {
    return COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NETWORK;
  }

  return rawValue;
};

export default async function CommunityQuestionErrorPreviewPage({
  searchParams,
}: CommunityQuestionErrorPreviewPageProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { kind } = await searchParams;
  const previewKind = normalizePreviewKind(kind);

  return (
    <>
      <PageContainer className="flex flex-col gap-150">
        <div className="flex flex-col gap-100">
          <h1 className="font-designer-24b text-text-strong">
            QnA 에러 화면 미리보기
          </h1>
          <p className="font-designer-14r text-text-subtle">
            아래 상태를 눌러 질문 상세 fallback 화면을 직접 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-100">
          {COMMUNITY_QNA_ROUTE_PREVIEW_ITEMS.map((item) => (
            <Button
              key={item.kind}
              asChild
              color={item.kind === previewKind ? 'primary' : 'outlined'}
              size="medium"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </PageContainer>

      {previewKind === COMMUNITY_QNA_ROUTE_PREVIEW_KIND.LOADING ? (
        <CommunityQnaRouteLoading />
      ) : previewKind === COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NOT_FOUND ? (
        <CommunityQnaNotFoundState backHref="/community" />
      ) : (
        <CommunityQnaRouteErrorState
          backHref="/community"
          errorInfo={getCommunityQnaRoutePreviewErrorInfo(previewKind)}
          retryHref={
            COMMUNITY_QNA_ROUTE_PREVIEW_ITEMS.find(
              (item) => item.kind === previewKind,
            )?.href
          }
        />
      )}
    </>
  );
}
