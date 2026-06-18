# BuilderFeedApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create3**](#create3) | **POST** /api/v5/courses/{courseId}/builder-feeds | BuilderFeed 등록|
|[**createComment**](#createcomment) | **POST** /api/v5/builder-feeds/{feedId}/comments | BuilderFeed 댓글 등록|
|[**deleteBuilderFeed**](#deletebuilderfeed) | **DELETE** /api/v5/builder-feeds/{feedId} | BuilderFeed 삭제|
|[**getComments**](#getcomments) | **GET** /api/v5/builder-feeds/{feedId}/comments | BuilderFeed 댓글 목록 조회|
|[**getFeedDetail**](#getfeeddetail) | **GET** /api/v5/builder-feeds/{feedId} | BuilderFeed 상세 조회|
|[**getFeeds**](#getfeeds) | **GET** /api/v5/courses/{courseId}/builder-feeds | BuilderFeed 목록 조회|
|[**getMyFeeds**](#getmyfeeds) | **GET** /api/v5/members/me/builder-feeds | 내 BuilderFeed 목록 조회|
|[**getMyStats**](#getmystats) | **GET** /api/v5/members/me/builder-feed-stats | 내 BuilderFeed 통계 조회|
|[**getPreviewFeeds**](#getpreviewfeeds) | **GET** /api/v5/lessons/{lessonId}/builder-feeds/preview | 레슨 BuilderFeed preview 조회|
|[**getShowcase**](#getshowcase) | **GET** /api/v5/courses/{courseId}/showcase | BuilderFeed showcase 조회|
|[**report1**](#report1) | **POST** /api/v5/builder-feeds/{feedId}/report | BuilderFeed/댓글 신고|
|[**toggleLike**](#togglelike) | **POST** /api/v5/builder-feeds/{feedId}/like | BuilderFeed 좋아요 토글|
|[**updateBuilderFeed**](#updatebuilderfeed) | **PUT** /api/v5/builder-feeds/{feedId} | BuilderFeed 수정|

# **create3**
> create3(builderFeedCreateRequest)

                FRD C-03.                  코스/레슨 범위의 빌더 피드를 등록합니다.                  이 API는 독립 빌더 피드 작성 화면에서 코스와 레슨 문맥을 선택한 뒤 결과물을 공개 피드로 올리는 진입점입니다. 등록이 끝나면 목록 카드, 상세 화면, 내 피드 모아보기, 레슨 미리보기까지 같은 데이터를 재사용합니다.  ## Narrative - 이 API는 사용자가 자기 결과물을 공개 피드로 올릴 때 호출합니다.   - S-빌더피드작성에서 코스와 레슨을 고르고, 본문과 이미지를 채운 뒤 등록하기를 누르면 이 API가 실행됩니다.   - 등록이 끝나면 목록 카드, 상세, 내 피드, 레슨 미리보기에서 같은 피드를 재사용합니다. - 누가 어떤 레슨에 쓸 수 있는지가 중요합니다.   - 무료수강자는 무료 레슨 결과물만 올릴 수 있고, 결제자와 운영자는 코스 내 전체 레슨을 선택할 수 있습니다.   - 즉 lessonId는 단순 연결값이 아니라 권한 검사 기준이기도 합니다. - 프론트엔드는 성공 후 feedId를 중심으로 다음 화면을 열면 됩니다.   - 등록 직후 상세로 보내거나 목록에 낙관적 추가를 하더라도, 이후에는 상세/목록 재조회로 최종 상태를 맞추는 편이 안전합니다.   - imageKeys는 업로드 API에서 받은 값만 보내야 하므로 화면에서 원본 파일 자체를 직접 넘기면 안 됩니다. - persisted draft를 저장할 때는 optional `status=DRAFT`를 함께 보낼 수 있습니다.   - status를 생략하면 기본값은 `PUBLISHED`입니다.   - draft는 공개 목록/쇼케이스/레슨 미리보기에는 노출되지 않고, 마이페이지 관리형 목록에서만 다시 읽습니다.  ## Screen Preview - 이미지명: S-빌더피드작성   - 이미지 설명: 빌더 피드를 작성할 때 코스 선택, 레슨 선택, 이미지 첨부, 본문 입력, 등록 버튼이 보이는 작성 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드작성.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%9E%91%EC%84%B1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%9E%91%EC%84%B1.png\" alt=\"S-빌더피드작성\" width=\"720\" />  - 이미지명: S-빌더피드목록   - 이미지 설명: 빌더 피드 카드 목록과 필터 문맥을 한 번에 보여주는 공개 피드 목록 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드목록.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EB%AA%A9%EB%A1%9D.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EB%AA%A9%EB%A1%9D.png\" alt=\"S-빌더피드목록\" width=\"720\" />  - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드작성 | | Related Prototype | S-빌더피드목록과 S-빌더피드상세-1은 작성 완료 후 연결되는 후속 화면 예시입니다. | | Related Screen | S-레슨돌아보기의 artifact 제출은 B-01 책임이며, 본 API는 독립 작성 페이지/모달에서 별도 호출됩니다. | | lessonId | 작성 화면의 레슨 선택 dropdown source입니다. | | content | 피드 카드/상세 본문 source입니다. | | imageKeys | 피드 카드 thumbnail 및 S-빌더피드상세 이미지 캐러셀 source입니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | imageKeys는 파일 업로드 endpoint로 먼저 업로드한 뒤 반환된 키만 사용합니다. | | 규칙 | 무료수강신청자는 무료 레슨 범위에서만 작성할 수 있습니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 호출할 수 있습니다. | | 권한 | 무료수강신청자는 무료 레슨만, 결제자/운영자는 코스 내 모든 레슨에 작성할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | lessonId | 결과물을 연결할 레슨입니다. 권한 검사는 이 값을 기준으로 수행합니다. | | content | 피드 카드 본문, 상세 본문, 검색/미리보기의 원문입니다. | | imageKeys | 첨부 이미지 키 목록입니다. 카드 썸네일과 상세 캐러셀 source가 됩니다. | | status | optional 상태값입니다. `DRAFT`면 임시저장, 생략 또는 `PUBLISHED`면 공개 발행입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | feedId | 생성 직후 상세 이동, optimistic UI 동기화, 추적 링크 생성에 사용하는 식별자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | content blank, imageKeys 개수 초과, lessonId 누락 같은 입력 오류입니다. | | 403 | 접근 불가능한 레슨이거나 무료수강 범위를 벗어난 레슨입니다. | | 404 | 코스 또는 레슨을 찾을 수 없습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration,
    BuilderFeedCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let builderFeedCreateRequest: BuilderFeedCreateRequest; //

const { status, data } = await apiInstance.create3(
    courseId,
    builderFeedCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **builderFeedCreateRequest** | **BuilderFeedCreateRequest**|  | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 등록 성공 |  -  |
|**400** | content blank / imageKeys 초과 / courseId·lessonId 불일치 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 레슨 접근 권한 없음 |  -  |
|**404** | 코스 또는 레슨 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createComment**
> createComment(builderFeedCommentCreateRequest)

                FRD C-06.                  BuilderFeed 댓글을 등록합니다.                  댓글 등록은 상세 화면의 참여감을 높이는 상호작용 API입니다. 최상위 댓글과 1-depth 답글 모두 같은 엔드포인트를 쓰며, 생성 직후 다시 목록을 읽어 최신 스레드를 맞추는 구조를 전제로 합니다.  ## Narrative - 이 API는 BuilderFeed 상세에서 댓글이나 답글을 남길 때 호출합니다.   - 사용자는 S-빌더피드상세에서 바로 참여하고, 그 결과가 상세 하단 스레드에 곧바로 반영되어야 합니다.   - 최상위 댓글과 reply 모두 같은 API를 쓰기 때문에 parentCommentId 해석이 중요합니다. - 로그인 사용자만 쓸 수 있는 상호작용 API입니다.   - 비로그인은 401로 막히고, 없는 피드나 잘못된 parentCommentId는 오류가 됩니다.   - 본문 공백도 바로 400 대상입니다. - 프론트엔드는 성공 후 댓글 목록을 다시 읽는 것을 기본 흐름으로 두는 편이 안전합니다.   - commentId만 받아 임시로 붙일 수도 있지만, 최종 정렬과 reply 위치는 서버 목록 기준으로 맞추는 게 덜 위험합니다.   - 상단 commentCount도 같이 다시 맞춰야 상세 숫자가 어긋나지 않습니다.  ## Screen Preview - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  - 이미지명: S-빌더피드상세-2   - 이미지 설명: 빌더 피드 상세 하단 영역으로 댓글 목록과 추가 상호작용이 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-2.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png\" alt=\"S-빌더피드상세-2\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드상세 | | 비고 | 본 API는 상세 하단 댓글 입력창과 답글 입력 UI에서 사용됩니다. | | 비고 | 성공 응답의 commentId는 optimistic UI 댓글 row를 서버 row와 동기화할 때 사용합니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 부모 댓글이 있으면 1-depth reply로 저장됩니다. | | 규칙 | 등록 직후 C-05를 재호출하면 최신 댓글 스레드가 화면에 반영됩니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 댓글과 답글을 작성할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | content | 댓글 본문입니다. | | parentCommentId | 있으면 답글, 없으면 최상위 댓글로 처리합니다. |  ## Response Fields | 필드 | 설명 | |---|---| | commentId | 방금 생성된 댓글 식별자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | content blank, reply depth 위반 같은 입력 오류입니다. | | 401 | 로그인하지 않으면 작성할 수 없습니다. | | 404 | 피드를 찾을 수 없습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration,
    BuilderFeedCommentCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //피드 ID (default to undefined)
let builderFeedCommentCreateRequest: BuilderFeedCommentCreateRequest; //

const { status, data } = await apiInstance.createComment(
    feedId,
    builderFeedCommentCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **builderFeedCommentCreateRequest** | **BuilderFeedCommentCreateRequest**|  | |
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 등록 성공 |  -  |
|**400** | content blank / parentCommentId invalid |  -  |
|**401** | 로그인 필요 |  -  |
|**404** | 피드 또는 부모 댓글 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteBuilderFeed**
> deleteBuilderFeed()

                FRD C-13.                  내가 작성한 BuilderFeed를 삭제 상태로 전환합니다.  ## Narrative - 이 API는 BuilderFeed 상세 또는 내 피드 목록에서 삭제를 확정할 때 호출합니다. - 작성자 본인만 삭제할 수 있습니다.   - 로그인은 필수입니다.   - 타인 피드 삭제 시도는 403입니다. - 삭제는 데이터 파기보다 사용자 노출 종료에 목적이 있습니다.   - BuilderFeed 원본 데이터는 감사/분쟁 대응을 위해 보존합니다.   - 피드/댓글 신고 이력도 함께 보존합니다.   - 사용자 화면에서는 삭제된 피드를 목록/상세/통계 집계에서 제외합니다.  ## Screen Usage | 항목 | 설명 | |---|---| | Primary Screen | BuilderFeed 상세 / 내 피드 목록의 삭제 액션 | | 후처리 | 성공 후 현재 상세를 닫고 목록 또는 이전 화면으로 이동합니다. | | 동기화 | 로컬 캐시의 목록/통계/작성자 슬라이더는 삭제된 피드가 제외되도록 재조회합니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 401 | 로그인 필요 | | 403 | 본인 피드가 아님 | | 404 | 존재하지 않는 feedId | 

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //BuilderFeed ID (default to undefined)

const { status, data } = await apiInstance.deleteBuilderFeed(
    feedId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **feedId** | [**number**] | BuilderFeed ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 피드만 삭제 가능 |  -  |
|**404** | 피드 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getComments**
> getComments()

                FRD C-05.                  BuilderFeed 댓글 목록을 조회합니다.                  상세 화면의 댓글 영역은 이 응답 하나로 스레드, 답글, 역할 배지, 삭제 메뉴 노출 여부를 함께 그립니다. FE는 이 모델을 그대로 사용해 댓글 목록을 다시 렌더링하면 됩니다.  ## Narrative - 이 API는 BuilderFeed 상세의 댓글 구역만 따로 새로고침할 때 호출합니다.   - S-빌더피드상세 하단은 본문과 별개로 댓글이 자주 변하므로, 상세 전체보다 댓글만 가볍게 다시 읽는 용도로 쓰기 좋습니다.   - 최상위 댓글과 1-depth 답글을 한 번에 받아 스레드를 그립니다. - 공개 조회지만 메뉴 노출은 로그인 사용자 기준이 섞여 있습니다.   - 비회원도 댓글은 읽을 수 있습니다.   - canDelete 같은 값은 현재 로그인한 사람이 자기 댓글을 지울 수 있는지 알려주는 개인화 메타입니다. - 프론트엔드는 replies 구조를 그대로 써야 합니다.   - 더 깊은 중첩을 자체적으로 만들지 말고 1-depth 스레드 UI로 해석하면 됩니다.   - 댓글 등록 직후에는 이 API를 다시 불러 최신 스레드를 맞추는 흐름이 가장 단순합니다.  ## Screen Preview - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  - 이미지명: S-빌더피드상세-2   - 이미지 설명: 빌더 피드 상세 하단 영역으로 댓글 목록과 추가 상호작용이 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-2.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png\" alt=\"S-빌더피드상세-2\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드상세 | | comments[] | 댓글 스레드 리스트 source입니다. | | replies[] | 1-depth 답글 렌더링 source입니다. | | author.role | 역할 배지(BUILDER/MANAGER) 노출 판단 source입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 댓글과 1-depth reply를 생성 시각 오름차순으로 반환합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 비회원도 조회할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | comments[] | 최상위 댓글 목록입니다. | | comments[].replies[] | 1-depth 답글 목록입니다. 더 깊은 중첩은 허용하지 않습니다. | | comments[].canDelete | 현재 로그인 사용자가 댓글 삭제 메뉴를 볼 수 있는지 나타냅니다. | | comments[].createdAt | 작성 시각이며 FE 정렬 메타와 상대시간 표시에 사용합니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 404 | 피드를 찾을 수 없으면 댓글 목록도 조회할 수 없습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //피드 ID (default to undefined)

const { status, data } = await apiInstance.getComments(
    feedId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 피드 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFeedDetail**
> getFeedDetail()

                FRD C-02.                  BuilderFeed 상세를 조회합니다.                  BuilderFeed 상세는 공개 피드 소비의 canonical read model입니다. 목록, 쇼케이스, 레슨 미리보기에서 들어오더라도 최종적으로는 이 응답으로 본문과 상호작용 상태를 해석합니다.  ## Narrative - 이 API는 BuilderFeed를 실제로 읽는 최종 상세 모델입니다.   - 목록, 쇼케이스, 레슨 미리보기에서 어떤 경로로 들어와도 결국 S-빌더피드상세는 이 응답으로 그립니다.   - 본문, 이미지, 작성자, 좋아요 수, 댓글 수, 내가 좋아요 눌렀는지까지 한 번에 받습니다. - 공개 조회지만 일부 값은 로그인 사용자 기준으로 달라집니다.   - 비회원도 본문과 카운트는 볼 수 있습니다.   - 다만 isLiked 같은 개인화 값은 로그인 사용자 기준으로만 의미가 있으니 비로그인은 false로 해석하면 됩니다. - 프론트엔드는 목록 카드에서 보던 일부 값을 상세 값으로 덮어써야 합니다.   - 상세 진입 뒤에는 card 요약보다 detail 응답이 우선입니다.   - courseId, lessonId는 뒤로가기나 관련 피드 탐색 문맥으로 같이 보관하면 됩니다. - draft가 도입된 뒤에도 공개 소비자는 `PUBLISHED` 피드만 조회합니다.   - 단, 작성자 본인은 마이페이지 draft 이어쓰기 흐름에서 자신의 `DRAFT` feed 상세를 다시 읽을 수 있습니다.  ## Screen Preview - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  - 이미지명: S-빌더피드상세-2   - 이미지 설명: 빌더 피드 상세 하단 영역으로 댓글 목록과 추가 상호작용이 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-2.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png\" alt=\"S-빌더피드상세-2\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드상세 | | content / imageUrls | 상세 본문과 이미지 영역 source입니다. | | author | 상단 작성자 헤더 source입니다. | | likeCount / commentCount | 액션 바 카운터 source입니다. | | isLiked | 로그인 사용자 기준 좋아요 버튼 active 상태 source입니다. | | courseId / lessonId | 목록 복귀, 관련 피드 탐색, 신고/댓글 액션의 context source입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 본문, 첨부 이미지, 좋아요/댓글 수, 로그인 사용자 기준 isLiked를 함께 반환합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 비회원도 상세를 볼 수 있습니다. | | 권한 | 비로그인 사용자는 isLiked=false 기준으로 해석하면 됩니다. |  ## Response Fields | 필드 | 설명 | |---|---| | feedId | 상세 진입의 canonical identifier입니다. 목록/쇼케이스/미리보기 모두 이 값을 들고 이동합니다. | | courseId / lessonId | 목록 복귀, 관련 피드 탐색, 레슨 문맥 표시용 식별자입니다. | | imageUrls | 상세 캐러셀에 그대로 렌더링할 공개 이미지 URL 목록입니다. | | author | 작성자 프로필 블록 source입니다. | | createdAt | 작성 시각이며 카드/상세 상대시간 계산 source입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 404 | 삭제되었거나 존재하지 않는 피드는 상세를 열 수 없습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //피드 ID (default to undefined)

const { status, data } = await apiInstance.getFeedDetail(
    feedId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 상세 조회 성공 |  -  |
|**404** | 피드 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFeeds**
> getFeeds()

                FRD C-01.                  BuilderFeed 목록을 조회합니다.                  빌더 피드 목록은 코스 커뮤니티 허브 역할을 하므로 hero 카드, 정렬, 필터, 카드 그리드가 모두 한 응답 안에서 풀립니다. FE는 이 응답을 기준으로 전체/작성자/레슨 단위 재조회를 단순하게 처리할 수 있습니다.  ## Narrative - 이 API는 공개 BuilderFeed 목록 페이지를 그리는 대표 조회입니다.   - S-빌더피드목록에서 상단 요약, 주간 top builder, 카드 그리드를 한 번에 채우는 용도입니다.   - 필터와 정렬을 바꿔도 같은 endpoint를 다시 호출해 목록만 새로 맞추는 구조입니다. - 공개 목록이라 로그인 상태보다 필터 조건이 더 중요합니다.   - 비회원도 같은 목록을 볼 수 있지만, 최신 화면 정책상 비결제 공개 브라우징은 최신 6개까지만 보여주고 하단 구매 유도 paywall을 함께 노출합니다.   - 대신 filter, sort, lessonId, memberId에 따라 같은 코스 안에서도 보이는 범위가 달라질 수 있습니다. - 프론트엔드는 목록 카드 모델을 그대로 써야 합니다.   - feedCountLabel은 화면 카피 source라서 숫자를 따로 조합하지 않는 편이 좋습니다.   - 결과가 비어도 오류가 아니라 정상 empty state이며, hasNext로 무한 스크롤 여부를 판단하면 됩니다.  ## Screen Preview - 이미지명: S-빌더피드목록   - 이미지 설명: 빌더 피드 카드 목록과 필터 문맥을 한 번에 보여주는 공개 피드 목록 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드목록.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EB%AA%A9%EB%A1%9D.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EB%AA%A9%EB%A1%9D.png\" alt=\"S-빌더피드목록\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드목록 | | courseTitle | 화면 상단 코스 제목 source입니다. | | feedCountLabel | 지금까지 N개의 피드가 완성되었어요! 문구 source입니다. | | weeklyTopBuilder | 이번 주 좋아요 가장 많이 받은 빌더 hero 카드 source입니다. | | feeds[] | 3열 피드 카드 그리드 source입니다. | | memberId query | S-빌더피드상세의 작성자님의 다른 피드 슬라이더 재조회에 사용합니다. |  ## Query Rules | 항목 | 설명 | |---|---| | 조회 규칙 | sort는 `LATEST`, `LIKE_COUNT`, `COMMENT_COUNT`, `OLDEST`를 지원하고, 레거시 alias로 `POPULAR`도 허용합니다. | | 조회 규칙 | lessonId는 최신 화면의 레슨 드롭다운 source입니다. memberId는 작성자님의 다른 피드 슬라이더 재조회에 사용합니다. | | 조회 규칙 | 비결제 공개 브라우징은 최신 6개까지만 보여주고 `paywall` metadata를 반환합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 비회원도 목록을 볼 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | courseTitle | 상단 화면 제목입니다. | | feedCountLabel | 누적 피드 개수 카피 source입니다. | | weeklyTopBuilder | 상단 hero 카드용 요약 블록입니다. | | feeds[] | 카드 그리드 row 모델입니다. | | totalCount | 페이지네이션과 empty-state 판단 기준입니다. | | hasNext | 다음 페이지 존재 여부입니다. | | paywall | 하단 `플랜을 구매하세요` 구매 유도 카드 metadata입니다. 결제자/운영자/작성자 보조 조회면 null일 수 있습니다. |  ## Empty / Edge Cases | 상황 | 설명 | |---|---| | 결과 없음 | feeds는 빈 배열, totalCount는 0, hasNext는 false로 해석합니다. | | memberId filter | 작성자님의 다른 피드 슬라이더처럼 좁은 범위 재조회에 사용합니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let sort: string; //정렬. LATEST, LIKE_COUNT, COMMENT_COUNT, OLDEST (legacy alias: POPULAR) (optional) (default to undefined)
let filter: string; //필터. ALL, MY, OPERATOR_PICK (optional) (default to undefined)
let lessonId: number; //특정 레슨 피드만 필터링 (optional) (default to undefined)
let memberId: number; //특정 작성자 피드만 필터링 (optional) (default to undefined)
let page: number; //0-based page (optional) (default to undefined)
let size: number; //page size (optional) (default to undefined)

const { status, data } = await apiInstance.getFeeds(
    courseId,
    sort,
    filter,
    lessonId,
    memberId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **sort** | [**string**] | 정렬. LATEST, LIKE_COUNT, COMMENT_COUNT, OLDEST (legacy alias: POPULAR) | (optional) defaults to undefined|
| **filter** | [**string**] | 필터. ALL, MY, OPERATOR_PICK | (optional) defaults to undefined|
| **lessonId** | [**number**] | 특정 레슨 피드만 필터링 | (optional) defaults to undefined|
| **memberId** | [**number**] | 특정 작성자 피드만 필터링 | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page | (optional) defaults to undefined|
| **size** | [**number**] | page size | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 지원하지 않는 sort/filter 또는 page/size validation |  -  |
|**404** | 코스 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyFeeds**
> getMyFeeds()

                FRD C-08.                  로그인 사용자 본인이 작성한 빌더 피드 목록을 조회합니다.                  내 피드 모아보기는 공개 커뮤니티가 아니라 작성자 본인의 아카이브 화면입니다. 그래서 피드 카드 목록과 함께 empty-state, 더 보기, 상세 이동까지 한 흐름으로 해석할 수 있어야 합니다.  ## Narrative - 이 API는 마이페이지에서 내가 만든 BuilderFeed만 모아볼 때 호출합니다.   - S-클래스-내피드는 공개 피드 전체가 아니라, 내 결과물 아카이브를 보는 화면입니다.   - 작성 순서, 반응 수, 연결된 레슨 문맥을 다시 확인하는 용도로 많이 쓰입니다. - 본인 전용 목록입니다.   - 다른 사람의 피드를 보려면 공개 목록이나 상세 API를 써야 하고, 이 API는 내 세션 기준 결과만 돌려줍니다.   - 비로그인이나 타인 조회 개념은 허용하지 않는 모델입니다. - 프론트엔드는 공용 카드 UI를 재사용해도 되지만 의미는 다르게 봐야 합니다.   - 이 목록은 moderation이나 공개 탐색보다 내 활동 관리에 가깝습니다.   - 빈 배열이면 아직 작성한 피드가 없는 상태로 해석하면 됩니다.  ## Screen Preview - 이미지명: S-마이클래스-내피드   - 이미지 설명: 내가 작성한 빌더 피드 목록과 통계가 모이는 마이 피드 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-마이클래스-내피드.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%ED%94%BC%EB%93%9C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%ED%94%BC%EB%93%9C.png\" alt=\"S-마이클래스-내피드\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-클래스-내피드 | | feeds[] | 본인 피드 카드 그리드 source입니다. | | totalCount | 상단 내 빌더 피드 모아보기 요약 수치 또는 empty-state 분기 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인만 호출할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | feeds[] | 내 피드 카드 목록입니다. | | feeds[].feedId | 상세 이동 식별자입니다. | | feeds[].thumbnailUrl | 카드 대표 이미지입니다. | | totalCount | 상단 요약/empty-state 기준입니다. | | hasNext | 더 보기 버튼 노출 기준입니다. |  ## Query Rules | 항목 | 설명 | |---|---| | 조회 규칙 | 최신순 기준으로 페이지네이션합니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

const { status, data } = await apiInstance.getMyFeeds();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 로그인 필요 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyStats**
> getMyStats()

                FRD C-09.                  로그인 사용자 기준 빌더 피드 통계를 조회합니다.                  내 피드 통계는 마이 클래스 홈과 내 피드 모아보기 상단 카드가 공통으로 쓰는 개인 요약 모델입니다. 같은 사용자가 작성한 피드 수와 반응 누적치를 한 번에 확인하는 용도입니다.  ## Narrative - 이 API는 내 피드 활동을 숫자로 요약해 보여줄 때 호출합니다.   - S-클래스 홈 요약 카드와 S-클래스-내피드 상단 통계 카드가 같은 데이터를 공유합니다.   - 사용자는 이 숫자로 내가 얼마나 결과물을 쌓았는지 빠르게 확인합니다. - 본인 기준 누적 통계입니다.   - 공개 피드 전체 숫자가 아니라, 현재 로그인 사용자와 연결된 피드만 집계합니다.   - 따라서 다른 화면의 전체 likeCount와 직접 합산해 맞추려 하면 안 됩니다. - 프론트엔드는 이 값을 다시 계산하지 않는 편이 좋습니다.   - totalFeedCount, totalLikeCount 같은 값은 이미 화면 카피용 숫자입니다.   - 값이 0이어도 정상 상태이므로 새 사용자 onboarding 문구와 함께 쓰면 됩니다.  ## Screen Preview - 이미지명: S-마이클래스홈   - 이미지 설명: 내 클래스 홈에서 학습 현황과 내 활동 요약이 보이는 마이페이지 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-마이클래스홈.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%88.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%88.png\" alt=\"S-마이클래스홈\" width=\"720\" />  - 이미지명: S-마이클래스-내피드   - 이미지 설명: 내가 작성한 빌더 피드 목록과 통계가 모이는 마이 피드 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-마이클래스-내피드.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%ED%94%BC%EB%93%9C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%ED%94%BC%EB%93%9C.png\" alt=\"S-마이클래스-내피드\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-클래스 요약 카드 | | Related Screen | S-클래스-내피드 상단 통계 3카드 | | feedCount | 게시 작업물 N 카드 source입니다. | | totalLikeCount | 누적 좋아요 N 카드 source입니다. | | totalCommentCount | 받은 댓글 N 카드 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인만 호출할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | feedCount | 내가 작성한 피드 수입니다. | | totalLikeCount | 내가 받은 누적 좋아요 수입니다. | | totalCommentCount | 내가 받은 누적 댓글 수입니다. |  ## Empty / Edge Cases | 상황 | 설명 | |---|---| | 피드가 아직 없음 | 모든 카운터는 0으로 내려와도 정상입니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

const { status, data } = await apiInstance.getMyStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 로그인 필요 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPreviewFeeds**
> getPreviewFeeds()

                FRD C-07.                  레슨 BuilderFeed preview를 조회합니다.                  레슨 상세의 빌더 피드 미리보기는 학습 동기 부여용 보조 surface입니다. 전체 목록으로 넘어가기 전, 지금 레슨과 가장 관련 있는 대표 결과물을 짧게 보여주는 데 목적이 있습니다.  ## Narrative - 이 API는 레슨 상세 우측의 HOT한 BuilderFeed 미리보기를 채울 때 호출합니다.   - S-레슨상세는 학습 중인 사람에게 자극이 되는 결과물 예시를 옆에서 보여주려는 목적이 있습니다.   - 그래서 깊은 상세가 아니라, 클릭을 유도할 만큼만 가볍게 보여주는 preview 모델을 반환합니다. - 레슨 접근 권한이 있는 사람만 볼 수 있는 미리보기입니다.   - 무료수강자는 무료 레슨에서만, 결제자는 전체 레슨에서 이 영역을 볼 수 있습니다.   - 즉 공개 목록 API와 다르게 lesson 접근 권한이 먼저 열려 있어야 합니다. - 프론트엔드는 preview를 상세 축약 카드로 해석하면 됩니다.   - 카드 클릭 후에는 반드시 C-02 상세 API로 넘어가야 합니다.   - 결과가 비어 있으면 추천 피드 없음 상태를 그리면 되고, 오류로 취급할 필요는 없습니다.  ## Screen Preview - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨상세 우측 사이드바 빌더 피드 미리보기 | | feeds[] | 사이드바 카드 슬라이더 source입니다. | | totalCount | 전체 보기 또는 N개의 피드 문구 source입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 레슨 상세 하단/사이드 preview 영역용으로 최신 대표 피드와 totalCount를 반환합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 레슨 접근 가능한 사용자만 호출할 수 있습니다. | | 권한 | 무료수강신청자는 무료 레슨 범위에서만 preview를 볼 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | feeds[] | 사이드바에 노출할 대표 피드 카드 목록입니다. | | feeds[].feedId | 카드 클릭 시 상세 이동에 사용합니다. | | totalCount | 전체 보기 링크와 요약 카피 source입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 403 | 레슨 접근 권한이 없으면 preview도 조회할 수 없습니다. | | 404 | 레슨을 찾을 수 없으면 preview를 구성할 수 없습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getPreviewFeeds(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**403** | 레슨 접근 권한 없음 |  -  |
|**404** | 레슨 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getShowcase**
> getShowcase()

                FRD C-10.                  코스 소개 화면에서 노출하는 대표 showcase 피드 묶음을 반환합니다.                  코스 랜딩에서는 첫인상 갤러리와 수강생 결과물 슬라이더가 같은 큐레이션 소스를 공유하므로, 이 API는 썸네일 중심 카드와 피드형 카드가 함께 쓸 수 있는 showcase 모델을 반환합니다.  ## Narrative - 이 API는 코스 소개 화면에 대표 결과물 몇 개만 가볍게 보여주기 위한 showcase 조회입니다.   - S-코스상세-A/B에서 “이 코스를 완주하면 이런 걸 만들 수 있어요” 같은 구역을 채울 때 씁니다.   - 상단 갤러리는 첫인상과 썸네일이 더 중요하지만, 중단 슬라이더는 작성자/본문 일부/카운터도 필요해서 그 필드까지 함께 내려옵니다. - 공개 랜딩용 응답입니다.   - 비회원과 로그인 사용자가 같은 showcase를 봅니다.   - 운영자가 isFeatured와 isFeaturedOrder로 골라둔 피드가 우선 노출됩니다. - 프론트엔드는 이 결과를 목록과 상세의 중간 모델로 보면 됩니다.   - 카드 클릭 시 feedId를 들고 상세로 이동하면 되고, 여기서 댓글 목록 같은 깊은 상세까지 기대하면 안 됩니다.   - 대신 `S-코스상세-B` 카드에 필요한 작성자/본문 일부/좋아요·댓글 count는 이미 함께 내려옵니다.   - 빈 배열이면 쇼케이스 섹션을 숨기거나 placeholder를 보여주면 됩니다.  ## Screen Preview - 이미지명: S-코스상세-A   - 이미지 설명: 코스 상세 상단에서 코스 소개와 가격·CTA 카드가 함께 보이는 대표 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-A.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-A.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-A.png\" alt=\"S-코스상세-A\" width=\"720\" />  - 이미지명: S-코스상세-B   - 이미지 설명: 코스 상세 중간 영역에서 커리큘럼과 연관 콘텐츠가 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-B.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png\" alt=\"S-코스상세-B\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-코스상세-A의 이 코스를 완주하면 이런 걸 만들 수 있어요 갤러리 | | Related Screen | S-코스상세-B의 실제 수강생이 만든 결과물이에요 슬라이더 | | items[].feedId | 카드 클릭 시 S-빌더피드상세 진입에 사용됩니다. | | 비고 | items[].thumbnailUrl/대표 텍스트 계열 필드가 있다면 코스 소개 갤러리 thumbnail/card copy source입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 본 API는 showcase 카드용 read model이며, C-02 전체 상세를 대체하지는 않지만 `S-코스상세-B` 카드에 필요한 작성자/본문 일부/좋아요·댓글 count까지는 함께 제공합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 코스 소개 랜딩에서 비회원도 호출할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | items[] | 갤러리/슬라이더 카드 목록입니다. | | items[].feedId | 카드 클릭 시 상세 이동에 재사용하는 식별자입니다. | | items[].thumbnailUrl | 코스 소개 카드 대표 이미지입니다. | | items[].title / items[].description | 상단 갤러리 카드 텍스트 source입니다. | | items[].author / items[].content / items[].likeCount / items[].commentCount | `S-코스상세-B` 수강생 결과물 카드 source입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 운영자 큐레이션 기준으로 노출 순서가 정해집니다. | | 규칙 | 댓글 목록과 좋아요 토글 상태 같은 깊은 상호작용은 상세 API가 책임집니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getShowcase(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 코스 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **report1**
> report1(builderFeedReportCreateRequest)

                FRD C-11.                  BuilderFeed 또는 댓글 신고를 등록합니다.                  신고는 운영 moderation 흐름으로 이어지는 입력 API입니다. UI는 메뉴/모달/토스트를 책임지고, 서버는 중복 방지와 대상 식별을 확정해 저장하는 역할을 맡습니다.  ## Narrative - 이 API는 피드나 댓글을 신고할 때 호출합니다.   - S-빌더피드상세의 more menu에서 커뮤니티 품질 관리를 위해 쓰는 moderation 입력입니다.   - 신고를 저장하는 역할만 하고, 이후 숨김 처리나 제재는 다른 운영 흐름이 맡습니다. - 본인 콘텐츠인지, 이미 신고했는지 같은 조건이 중요합니다.   - 로그인 사용자만 신고할 수 있고, 자기 글이나 자기 댓글 신고는 막힐 수 있습니다.   - 같은 대상을 같은 사람이 반복 신고하면 409로 거절될 수 있습니다. - 프론트엔드는 성공 시 단순 완료 UX로 닫으면 됩니다.   - 신고했다고 화면 데이터를 바로 바꿀 필요는 없습니다.   - 다만 중복 신고나 본인 신고 불가 코드는 사용자 메시지를 다르게 보여주는 게 좋습니다.  ## Screen Preview - 이미지명: S-빌더피드신고   - 이미지 설명: 빌더 피드를 신고할 때 사유를 선택하고 제출하는 신고 다이얼로그 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드신고.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%8B%A0%EA%B3%A0.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%8B%A0%EA%B3%A0.png\" alt=\"S-빌더피드신고\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드상세의 신고 메뉴 | | 비고 | feedId 기반 신고는 피드 more menu, commentId 기반 신고는 댓글 more menu에서 호출합니다. | | 비고 | 서버는 신고 처리 여부만 담당하며, 신고 후 성공 toast/메뉴 닫기 UX는 FE 책임입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 신고할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | targetType | FEED 또는 COMMENT 입니다. | | feedId | 피드 신고 시 필수입니다. | | commentId | 댓글 신고 시 필수입니다. | | reason | 신고 사유 원문입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | targetType과 식별자 조합이 맞지 않습니다. | | 409 | 같은 사용자가 같은 대상을 중복 신고했습니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration,
    BuilderFeedReportCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //피드 ID (default to undefined)
let builderFeedReportCreateRequest: BuilderFeedReportCreateRequest; //

const { status, data } = await apiInstance.report1(
    feedId,
    builderFeedReportCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **builderFeedReportCreateRequest** | **BuilderFeedReportCreateRequest**|  | |
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 신고 성공 |  -  |
|**400** | reason blank / commentId not in feed |  -  |
|**401** | 로그인 필요 |  -  |
|**404** | 피드 또는 댓글 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleLike**
> toggleLike()

                FRD C-04.                  BuilderFeed 좋아요를 토글합니다.                  좋아요 토글은 상세 액션 바에서 시작되지만, 실제로는 목록 카드와 작성자 다른 피드 슬라이더까지 함께 동기화되는 공통 상호작용입니다. FE는 응답의 active와 likeCount를 기준으로 즉시 반영하면 됩니다.  ## Narrative - 이 API는 BuilderFeed 좋아요 버튼을 켜고 끌 때 호출합니다.   - S-빌더피드상세에서 가장 자주 눌리는 가벼운 상호작용이라 응답도 단순합니다.   - 같은 버튼을 다시 누르면 취소되는 토글 구조입니다. - 로그인 사용자만 의미가 있습니다.   - 비로그인은 먼저 로그인 유도로 보내는 편이 자연스럽습니다.   - 성공 응답은 현재 active 상태와 최종 likeCount를 같이 주므로, 이전 상태를 따로 기억할 필요가 없습니다. - 프론트엔드는 카운트와 active를 이 응답으로 바로 덮어쓰면 됩니다.   - optimistic UI를 쓰더라도 최종 값은 응답 기준으로 맞춰야 합니다.   - 상세와 목록 카드가 동시에 열려 있다면 두 화면의 likeCount도 같이 동기화해야 합니다.  ## Screen Preview - 이미지명: S-빌더피드상세-1   - 이미지 설명: 빌더 피드 상세 상단 영역으로 본문, 작성자 정보, 좋아요와 댓글 진입부가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-1.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-1.png\" alt=\"S-빌더피드상세-1\" width=\"720\" />  - 이미지명: S-빌더피드상세-2   - 이미지 설명: 빌더 피드 상세 하단 영역으로 댓글 목록과 추가 상호작용이 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-빌더피드상세-2.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C%EC%83%81%EC%84%B8-2.png\" alt=\"S-빌더피드상세-2\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-빌더피드상세 | | active | 좋아요 버튼 active/inactive 상태 source입니다. | | likeCount | 상세 액션 바 좋아요 수 즉시 갱신 source입니다. | | 비고 | 목록 카드/작성자 다른 피드 슬라이더의 좋아요 수 refresh도 이 값을 기준으로 맞춥니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 좋아요를 토글할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | active | 현재 사용자의 좋아요 활성화 상태입니다. | | likeCount | 토글 후 최종 좋아요 수입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 같은 사용자가 다시 누르면 취소됩니다. | | 규칙 | 상세, 목록 카드, 작성자 다른 피드 슬라이더는 이 결과로 동기화합니다. |  

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //피드 ID (default to undefined)

const { status, data } = await apiInstance.toggleLike(
    feedId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 토글 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**404** | 피드 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBuilderFeed**
> updateBuilderFeed(builderFeedUpdateRequest)

                FRD C-12.                  내가 작성한 BuilderFeed 본문과 첨부 이미지를 수정합니다.  ## Narrative - 이 API는 BuilderFeed 상세 또는 내 피드 목록에서 \"수정\" 액션을 눌렀을 때 호출합니다. - 작성자 본인만 수정할 수 있습니다.   - 로그인은 필수입니다.   - 타인 피드를 수정하려고 하면 403입니다. - 수정은 전체 덮어쓰기입니다.   - `content`는 canonical 본문을 교체합니다.   - `imageKeys`는 수정 후 최종 첨부 이미지 목록 전체를 전달해야 합니다.   - 빠진 key는 제거된 것으로 해석합니다. - persisted draft가 도입된 뒤에는 optional `status`로 임시저장/공개 전환을 함께 제어할 수 있습니다.   - `status=DRAFT`는 임시저장 유지/갱신입니다.   - `status=PUBLISHED` 또는 생략은 공개 상태를 의미합니다.  ## Screen Usage | 항목 | 설명 | |---|---| | Primary Screen | BuilderFeed 상세 / 내 피드 목록의 수정 액션 | | 작성 제한 | 본인 피드만 수정 가능 | | 동기화 | 성공 후 상세·목록·작성자 슬라이더를 다시 읽어 최신 미리보기와 이미지 순서를 맞춥니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | content blank, imageKeys 10개 초과 | | 401 | 로그인 필요 | | 403 | 본인 피드가 아님 | | 404 | 존재하지 않는 feedId | 

### Example

```typescript
import {
    BuilderFeedApi,
    Configuration,
    BuilderFeedUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new BuilderFeedApi(configuration);

let feedId: number; //BuilderFeed ID (default to undefined)
let builderFeedUpdateRequest: BuilderFeedUpdateRequest; //

const { status, data } = await apiInstance.updateBuilderFeed(
    feedId,
    builderFeedUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **builderFeedUpdateRequest** | **BuilderFeedUpdateRequest**|  | |
| **feedId** | [**number**] | BuilderFeed ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | content blank / imageKeys invalid |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 피드만 수정 가능 |  -  |
|**404** | 피드 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

