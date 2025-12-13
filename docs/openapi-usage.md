# OpenAPI Generated API 사용 가이드

이 문서는 `src/api/openapi`에 생성된 OpenAPI 클라이언트를 프로젝트에서 일관되게 사용하는 방법을 설명합니다.

## 기본 원칙

- `Configuration`으로 `basePath`를 지정합니다.
- 각 API 클래스 생성자에 `config`와 `config.basePath`를 전달합니다.
- 필요시 `axiosInstance`를 주입해 공통 인증 헤더, 에러 처리 로직을 재사용합니다.
- 응답은 OpenAPI 타입(예: `BaseResponseVoid`, `GroupStudyFullResponseDto`)을 따릅니다.

## 실제 사용 예시

### 1. generateMetadata에서 공개 데이터 조회

```ts
import type { Metadata } from 'next';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { Configuration } from '@/api/openapi/configuration';
import type { GroupStudyFullResponseDto } from '@/api/openapi/models';

interface GroupStudyResponse {
  content?: GroupStudyFullResponseDto;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const config = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    const groupStudyApi = new GroupStudyManagementApi(config, config.basePath);

    const response = await groupStudyApi.getGroupStudy(Number(id));
    const groupStudy = (response.data as GroupStudyResponse)?.content;

    if (!groupStudy) {
      return {
        title: '그룹 스터디 - 제로원',
        description: '제로원 스터디 플랫폼에서 스터디를 둘러보세요.',
      };
    }

    const title = groupStudy.detailInfo?.title || '그룹 스터디';
    const description =
      groupStudy.detailInfo?.description ||
      groupStudy.detailInfo?.summary ||
      '제로원 스터디에 참여하세요.';

    return {
      title: `${title} - 제로원 스터디`,
      description,
      openGraph: {
        title: `${title} - 제로원 스터디`,
        description,
        images: groupStudy.detailInfo?.image?.resizedImages?.[0]
          ?.resizedImageUrl
          ? [groupStudy.detailInfo.image.resizedImages[0].resizedImageUrl]
          : [],
      },
    };
  } catch {
    return {
      title: '그룹 스터디 - 제로원',
      description: '제로원 스터디 플랫폼에서 스터디를 둘러보세요.',
    };
  }
}
```

## 환경변수 설정

Next.js 환경에서 올바른 엔드포인트로 요청하려면 `NEXT_PUBLIC_API_BASE_URL`이 필수입니다.

```bash
export NEXT_PUBLIC_API_BASE_URL=https://test-api.zeroone.it.kr
npm run dev
```

환경변수가 누락되면 `src/api/openapi/base.ts`의 기본값으로 동작합니다.

## 타입 사용

OpenAPI로 자동 생성된 타입들:

```ts
// API 응답 타입
import type { GroupStudyFullResponseDto } from '@/api/openapi/models';
import type { BaseResponseVoid } from '@/api/openapi/models';

// Enum 타입
import { GetGroupStudiesGroupStudyStatusEnum } from '@/api/openapi/api/group-study-management-api';

// 사용 예
const status = GetGroupStudiesGroupStudyStatusEnum.Recruiting;
```

## 참고 문서

- `src/api/openapi/docs/` : 각 API별 상세 문서
- `src/api/openapi/models/` : 자동 생성된 타입 정의
