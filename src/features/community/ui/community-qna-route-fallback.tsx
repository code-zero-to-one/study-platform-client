'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import PageContainer from '@/components/common/ui/page-container';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { ErrorType, type ErrorInfo } from '@/utils/error-handler';

const COMMUNITY_QNA_ROUTE_ERROR_COPY = {
  [ErrorType.AUTH]: {
    title: '질문을 불러올 권한을 확인하지 못했습니다',
    description:
      '로그인 상태나 권한 정보를 다시 확인한 뒤 같은 질문을 다시 열어 주세요.',
  },
  [ErrorType.CLIENT]: {
    title: '질문 화면을 준비하는 중 문제가 생겼습니다',
    description:
      '브라우저 화면을 새로 고치거나 잠시 후 다시 시도해 주세요. 문제가 계속되면 운영팀에 알려 주세요.',
  },
  [ErrorType.NETWORK]: {
    title: '질문을 불러오는 연결이 불안정합니다',
    description:
      '인터넷 연결이나 서버 연결 상태를 확인한 뒤 다시 시도해 주세요.',
  },
  [ErrorType.SERVER]: {
    title: '서버가 질문을 준비하지 못했습니다',
    description: '일시적인 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.',
  },
  [ErrorType.UNKNOWN]: {
    title: '질문을 불러오는 중 알 수 없는 문제가 발생했습니다',
    description:
      '잠시 후 다시 시도해 주세요. 같은 문제가 반복되면 운영팀에 알려 주세요.',
  },
} as const;

const resolveCommunityQnaRouteErrorCopy = (
  errorInfo?: Pick<ErrorInfo, 'type' | 'userMessage'>,
) => {
  const type = errorInfo?.type ?? ErrorType.UNKNOWN;
  const copy =
    type === ErrorType.AUTH
      ? COMMUNITY_QNA_ROUTE_ERROR_COPY[ErrorType.AUTH]
      : type === ErrorType.CLIENT
        ? COMMUNITY_QNA_ROUTE_ERROR_COPY[ErrorType.CLIENT]
        : type === ErrorType.NETWORK
          ? COMMUNITY_QNA_ROUTE_ERROR_COPY[ErrorType.NETWORK]
          : type === ErrorType.SERVER
            ? COMMUNITY_QNA_ROUTE_ERROR_COPY[ErrorType.SERVER]
            : COMMUNITY_QNA_ROUTE_ERROR_COPY[ErrorType.UNKNOWN];
  const detailMessage =
    errorInfo?.userMessage && errorInfo.userMessage !== copy.description
      ? errorInfo.userMessage
      : undefined;

  return {
    ...copy,
    detailMessage,
  };
};

const CommunityQnaRouteFallbackShell = ({
  actionSlot,
  description,
  detailMessage,
  title,
  visualSlot,
}: {
  actionSlot: React.ReactNode;
  description: string;
  detailMessage?: string;
  title: string;
  visualSlot?: React.ReactNode;
}) => {
  return (
    <PageContainer spacing="fallback">
      <SurfacePanel radius="lg" className="px-300 py-500">
        <div className="flex flex-col items-center gap-250 text-center">
          {visualSlot}

          <div className="flex flex-col gap-100">
            <h1 className="font-designer-24b text-text-strong">{title}</h1>
            <p className="font-designer-14r text-text-subtle">{description}</p>
            {detailMessage ? (
              <p className="font-designer-13r text-text-subtlest">
                {detailMessage}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-100">
            {actionSlot}
          </div>
        </div>
      </SurfacePanel>
    </PageContainer>
  );
};

export function CommunityQnaRouteLoading() {
  return (
    <PageContainer spacing="fallback">
      <SurfacePanel radius="lg" className="px-300 py-500">
        <div className="flex animate-pulse flex-col gap-150">
          <div className="h-300 w-full rounded-100 bg-background-alternative" />
          <div className="h-200 w-full rounded-100 bg-background-alternative" />
          <div className="h-200 w-2/3 rounded-100 bg-background-alternative" />
        </div>
      </SurfacePanel>
    </PageContainer>
  );
}

export function CommunityQnaNotFoundState({ backHref }: { backHref: string }) {
  return (
    <CommunityQnaRouteFallbackShell
      title="질문을 찾을 수 없습니다"
      description="삭제되었거나 주소가 바뀐 질문입니다. 커뮤니티 목록으로 돌아가 다른 질문을 확인해 주세요."
      visualSlot={
        <Image
          src="/images/404.png"
          alt="질문을 찾을 수 없음"
          width={256}
          height={221}
        />
      }
      actionSlot={
        <Button asChild color="primary" size="large">
          <Link href={backHref}>커뮤니티 목록으로 이동</Link>
        </Button>
      }
    />
  );
}

export function CommunityQnaRouteErrorState({
  backHref,
  errorInfo,
  onRetry,
  retryHref,
}: {
  backHref: string;
  errorInfo?: Pick<ErrorInfo, 'type' | 'userMessage'>;
  onRetry?: () => void;
  retryHref?: string;
}) {
  const copy = resolveCommunityQnaRouteErrorCopy(errorInfo);

  return (
    <CommunityQnaRouteFallbackShell
      title={copy.title}
      description={copy.description}
      detailMessage={copy.detailMessage}
      actionSlot={
        <>
          {retryHref ? (
            <Button asChild color="outlined" size="large">
              <Link href={retryHref}>다시 시도</Link>
            </Button>
          ) : onRetry ? (
            <Button color="outlined" size="large" onClick={onRetry}>
              다시 시도
            </Button>
          ) : null}
          <Button asChild color="primary" size="large">
            <Link href={backHref}>커뮤니티 목록으로 이동</Link>
          </Button>
        </>
      }
    />
  );
}
