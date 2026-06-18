# LessonRetrospectiveApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyRetrospective**](#getmyretrospective) | **GET** /api/v5/lessons/{lessonId}/retrospective | 내 레슨 돌아보기 조회|
|[**submit**](#submit) | **POST** /api/v5/lessons/{lessonId}/retrospective | 레슨 돌아보기 제출|

# **getMyRetrospective**
> LessonRetrospectiveResponse getMyRetrospective()

                FRD B-02.                  현재 로그인 사용자가 해당 레슨에 대해 이미 제출한 돌아보기를 조회합니다.                  돌아보기 재조회는 제출 완료 후 읽기 전용 재진입을 위한 모델입니다. 이전에 적은 답변과 실습 인증을 그대로 다시 보여줘야 사용자가 학습 흔적을 확인할 수 있습니다.  ## Narrative - 이 API는 돌아보기 화면에 다시 들어왔을 때 내가 이미 제출했는지 확인하는 조회입니다.   - S-레슨돌아보기는 작성 화면이기도 하지만, 제출 완료 상태를 다시 보여주는 확인 화면이기도 합니다.   - 그래서 highlightAnswer, unexpectedAnswer 같은 실제 작성 내용을 그대로 읽어와야 합니다. - 제출한 본인만 읽을 수 있는 개인 데이터입니다.   - 아직 제출하지 않았거나 권한 없는 사용자는 404/403 성격의 실패를 만나게 됩니다.   - 이 API는 공개 회고 목록이 아니라 내 회고 확인 API라고 보면 됩니다. - 프론트엔드는 결과가 있으면 편집 불가한 완료 상태나 재보기 상태로 해석하면 됩니다.   - retrospectiveId는 동일 제출 건을 식별하는 키로 쓸 수 있습니다.   - null 가능한 답변 필드는 legacy 데이터일 수 있으니 비어 있어도 오류로 보지 말아야 합니다.  ## Screen Preview - 이미지명: S-레슨돌아보기   - 이미지 설명: 레슨 회고 질문과 artifact 입력, 제출 CTA가 있는 돌아보기 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨돌아보기.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%8F%8C%EC%95%84%EB%B3%B4%EA%B8%B0.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%8F%8C%EC%95%84%EB%B3%B4%EA%B8%B0.png\" alt=\"S-레슨돌아보기\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨돌아보기 재진입 | | starRating | 상단 별점 read model source입니다. | | highlightAnswer / unexpectedAnswer | 상단 질문 2개 textarea 재표시 source입니다. | | artifactType / artifactValue | 스크린샷 첨부 또는 링크 입력 선택 상태 source입니다. | | feedback.checklistFlags / feedback.freeText | 체크리스트와 자유 의견 영역 재표시 source입니다. | | submittedAt | 제출 완료 배지/읽기 전용 메타 source입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 미제출 상태면 RETRO_NOT_FOUND(404)를 반환합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 해당 레슨에 제출한 본인만 조회할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | starRating | 제출 당시 별점(1~5)입니다. | | highlightAnswer / unexpectedAnswer | 질문형 답변 2개입니다. | | artifactType / artifactValue | 실습 인증 입력값입니다. | | feedback.checklistFlags | 체크리스트 선택 결과입니다. | | feedback.freeText | 자유 의견입니다. | | submittedAt | 읽기 전용 메타입니다. |  

### Example

```typescript
import {
    LessonRetrospectiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonRetrospectiveApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getMyRetrospective(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**LessonRetrospectiveResponse**

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
|**404** | 미제출 또는 레슨 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submit**
> LessonRetrospectiveCreateResponse submit(lessonRetrospectiveCreateRequest)

                FRD B-01.                  돌아보기 제출은 레슨 완료의 유일한 트리거입니다.                  돌아보기 제출은 단순 폼 저장이 아니라 레슨 완료, 다음 레슨 해금, 자동 BuilderFeed 발행, 완주 전이까지 연결되는 핵심 학습 이벤트입니다. 그래서 입력 검증과 후속 상태 변화가 한 문서 안에서 함께 설명되어야 합니다.  ## Narrative - 이 API는 레슨 학습을 마친 뒤 돌아보기를 제출할 때 호출합니다.   - S-레슨돌아보기에서 별점, 두 질문 답변과 artifact를 확정하는 순간의 핵심 action입니다.   - 이 한 번의 제출이 레슨 완료, 다음 레슨 해금, 마지막 레슨이면 코스 완주까지 이어질 수 있습니다. - 사용자 상태와 레슨 유형에 따라 허용 범위가 갈립니다.   - 결제자는 전체 레슨에서 제출할 수 있고, 무료수강자는 무료 레슨 범위 안에서만 제출할 수 있습니다.   - 이미 제출한 레슨에 다시 보내면 중복 제출 오류로 막힙니다. - 프론트엔드는 성공 응답을 단순 저장 성공으로 보면 부족합니다.   - nextAccessibleLessonId, unlockedNextLesson, isCourseCompleted 같은 후속 상태를 보고 어디로 보낼지 결정해야 합니다.   - feedId가 같이 오면 BuilderFeed 자동 발행 결과까지 연결된 것으로 이해하면 됩니다.  ## Screen Preview - 이미지명: S-레슨돌아보기   - 이미지 설명: 레슨 회고 질문과 artifact 입력, 제출 CTA가 있는 돌아보기 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨돌아보기.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%8F%8C%EC%95%84%EB%B3%B4%EA%B8%B0.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%8F%8C%EC%95%84%EB%B3%B4%EA%B8%B0.png\" alt=\"S-레슨돌아보기\" width=\"720\" />  - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨돌아보기 | | 비고 | request 본문은 별점, 돌아보기 질문 2개, artifact 입력(스크린샷/링크), 체크리스트 6개, 자유 의견 textarea source입니다. | | response isLessonCompleted | 제출 버튼 이후 현재 레슨 완료 badge/상태 갱신 source입니다. | | response nextAccessibleLessonId | 다음 Lesson 넘어가기 CTA 라우팅 source입니다. | | response isCourseCompleted | 모든 레슨 완료 시점의 S-완주 라우팅 분기 source입니다. | | response feedId | 자동 발행된 builder feed 상세/추적 source입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 저장 성공 시 BuilderFeed 자동 발행, 현재 레슨 COMPLETED 전이, 다음 레슨 해금(있으면)까지 같은 트랜잭션에서 처리합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 레슨 접근자만 제출할 수 있습니다. | | 권한 | 무료수강신청자는 무료 레슨 범위에서만 제출할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | starRating | 필수 별점(1~5)입니다. | | highlightAnswer / unexpectedAnswer | 필수 질문형 답변 2개입니다. | | artifactType / artifactValue | 실습 인증이 필요한 레슨에서만 필수입니다. | | feedback.checklistFlags | 선택 시 최소 2개 이상 true여야 합니다. | | feedback.freeText | 선택 자유 의견입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | isLessonCompleted | 현재 레슨 완료 처리 여부입니다. | | nextAccessibleLessonId | 다음 레슨 이동 식별자입니다. 마지막 레슨이면 null 입니다. | | isCourseCompleted | 이번 제출까지 반영한 뒤 모든 레슨 완료 여부입니다. | | feedId | 자동 발행된 BuilderFeed 식별자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | 별점 범위 오류, 필수 답변 누락, artifact 규칙 위반, 체크리스트 규칙 위반입니다. | | 409 | 이미 제출한 레슨입니다. |  

### Example

```typescript
import {
    LessonRetrospectiveApi,
    Configuration,
    LessonRetrospectiveCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonRetrospectiveApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)
let lessonRetrospectiveCreateRequest: LessonRetrospectiveCreateRequest; //

const { status, data } = await apiInstance.submit(
    lessonId,
    lessonRetrospectiveCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonRetrospectiveCreateRequest** | **LessonRetrospectiveCreateRequest**|  | |
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**LessonRetrospectiveCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 제출 성공 |  -  |
|**400** | 유효성 실패 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 수강 권한 없음 |  -  |
|**404** | 레슨 없음 |  -  |
|**409** | 중복 제출 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

