# AdminCourseContentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**batchUpdateLessons**](#batchupdatelessons) | **PATCH** /api/v5/admin/courses/{courseId}/lessons/batch | 어드민 레슨 batch 수정|
|[**bulkUpdateLessons**](#bulkupdatelessons) | **PATCH** /api/v5/admin/courses/{courseId}/lessons/bulk | 어드민 레슨 bulk 수정|
|[**createAdminLessonQnaAnswer**](#createadminlessonqnaanswer) | **POST** /api/v5/admin/qnas/{qnaId}/answers | 어드민 질문 답변 등록|
|[**createCourse**](#createcourse) | **POST** /api/v5/admin/courses | 어드민 코스 생성|
|[**createCoursePlan**](#createcourseplan) | **POST** /api/v5/admin/courses/{courseId}/plans | 어드민 코스 플랜 생성|
|[**createLesson**](#createlesson) | **POST** /api/v5/admin/courses/{courseId}/lessons | 어드민 레슨 생성|
|[**createLessonsFromNotionZips**](#createlessonsfromnotionzips) | **POST** /api/v5/admin/courses/{courseId}/lessons/imports/notion-zips | Notion ZIP 다건 레슨 생성|
|[**deactivateCoursePlan**](#deactivatecourseplan) | **PATCH** /api/v5/admin/courses/{courseId}/plans/{planId}/inactive | 어드민 코스 플랜 비활성화|
|[**deleteCourse**](#deletecourse) | **DELETE** /api/v5/admin/courses/{courseId} | 어드민 코스 삭제|
|[**deleteLesson**](#deletelesson) | **DELETE** /api/v5/admin/lessons/{lessonId} | 어드민 레슨 삭제|
|[**generateLessonContentImageUploadUrl**](#generatelessoncontentimageuploadurl) | **POST** /api/v5/admin/lessons/{lessonId}/content-images/upload-url | 어드민 레슨 본문 이미지 업로드 URL 발급|
|[**getCompletionMessage**](#getcompletionmessage) | **GET** /api/v5/admin/courses/{courseId}/completion-message | 어드민 완주 메시지 조회|
|[**getCourseDetail**](#getcoursedetail) | **GET** /api/v5/admin/courses/{courseId} | 어드민 코스 상세 조회|
|[**getCoursePlans**](#getcourseplans) | **GET** /api/v5/admin/courses/{courseId}/plans | 어드민 코스 플랜 목록 조회|
|[**getCourses**](#getcourses) | **GET** /api/v5/admin/courses | 어드민 코스 목록 조회|
|[**getLessonBuilderFeeds**](#getlessonbuilderfeeds) | **GET** /api/v5/admin/lessons/{lessonId}/builder-feeds | 어드민 레슨 BuilderFeed 목록 조회|
|[**getLessonDetail**](#getlessondetail) | **GET** /api/v5/admin/lessons/{lessonId} | 어드민 레슨 상세 조회|
|[**getLessonNotionSyncStatus**](#getlessonnotionsyncstatus) | **GET** /api/v5/admin/lessons/{lessonId}/notion-sync/status | |
|[**getLessonQnaDetail**](#getlessonqnadetail) | **GET** /api/v5/admin/qnas/{qnaId} | 어드민 질문 상세 조회|
|[**getLessonQnas**](#getlessonqnas) | **GET** /api/v5/admin/lessons/{lessonId}/qnas | 어드민 레슨 질문 목록 조회|
|[**getLessonRetrospectives**](#getlessonretrospectives) | **GET** /api/v5/admin/lessons/{lessonId}/retrospectives | 어드민 레슨 돌아보기 목록 조회|
|[**getLessons**](#getlessons) | **GET** /api/v5/admin/courses/{courseId}/lessons | 어드민 레슨 목록 조회|
|[**importLessonContentZip**](#importlessoncontentzip) | **POST** /api/v5/admin/lessons/{lessonId}/imports/notion-zip | 기존 레슨 Notion ZIP 본문 import|
|[**linkLessonNotionPage**](#linklessonnotionpage) | **POST** /api/v5/admin/lessons/{lessonId}/notion-link | |
|[**previewLessonNotionSync**](#previewlessonnotionsync) | **GET** /api/v5/admin/lessons/{lessonId}/notion-sync/preview | |
|[**reorderLessons**](#reorderlessons) | **PATCH** /api/v5/admin/courses/{courseId}/lessons/order | 어드민 레슨 순서 변경|
|[**syncLessonNotionContent**](#synclessonnotioncontent) | **POST** /api/v5/admin/lessons/{lessonId}/notion-sync | |
|[**unlinkLessonNotionPage**](#unlinklessonnotionpage) | **DELETE** /api/v5/admin/lessons/{lessonId}/notion-link | |
|[**updateBuilderFeedCuration**](#updatebuilderfeedcuration) | **PATCH** /api/v5/admin/builder-feeds/{feedId}/curation | 어드민 BuilderFeed 큐레이션 수정|
|[**updateChapter**](#updatechapter) | **PUT** /api/v5/admin/courses/{courseId}/chapters/{chapterNumber} | |
|[**updateCourse**](#updatecourse) | **PUT** /api/v5/admin/courses/{courseId} | 어드민 코스 수정|
|[**updateCoursePlan**](#updatecourseplan) | **PUT** /api/v5/admin/courses/{courseId}/plans/{planId} | 어드민 코스 플랜 수정|
|[**updateLesson**](#updatelesson) | **PUT** /api/v5/admin/lessons/{lessonId} | 어드민 레슨 수정|
|[**upsertCompletionMessage**](#upsertcompletionmessage) | **PUT** /api/v5/admin/courses/{courseId}/completion-message | 어드민 완주 메시지 저장|

# **batchUpdateLessons**
> AdminLessonBatchUpdateResponse batchUpdateLessons(adminLessonBatchUpdateRequest)

                여러 레슨의 편집 내용을 한 번에 저장합니다.  ## Narrative - 어드민 레슨 관리 화면에서 여러 레슨을 수정한 뒤 “변경사항 모두 저장” 할 때 호출합니다. - 기존 단건 수정 API와 같은 필드 규칙을 사용하지만, 요청된 모든 레슨은 path의 courseId에 속해야 합니다. - 하나라도 validation 또는 lesson number 충돌이 발생하면 전체 저장을 실패 처리합니다. - content 이미지 검증 정책은 단건 수정 API와 동일합니다.  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | lessons는 비어 있으면 안 됩니다. | | 규칙 | 각 item은 lessonId가 필수이며 나머지 필드는 partial update처럼 선택 전달할 수 있습니다. | | 규칙 | content를 바꿀 때도 L-10 업로드 URL API로 발급한 publicUrl만 markdown 이미지로 허용합니다. | | 규칙 | 외부 URL, unsafe HTML/script, resized_image에 없는 internal path는 400 LESSON_CONTENT_INVALID로 거절합니다. | | 규칙 | 같은 course 안에서 chapterNumber + lessonNumber가 중복되면 409입니다. | | 규칙 | batch 내부에서 서로 같은 chapterNumber + lessonNumber를 만들면 409입니다. | | 규칙 | 수강 이력이 있는 코스에서도 비공개 레슨의 공개 전환은 허용합니다. 서버는 기존 수강생의 진행 위치를 보존하도록 lesson_progress를 재조정합니다. | | 규칙 | 기존 수강생이 이미 공개 전환된 레슨보다 뒤쪽 레슨에 도달했거나 코스를 완주했다면, 해당 progress는 COMPLETION_CREDITED_BY_POLICY로 생성되거나 기존 LOCKED progress에서 전환됩니다. | | 규칙 | 수강 이력이 있는 코스에서는 기존 공개 레슨의 순서 변경, 비공개 전환, isFree 변경을 409로 거절합니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | lessons가 비어 있거나 lessonId가 중복되면 400 | | 오류 상황 | 요청된 lessonId 중 하나라도 없거나 다른 course에 속하면 404 | | 오류 상황 | lesson number 충돌이 생기면 전체 rollback 후 409 | | 오류 상황 | 수강 이력이 있는 코스의 기존 공개 레슨 순서·공개 여부·무료 여부 변경이면 전체 rollback 후 409 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonBatchUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminLessonBatchUpdateRequest: AdminLessonBatchUpdateRequest; //레슨 batch 수정 요청

const { status, data } = await apiInstance.batchUpdateLessons(
    courseId,
    adminLessonBatchUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonBatchUpdateRequest** | **AdminLessonBatchUpdateRequest**| 레슨 batch 수정 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminLessonBatchUpdateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 잘못된 요청 |  -  |
|**404** | 코스 또는 레슨 없음 |  -  |
|**409** | 레슨 번호 충돌 또는 수강 이력이 있는 기존 공개 레슨의 보호된 변경 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **bulkUpdateLessons**
> CourseVoidResponse bulkUpdateLessons(adminLessonBulkUpdateRequest)

                운영 화면에서 여러 레슨의 isFree / isPublished 플래그를 한 번에 변경합니다.  ## Narrative - 이 API는 여러 레슨의 free/published 상태를 한 번에 바꿀 때 호출합니다.   - 운영자가 정책 변경이나 공개 정리를 빠르게 처리하려고 쓰는 bulk action입니다.   - 개별 수정 여러 번보다 빠르지만, 그만큼 영향 범위가 큽니다. - 두 플래그 모두 공개 사용자 경험에 직접 연결됩니다.   - isFree는 무료수강자 접근 범위, isPublished는 전체 노출 여부를 한 번에 바꿉니다.   - 따라서 저장 후 학습여정과 커리큘럼의 결과가 달라질 수 있습니다. - 프론트엔드는 부분 성공처럼 다루지 말고 전체 결과를 재조회로 확인하는 편이 안전합니다.   - 목록과 공개 화면이 모두 바뀔 수 있으니, 저장 후 레슨 목록을 다시 읽어 최종 상태를 맞추면 됩니다.   - 체크박스 선택 상태는 저장 완료 후 초기화하는 UX가 자연스럽습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 목록의 bulk action | | 비고 | isFree 일괄 변경은 S-학습여정-무료, S-코스상세-B 커리큘럼, S-레슨상세 접근 권한 분기에 영향을 줍니다. | | 비고 | isPublished 일괄 변경은 공개 화면 노출 여부 전체를 한 번에 조정할 때 사용합니다. | | 비고 | 수강 이력이 있는 코스에서도 비공개 레슨의 공개 전환은 허용합니다. 서버는 기존 수강생의 진행 위치를 보존하도록 lesson_progress를 재조정합니다. | | 비고 | 기존 수강생이 이미 공개 전환된 레슨보다 뒤쪽 레슨에 도달했거나 코스를 완주했다면, 해당 progress는 COMPLETION_CREDITED_BY_POLICY로 생성되거나 기존 LOCKED progress에서 전환됩니다. | | 비고 | 수강 이력이 있는 코스에서는 기존 공개 레슨의 비공개 전환과 isFree 변경을 409로 거절합니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonBulkUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminLessonBulkUpdateRequest: AdminLessonBulkUpdateRequest; //

const { status, data } = await apiInstance.bulkUpdateLessons(
    courseId,
    adminLessonBulkUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonBulkUpdateRequest** | **AdminLessonBulkUpdateRequest**|  | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**404** | 코스 또는 레슨 없음 |  -  |
|**409** | 수강 이력이 있는 기존 공개 레슨의 보호된 변경 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAdminLessonQnaAnswer**
> LessonQnaAnswerCreateResponse createAdminLessonQnaAnswer(lessonQnaAnswerCreateRequest)

                운영자 계정으로 질문에 답변을 등록합니다.  ## Narrative - 이 API는 운영자 계정으로 질문에 공식 답변을 남길 때 호출합니다.   - 공개 질문이 오래 답변 대기 상태로 남아 있을 때 운영자가 직접 개입하는 흐름입니다.   - 등록된 답변은 공개 질문 상세에서 MANAGER 역할 배지와 함께 보입니다. - 일반 사용자 답변과는 의미가 다릅니다.   - 같은 answer 생성이라도 운영자 신뢰 답변이라는 문맥이 붙습니다.   - 그래서 content 하나만 받더라도 공개 화면에서는 답변 권위가 달라집니다. - 프론트엔드는 저장 후 상세와 목록을 다시 맞추면 됩니다.   - 상세에서는 새 답변 row를, 목록에서는 answerStatus를 답변 완료 쪽으로 갱신해야 합니다.   - 운영 화면에서도 같은 질문을 다시 읽어 실제 반영을 확인하는 편이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 질문 상세의 운영자 답변 입력 폼 | | 비고 | 등록된 답변은 공개 S-질문상세에서 MANAGER role 배지와 함께 노출됩니다. | | 비고 | admin surface는 content만 받아 manager 답변을 생성합니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    LessonQnaAnswerCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let qnaId: number; //질문 ID (default to undefined)
let lessonQnaAnswerCreateRequest: LessonQnaAnswerCreateRequest; //

const { status, data } = await apiInstance.createAdminLessonQnaAnswer(
    qnaId,
    lessonQnaAnswerCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaAnswerCreateRequest** | **LessonQnaAnswerCreateRequest**|  | |
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

**LessonQnaAnswerCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 답변 등록 성공 |  -  |
|**400** | content blank |  -  |
|**404** | 질문 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCourse**
> AdminCourseCreateResponse createCourse(adminCourseUpsertRequest)

                FRD L-02.  ## Narrative - 이 API는 새 코스를 처음 만들 때 호출합니다.   - `/admin/content` 코스 생성 폼에서 slug, 제목, 카드 카피, 소개 문구를 확정하는 순간 실행됩니다.   - 여기서 입력한 값이 공개 코스 목록과 상세의 기본 재료가 됩니다. - 운영자가 입력하는 값 중 공개 영향이 큰 필드가 많습니다.   - slug는 공개 URL, title은 목록/상세 제목에 직접 연결됩니다.   - 즉 단순 저장이 아니라 공개 경험의 기본 뼈대를 만드는 API입니다. - 프론트엔드는 성공 후 생성된 courseId를 기준으로 다음 단계를 이어가면 됩니다.   - 보통은 코스 상세 편집이나 레슨 생성으로 바로 이동하는 흐름이 자연스럽습니다.   - slug 중복처럼 운영자가 바로 고쳐야 하는 오류는 메시지를 그대로 보여주는 편이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 생성 폼 | | slug | 운영 식별자이며 공개 화면에는 직접 노출되지 않지만 S-코스목록, S-코스상세-A, S-학습여정-*, S-완주 라우트의 path source입니다. | | title | S-코스목록 카드 제목, S-코스상세-A 상단 코스 제목, S-학습여정-*_/S-레슨상세 헤더에 노출됩니다. | | cardHeadline | S-코스목록 카드 상단 한 줄 카피입니다. | | cardSummary | S-코스목록 카드 본문 1~2줄 요약입니다. | | cardTags | S-코스목록 카드 태그 칩입니다. | | regularPrice / discountPrice | 레거시 호환용 입력입니다. 실제 공개 가격과 결제 가격은 `/api/v5/admin/courses/{courseId}/plans*`에서 관리하는 `course_plan`이 결정합니다. | | description | S-코스상세-A의 로드맵 소개 본문 설명 source이며 card headline/summary fallback source로도 사용됩니다. | | thumbnailUrl | S-코스목록 카드 대표 이미지와 코스 공유/SEO 대표 이미지 source입니다. | | durationDays | S-코스상세-A 상단의 평균 N일 소요와 S-코스목록 fallback 태그 N일 코스 source입니다. | | earlyBirdEndsAt | 레거시 호환용 입력입니다. 실제 얼리버드 시점은 plan별 `course_plan.early_bird_ends_at`이 결정합니다. |  새 코스를 생성합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | ADMIN 권한 전용입니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | learnerCount, learnerCount, completionCount, exploringCount 같은 파생 지표는 request로 받지 않고 서버가 계산합니다. | | 규칙 | 가격/얼리버드 SoT는 `course_plan`입니다. 생성 직후 공개 가격과 결제 가격을 노출하려면 plan API로 플랜을 별도 생성해야 합니다. | | 규칙 | request의 `regularPrice`, `discountPrice`, `earlyBirdEndsAt`는 호환용 입력이며 저장 후 가격 계산에는 사용되지 않습니다. | | 입력 제한 | slug 최대 100자/소문자·숫자·하이픈만 허용, title 최대 150자, cardHeadline 최대 200자, cardSummary 최대 200자, cardTags 최대 10개(각 30자 이하), description 최대 2000자, thumbnailUrl 최대 500자(http/https), durationDays 1 이상. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | slug가 이미 존재하면 409를 반환합니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminCourseUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let adminCourseUpsertRequest: AdminCourseUpsertRequest; //코스 생성 요청

const { status, data } = await apiInstance.createCourse(
    adminCourseUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCourseUpsertRequest** | **AdminCourseUpsertRequest**| 코스 생성 요청 | |


### Return type

**AdminCourseCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**409** | slug 중복 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCoursePlan**
> AdminCoursePlanCreateResponse createCoursePlan(adminCoursePlanUpsertRequest)

                FRD P-02.  ## Narrative - 코스정보편집의 플랜 관리 섹션에서 새 결제 플랜을 추가할 때 호출합니다. - 가격/얼리버드 SoT는 class가 아니라 `course_plan` row입니다. - `all-in-one`, `learn-only` 같은 reserved planCode는 item semantics 검증을 통과해야 합니다. 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminCoursePlanUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminCoursePlanUpsertRequest: AdminCoursePlanUpsertRequest; //플랜 생성 요청

const { status, data } = await apiInstance.createCoursePlan(
    courseId,
    adminCoursePlanUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCoursePlanUpsertRequest** | **AdminCoursePlanUpsertRequest**| 플랜 생성 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminCoursePlanCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**400** | 플랜 입력 규칙 위반 |  -  |
|**404** | 존재하지 않는 courseId |  -  |
|**409** | 중복된 planCode |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createLesson**
> AdminLessonCreateResponse createLesson(adminLessonUpsertRequest)

                FRD L-06.  ## Narrative - 이 API는 코스 안에 새 레슨을 추가할 때 호출합니다.   - `/admin/content` 레슨 생성 폼에서 제목, 본문, 소요 시간, 무료 여부, 돌아보기 목적을 확정하는 순간 실행됩니다.   - 생성한 레슨은 곧바로 커리큘럼, 학습여정, 레슨 상세에 연결됩니다. - 몇 가지 필드는 학습 흐름에 직접 영향을 줍니다.   - isFree는 무료수강자의 접근 범위, retrospectivePurpose는 돌아보기 질문 세트, isPublished는 공개 노출 여부를 결정합니다.   - 즉 운영 입력 하나가 FE 분기까지 바로 영향을 줍니다. - 프론트엔드는 성공 후 목록과 상세 흐름을 이어주면 됩니다.   - 생성 직후 레슨 편집 화면으로 보내거나, 레슨 목록에서 새 row를 확인하는 흐름이 자연스럽습니다.   - 자동 채번/순서 반영은 서버 결과 기준으로 다시 확인하는 편이 안전합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 생성 폼 | | Editor Helper | 본문 저장 한도: 최대 65KB / 한글·HTML 포함 시 약 20,000자 내외 / 이미지 최대 10개 / 이미지 파일 개당 최대 5MB | | title | S-레슨상세 본문 상단 레슨 제목에 대응합니다. | | content | S-레슨상세의 따라해보기 탭 본문 전체 source입니다. | | estimatedMinutes | S-레슨상세 제목 하단의 약 N분 소요 메타에 대응합니다. | | retrospectivePurpose | S-레슨돌아보기 질문 세트와 artifact 입력 분기 source입니다. | | isFree | S-학습여정-무료, S-코스상세-B 커리큘럼, S-레슨상세 접근 권한 분기에 사용됩니다. | | isPublished | S-학습여정-*, S-레슨상세, 질문/피드 공개 surface에 노출할지 결정합니다. |  특정 코스에 새 레슨을 추가합니다.  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | chapterNumber, title, retrospectivePurpose, isFree, isPublished가 핵심 필드입니다. | | 규칙 | lessonNumber는 선택값이며 미전송 시 자동 채번될 수 있습니다. | | 규칙 | 본문 이미지가 있으면 먼저 L-10 업로드 URL API로 업로드하고, 응답 publicUrl을 markdown에 삽입해야 합니다. | | 규칙 | 레슨 본문 이미지는 최대 10개까지 허용합니다. | | 규칙 | 저장 시 서버는 publicUrl을 images/lesson-content/... internal path로 정규화합니다. | | 규칙 | 외부 URL, unsafe HTML/script, resized_image에 없는 internal path는 400 LESSON_CONTENT_INVALID로 거절합니다. | | 규칙 | retrospectivePurpose는 PRACTICE_PROOF / ARTIFACT_SHARE / SUBJECTIVE_QUIZ 중 하나이며 미전송 시 기본값은 PRACTICE_PROOF입니다. | | 규칙 | 이미 수강 이력이 있는 코스에도 공개 레슨을 추가할 수 있습니다. 서버는 기존 수강생의 진행 위치를 보존하도록 lesson_progress를 재조정합니다. | | 규칙 | 기존 수강생이 이미 새 레슨보다 뒤쪽 레슨에 도달했거나 코스를 완주했다면, 새 레슨 progress는 COMPLETION_CREDITED_BY_POLICY로 생성되거나 기존 LOCKED progress에서 전환됩니다. | | 입력 제한 | chapterNumber/lessonNumber/estimatedMinutes는 1 이상, title은 최대 150자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | 코스를 찾지 못하면 404 | | 오류 상황 | 같은 챕터 내 lessonNumber 충돌 시 409 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminLessonUpsertRequest: AdminLessonUpsertRequest; //레슨 생성 요청

const { status, data } = await apiInstance.createLesson(
    courseId,
    adminLessonUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonUpsertRequest** | **AdminLessonUpsertRequest**| 레슨 생성 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminLessonCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | 레슨 번호 중복 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createLessonsFromNotionZips**
> AdminLessonBatchImportResponse createLessonsFromNotionZips()

                FRD L-10B.                  Notion export ZIP 여러 개를 받아 레슨을 즉시 생성합니다. ZIP 1개는 lesson 1개에 대응합니다.  ## Narrative - 이 API는 `/admin/content`에서 Notion export 파일들만으로 레슨들을 빠르게 등록할 때 사용합니다.   - ZIP 1개면 lesson 1개, ZIP 여러 개면 lesson N개를 한 번에 만듭니다.   - 본문 이미지도 ZIP 내부 실파일을 기준으로 함께 등록합니다. - 레슨 콘텐츠 메타는 markdown에서 자동 추출됩니다.   - `레슨이름:` → title, `레슨 설명:` → description.   - ZIP 내부의 `챕터: Ch1`, `# L04`, 파일명 `L04 ...md` 번호는 생성 위치 결정에 사용하지 않습니다. - 생성된 레슨은 현재 코스의 마지막 레슨 뒤에 순서대로 붙습니다.   - 기존 레슨이 없을 때만 Chapter 1 / Lesson 1부터 생성합니다.   - invalid markdown image 정책 위반은 그대로 실패합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 상세의 “Notion ZIP 다건 업로드” 액션 | | Outcome | ZIP 1개당 lesson 1개 즉시 생성 | | Defaults | estimatedMinutes=20, retrospectivePurpose=PRACTICE_PROOF, isFree=false, isPublished=false |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | multipart/form-data의 `files` 배열을 받습니다. | | 규칙 | 각 ZIP은 markdown 1개 + 누락 없는 상대 이미지 구조를 만족해야 합니다. | | 규칙 | title 미검출 시 첫 heading 또는 파일명을 사용합니다. | | 규칙 | ZIP의 chapterNumber / lessonNumber 메타는 무시하고 현재 코스의 마지막 레슨 뒤에 append합니다. | | 규칙 | 기존 레슨이 없을 때만 Chapter 1 / Lesson 1부터 생성합니다. | | 규칙 | 저장 본문은 메타 헤더 제거 후 internal path 기준으로 rewrite됩니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | courseId가 없으면 404 | | 오류 상황 | ZIP 구조 불일치 / 누락 이미지 / 외부 이미지 URL 포함 시 400 LESSON_CONTENT_INVALID | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let files: Array<File>; // (default to undefined)

const { status, data } = await apiInstance.createLessonsFromNotionZips(
    courseId,
    files
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **files** | **Array&lt;File&gt;** |  | defaults to undefined|


### Return type

**AdminLessonBatchImportResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | 레슨 번호 중복 |  -  |
|**400** | ZIP 구조 오류 또는 본문 이미지 정책 위반 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateCoursePlan**
> CourseVoidResponse deactivateCoursePlan()

                FRD P-04.  ## Narrative - 플랜을 soft delete 대신 비활성화할 때 호출합니다. - 기존 결제 snapshot은 유지되고, 이후 공개 상세/checkout에서는 비활성 플랜이 제외됩니다. 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let planId: number; //플랜 ID (default to undefined)

const { status, data } = await apiInstance.deactivateCoursePlan(
    courseId,
    planId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **planId** | [**number**] | 플랜 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 비활성화 성공 |  -  |
|**404** | 존재하지 않는 courseId 또는 planId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCourse**
> AdminCourseDeleteResponse deleteCourse()

                FRD L-04.  ## Narrative - 이 API는 운영자가 코스를 삭제하거나 숨김 처리할 때 호출합니다.   - `/admin/content`의 삭제 확인 다이얼로그에서 마지막 확정 단계로 쓰입니다.   - 완전 삭제가 될지, HIDDEN 전환이 될지는 수강생 존재 여부에 따라 달라집니다. - 응답을 단순 삭제 성공으로 보면 안 됩니다.   - 수강생이 없으면 실제 삭제가 가능하지만, 수강생이 있으면 공개만 내리는 숨김 처리로 대체됩니다.   - 따라서 운영자는 삭제 후 코스가 사라졌는지, 숨김 상태로 남았는지 다시 확인해야 합니다. - 프론트엔드는 성공 후 목록 재조회가 필수에 가깝습니다.   - 로컬에서 무조건 row를 제거하면 HIDDEN 전환 케이스를 놓칠 수 있습니다.   - 서버 결과와 목록 재조회로 최종 상태를 맞춰야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 삭제 확인 다이얼로그 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 코스 삭제 다이얼로그 PNG가 아직 없습니다. |  코스를 삭제합니다.  ## Delete Policy | 조건 | 처리 | |---|---| | 조건 | 수강생이 없으면 물리 삭제될 수 있습니다. | | 조건 | 수강생이 있으면 삭제 대신 HIDDEN 전환 결과를 반환할 수 있습니다. |  ## Response Interpretation | 조건 | 의미 | |---|---| | isDeleted=true | 실제 삭제 | | isDeleted=false + reason/status | 숨김 전환 또는 대체 처리 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.deleteCourse(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminCourseDeleteResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 또는 숨김 처리 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteLesson**
> AdminLessonDeleteResponse deleteLesson()

                FRD L-08.  ## Narrative - 이 API는 레슨을 삭제하거나 비공개 처리할 때 호출합니다. - 이 API는 레슨을 운영 화면에서 제거할 때 호출합니다.   - 운영 화면의 삭제 확인 다이얼로그에서 마지막 확정 단계로 사용합니다.   - 관련 이력이 없으면 row가 실제 삭제됩니다.   - 돌아보기 제출 등 이력이 있으면 row는 soft delete로 남길 수 있지만 운영 목록에서는 숨겨집니다. - 프론트엔드는 성공 후 목록 재조회가 중요합니다.   - hard delete와 soft delete가 모두 성공 응답(`isDeleted=true`)으로 돌아올 수 있습니다.   - 서버가 결정한 최종 상태를 다시 읽어 목록에서 제거된 결과를 반영해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 삭제 확인 다이얼로그 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 레슨 삭제 다이얼로그 PNG가 아직 없습니다. |  레슨을 삭제합니다.  ## Delete Policy | 조건 | 처리 | |---|---| | 조건 | 관련 제출/이력이 없으면 실제 삭제됩니다. | | 조건 | 이력이 있으면 soft delete 후 운영 목록에서 숨깁니다. |  ## Response Interpretation | 조건 | 의미 | |---|---| | isDeleted=true, reason=null | 실제 삭제 | | isDeleted=true, reason=SOFT_DELETED | soft delete 후 운영 목록에서 숨김 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.deleteLesson(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**AdminLessonDeleteResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **generateLessonContentImageUploadUrl**
> AdminLessonContentImageUploadUrlResponse generateLessonContentImageUploadUrl()

                FRD L-10.                  레슨 본문 마크다운/리치 텍스트에 삽입할 이미지를 업로드하기 위한 URL을 발급합니다.  ## Narrative - 이 API는 레슨 본문 에디터에 이미지를 올리기 전에 업로드 URL을 받을 때 호출합니다.   - `/admin/content` 에디터에서 이미지를 붙이는 순간 바로 서버 저장이 아니라, 먼저 업로드 위치를 발급받는 구조입니다.   - 이후 본문 저장 시 internal path로 정규화되고, 공개 조회에서는 다시 public URL로 풀립니다. - 운영자만 쓰는 사전 준비 API입니다.   - 실제 레슨 본문 저장 API와 역할이 다르며, 여기서는 파일 업로드 경로만 준비합니다.   - 외부 URL을 그대로 본문에 넣는 것과 구분되는 안전 장치라고 보면 됩니다. - 프론트엔드는 이 응답을 업로드 절차의 중간 결과로 해석해야 합니다.   - 최종 본문에는 업로드 후 받은 path를 넣어 저장해야 합니다.   - public URL은 공개 조회 API가 다시 만들어 주므로 에디터가 임의로 바꾸지 않는 편이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 편집 폼의 본문 에디터 이미지 버튼 | | 비고 | 발급된 publicUrl은 어드민 에디터에 즉시 삽입되는 값이고, 이후 공개 S-레슨상세 본문에서 같은 이미지가 렌더링됩니다. | | Editor Helper | 이미지 파일은 개당 최대 5MB, 본문 전체 이미지는 최대 10개까지 권장/허용됩니다. |  ## Usage Flow | 단계 | 설명 | |---|---|  1. 이 API로 uploadUrl/publicUrl을 발급받습니다. 2. uploadUrl에 multipart PUT 업로드를 수행합니다. 3. 에디터 본문 markdown에는 publicUrl을 삽입합니다. 4. L-06/L-07 저장 시 서버가 이를 images/lesson-content/... internal path로 정규화합니다.  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | uploadUrl은 multipart PUT 업로드 대상입니다. | | 응답 | publicUrl은 에디터 본문에 즉시 삽입할 수 있는 URL입니다. | | 응답 | 업로드 후 resized_image에 등록된 path만 이후 본문 저장에서 통과합니다. | | 응답 | 저장 시 서버는 publicUrl을 내부 path로 정규화하고, 조회 시 다시 현재 환경 public URL로 resolve합니다. | | 제한 | 이미지 파일은 개당 최대 5MB이며, 레슨 본문에는 최대 10개까지 사용할 수 있습니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)
let extension: string; //파일 확장자 (default to undefined)

const { status, data } = await apiInstance.generateLessonContentImageUploadUrl(
    lessonId,
    extension
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|
| **extension** | [**string**] | 파일 확장자 | defaults to undefined|


### Return type

**AdminLessonContentImageUploadUrlResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 발급 성공 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCompletionMessage**
> AdminCompletionMessageResponse getCompletionMessage()

                FRD L-10.  ## Narrative - 이 API는 코스 완주 축하 메시지 설정 화면을 열 때 호출합니다.   - `/admin/content`에서 코스별 완주 카피를 관리하려면 현재 저장된 메시지를 먼저 읽어와야 합니다.   - 공개 S-완주 화면의 operatorMessage source가 바로 이 값입니다. - 메시지가 없을 수도 있는 설정형 데이터입니다.   - null이나 빈 값이면 공개 화면에서는 기본 축하 문구 fallback이 쓰일 수 있습니다.   - 즉 이 API는 필수 데이터 조회라기보다 운영 override 조회에 가깝습니다. - 프론트엔드는 단순 텍스트 설정 모델로 해석하면 됩니다.   - 폼 기본값을 채우고, 저장 후 다시 읽어 최종 반영을 확인하면 됩니다.   - 공개 완주 화면과 연결되는 값이라는 점을 운영자에게 잘 드러내 주는 것이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 완주 메시지 관리 패널 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 완주 메시지 관리 PNG가 아직 없습니다. |  코스 완주 운영자 메시지를 조회합니다.  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | courseId, message, updatedAt을 반환합니다. | | 응답 | 아직 메시지가 없으면 message=null이 올 수 있습니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCompletionMessage(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminCompletionMessageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseDetail**
> AdminCourseDetailResponse getCourseDetail()

                FRD L-01A.  ## Narrative - 이 API는 코스 편집 폼에 기존 값을 채워 넣을 때 호출합니다.   - `/admin/content`에서 특정 코스를 수정하려면, 공개 노출값과 운영 입력값을 한 번에 읽어와야 합니다.   - 코스 생성과 달리 이미 저장된 소개 문구와 공개 메타가 그대로 들어가야 하는 화면입니다. - 운영자 전용 상세라서 숨김 코스도 정상 조회됩니다.   - 공개 API에서 404인 코스라도 admin에서는 편집 대상으로 읽을 수 있습니다.   - 이 응답은 공개 진입용이 아니라 운영 prefill용 read model입니다. - 프론트엔드는 폼 기본값을 서버 값 그대로 채우면 됩니다.   - 코스 메타와 플랜 관리 섹션을 분리해 prefill하는 편이 안전합니다.   - 저장 후에는 다시 이 API를 읽어 실제 반영값을 확인하면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 편집 폼 | | 비고 | 편집 진입 시 기존 저장값 prefill용 상세 데이터 소스입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | ADMIN 권한 전용입니다. | | 권한 | 비공개(HIDDEN) 코스도 조회할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | 필드 | 편집 폼이 사용하는 코스 메타 전체를 반환합니다. | | 필드 | 가격/얼리버드는 포함하지 않습니다. 플랜 목록 조회 API(`/api/v5/admin/courses/{courseId}/plans`)에서 plan별 값으로 읽습니다. | | 필드 | updatedAt은 서버 local datetime 형식입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; // (default to undefined)

const { status, data } = await apiInstance.getCourseDetail(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] |  | defaults to undefined|


### Return type

**AdminCourseDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 존재하지 않는 courseId |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCoursePlans**
> AdminCoursePlanListResponse getCoursePlans()

                FRD P-01.  ## Narrative - 코스정보편집의 플랜 관리 섹션 진입 시 호출합니다.   - 가격, 얼리버드, 추천 플랜, 구성 item을 모두 plan 단위로 prefill하기 위한 read model입니다.   - class-level legacy 가격/얼리버드 컬럼은 이 API에 포함되지 않습니다.  ## Response Rules | 항목 | 설명 | |---|---| | 규칙 | 가격/얼리버드 SoT는 `course_plan`입니다. | | 규칙 | `earlyBirdEndsAt`은 plan별 KST offset ISO-8601 형식입니다. | | 규칙 | `items`는 플랜 화면 노출 순서대로 내려갑니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCoursePlans(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminCoursePlanListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 존재하지 않는 courseId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourses**
> AdminCourseListResponse getCourses()

                FRD L-01.  ## Narrative - 이 API는 `/admin/content` 코스 목록 테이블을 채우는 기준 조회입니다.   - 운영자는 여기서 어떤 코스가 공개 중인지, 숨김인지, 레슨 수와 수강자 수가 어떤지 먼저 훑습니다.   - 수정·삭제·상세 진입의 출발점이 되는 목록입니다. - 공개 화면과 달리 숨김 코스도 보여줘야 합니다.   - 운영 화면이라 HIDDEN 상태도 정상 조회 대상입니다.   - 즉 사용자에게 안 보이는 코스라도 운영자는 계속 수정 대상으로 볼 수 있습니다. - 프론트엔드는 이 응답을 관리용 테이블 모델로 해석하면 됩니다.   - slug는 라우트 식별자, lessonCount와 activeEnrollmentCount는 운영 판단용 숫자입니다.   - 저장 후에는 이 목록을 다시 읽어 최신 상태를 맞추는 흐름이 가장 단순합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 목록 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 /admin/content 전용 PNG가 아직 없습니다. | | 비고 | 상태 필터, 목록 테이블, 수정/삭제 액션 진입 전 데이터 소스로 사용합니다. |  어드민 콘텐츠 화면에서 코스 목록을 페이징 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | ADMIN 권한 전용입니다. | | 권한 | 비공개(HIDDEN) 코스도 조회 대상에 포함됩니다. |  ## Query Rules | 항목 | 설명 | |---|---| | 조회 규칙 | status는 OPEN, COMING_SOON, HIDDEN 중 하나를 사용합니다. | | 조회 규칙 | 미지정 시 전체 상태를 조회합니다. | | 조회 규칙 | page는 0-based, size 기본값은 20입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | 필드 | 각 코스에는 courseId, slug, title, status, lessonCount, activeEnrollmentCount, updatedAt이 포함됩니다. | | 필드 | 응답은 BaseResponse<PageResponseDto<AdminCourseSummaryResponse>> 입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let status: string; //코스 상태 필터 (OPEN / COMING_SOON / HIDDEN) (optional) (default to undefined)
let page: number; //0-based 페이지 번호 (optional) (default to 0)
let size: number; //페이지 크기 (optional) (default to 20)

const { status, data } = await apiInstance.getCourses(
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] | 코스 상태 필터 (OPEN / COMING_SOON / HIDDEN) | (optional) defaults to undefined|
| **page** | [**number**] | 0-based 페이지 번호 | (optional) defaults to 0|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to 20|


### Return type

**AdminCourseListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonBuilderFeeds**
> getLessonBuilderFeeds()

                운영 화면에서 특정 레슨에 연결된 빌더 피드와 운영진 큐레이션 상태를 조회합니다.  ## Narrative - 이 API는 특정 레슨에 연결된 BuilderFeed를 운영자가 검토할 때 호출합니다.   - 레슨 상세 안의 BuilderFeed 관리 탭에서 어떤 피드가 쌓였는지, 어떤 피드를 추천/쇼케이스로 올릴지 판단하는 용도입니다.   - 공개 피드 운영과 코스 랜딩 큐레이션이 만나는 지점입니다. - 운영자는 공개 목록과 다른 관점으로 봅니다.   - 여기서는 피드 자체보다 isOperatorPick, isFeatured, isFeaturedOrder 같은 큐레이션 상태가 더 중요합니다.   - 즉 읽기 API이지만 사실상 큐레이션 수정의 출발점입니다. - soft delete된 피드도 운영 목록에는 남겨 둡니다.   - `isDeleted`, `deletedAt`, `deletedByMemberId`로 삭제 감사 정보를 확인할 수 있습니다.   - 공개 화면에서는 숨겨져도 운영 화면에서는 삭제 전후 상태를 비교할 수 있어야 합니다. - 프론트엔드는 관리용 리스트로 해석하면 됩니다.   - feeds[]를 그대로 보여주고, 토글 수정 후에는 다시 이 목록을 읽어 순서와 상태를 맞추면 됩니다.   - 공개 showcase와 이 관리 탭의 상태가 어긋나지 않게 재조회 기반으로 움직이는 편이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 상세의 BuilderFeed 관리 탭 | | feeds[] | 운영자가 살펴볼 피드 리스트 source입니다. | | isOperatorPick, isFeatured, isFeaturedOrder | S-코스상세-A/B showcase 반영 여부를 결정하는 admin 토글 상태 source입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getLessonBuilderFeeds(
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
|**404** | 레슨 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonDetail**
> AdminLessonDetailResponse getLessonDetail()

                레슨 편집 폼을 채우기 위한 단건 상세 조회입니다.  ## Narrative - 이 API는 레슨 편집 화면의 기본값을 채울 때 호출합니다.   - 제목, 본문, 소요 시간, 무료 여부, 공개 여부, 돌아보기 목적을 한 번에 읽어와 운영자가 수정할 수 있게 해줍니다.   - 공개 S-레슨상세를 만드는 원본 값이 그대로 여기서 보인다고 생각하면 됩니다. - 운영자 전용 상세라서 공개 전 레슨도 읽을 수 있습니다.   - 아직 published=false인 레슨도 admin에서는 정상 편집 대상입니다.   - 본문이 비어 있으면 빈 문자열로 내려오므로 새 레슨과 같은 방식으로 다룰 수 있습니다. - 프론트엔드는 이 값을 폼 기본값으로 그대로 쓰면 됩니다.   - content는 에디터 초기값, retrospectivePurpose는 selector 초기값으로 해석하면 됩니다.   - 저장 후 다시 읽어 반영값을 확인하는 흐름이 안전합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 편집 폼 | | Editor Helper | 본문 저장 한도: 최대 65KB / 한글·HTML 포함 시 약 20,000자 내외 / 이미지 최대 10개 / 이미지 파일 개당 최대 5MB | | title | 어드민 제목 input의 초기값이며 공개 S-레슨상세 제목 source입니다. | | content | 에디터 본문 초기값이며 공개 S-레슨상세 따라해보기 탭 본문 source입니다. | | estimatedMinutes | 어드민 소요 시간 input 초기값이며 공개 S-레슨상세의 약 N분 소요 메타 source입니다. | | retrospectivePurpose | 돌아보기 목적 selector 초기값이며 공개 S-레슨돌아보기 질문 세트 분기 source입니다. | | isFree / isPublished | 공개 접근 범위 토글 초기값입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 레슨 편집에 필요한 chapter/lesson 번호, title, content, estimatedMinutes, retrospectivePurpose, isFree, isPublished를 반환합니다. | | 응답 | 본문 row가 아직 없거나 공백-only면 content는 빈 문자열로 반환합니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getLessonDetail(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**AdminLessonDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonNotionSyncStatus**
> BaseResponseAdminLessonNotionSyncStatusResponse getLessonNotionSyncStatus()


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; // (default to undefined)

const { status, data } = await apiInstance.getLessonNotionSyncStatus(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseAdminLessonNotionSyncStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonQnaDetail**
> LessonQnaDetailResponse getLessonQnaDetail()

                운영자가 특정 질문의 본문, 첨부 이미지, 답변 목록까지 상세하게 조회합니다.  ## Narrative - 이 API는 운영자가 질문 하나를 깊게 확인할 때 호출합니다.   - 질문 본문, 첨부 이미지, 답변 목록을 함께 보며 운영 답변이나 moderation 판단을 내리는 상세 모델입니다.   - 공개 S-질문상세와 비슷해 보이지만, 목적은 해결과 관리입니다. - 운영 관점에서는 답변 이력이 특히 중요합니다.   - answers[]는 기존에 누가 어떤 답을 달았는지 확인하는 근거가 됩니다.   - 필요하면 여기서 바로 운영자 답변 등록으로 이어집니다. - 프론트엔드는 상세 검토 화면으로 해석하면 됩니다.   - 공개용 텍스트를 그대로 보여줘도 되지만, 액션 버튼은 운영 흐름에 맞춰 별도로 구성하면 됩니다.   - 답변 등록 후에는 다시 이 API를 읽어 최신 답변 목록을 맞추는 게 안전합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 질문 상세/응답 패널 | | 비고 | 공개 S-질문상세에 보이는 질문/답변 본문을 운영자가 moderation 관점으로 다시 확인하는 read model입니다. | | 비고 | answers[]는 운영자 답변 등록 전 기존 답변 이력 확인 source입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let qnaId: number; //질문 ID (default to undefined)

const { status, data } = await apiInstance.getLessonQnaDetail(
    qnaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

**LessonQnaDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 질문 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonQnas**
> LessonQnaListResponse getLessonQnas()

                운영 화면에서 특정 레슨의 질문 목록을 조회합니다.  ## Narrative - 이 API는 특정 레슨에서 올라온 질문만 운영자가 따로 볼 때 호출합니다.   - 레슨 상세의 질문 탭에서 답변 대기 건을 빠르게 찾거나, 운영 개입이 필요한 질문을 고르는 용도입니다.   - 공개 질문 목록보다 범위가 좁고 moderation 목적이 더 강합니다. - 운영자는 질문 상태를 해결 관점으로 봅니다.   - answerStatus, 작성 시각, 작성자 정보가 어떤 질문부터 봐야 할지 판단 기준이 됩니다.   - 공개 화면에서 보이는 질문이라도 운영 화면에서는 처리 우선순위 데이터로 읽습니다. - 프론트엔드는 moderation 리스트로 해석하면 됩니다.   - 질문 클릭 후 상세/답변 패널로 이어지는 진입 목록으로 쓰면 됩니다.   - 답변 등록 후에는 다시 이 목록을 읽어 대기/완료 상태를 맞추는 편이 좋습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 상세의 질문 목록 탭 | | 비고 | qnas[]는 운영자가 답변 대기/완료 상태를 훑는 moderation 리스트 source입니다. | | 비고 | answerStatus, createdAt, author는 응답 우선순위 판단 source입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getLessonQnas(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**LessonQnaListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 레슨 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessonRetrospectives**
> getLessonRetrospectives()

                운영 화면에서 특정 레슨의 돌아보기 제출 목록을 조회합니다.  ## Narrative - 이 API는 특정 레슨에 제출된 돌아보기를 운영자가 모아서 볼 때 호출합니다.   - 어떤 답변이 들어왔는지, artifact 품질이 어떤지, 운영 피드백이 필요한 제출이 있는지 확인하는 용도입니다.   - 공개 화면용이 아니라 검수와 관찰용 리스트입니다. - 개인 회고지만 운영자는 레슨 품질 관점으로 읽습니다.   - 어떤 질문이 잘 안 먹히는지, artifact가 기대 수준인지, 링크 제출이 많은지 같은 힌트를 얻을 수 있습니다.   - 즉 단순 열람이 아니라 레슨 개선 데이터로도 쓰입니다. - 프론트엔드는 moderation/analytics 리스트로 해석하면 됩니다.   - retrospectives[]를 그대로 표나 카드로 보여주고, 필요하면 detail drill-down을 붙이면 됩니다.   - 새 제출이 생긴 뒤에는 다시 조회해 최신 목록을 맞추는 구조가 자연스럽습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 상세의 돌아보기 탭 | | 비고 | retrospectives[]는 학습자 답변/artifact/제출 시각을 확인하는 운영 리스트 source입니다. | | 비고 | artifact/link 계열 필드는 완주 결과물 검수와 운영 피드백 판단 source입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getLessonRetrospectives(
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
|**404** | 레슨 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLessons**
> AdminLessonListResponse getLessons()

                FRD L-05.  ## Narrative - 이 API는 특정 코스 아래 레슨 목록을 운영자가 관리할 때 호출합니다.   - `/admin/content`에서 레슨 순서, 무료/유료, 공개 여부, 돌아보기 제출 수까지 한 화면에서 훑는 용도입니다.   - 이후 레슨 편집, 삭제, 순서 변경, bulk 수정 모두 이 목록에서 출발합니다. - 공개 화면용 커리큘럼보다 운영 정보가 더 많습니다.   - lessonCount만 보는 게 아니라, 어떤 레슨이 free인지, published인지, retrospectiveCount가 얼마나 쌓였는지 같이 봅니다.   - 즉 사용자 탐색용이 아니라 운영 판단용 테이블입니다. - 프론트엔드는 이 응답을 목록의 기준으로 삼아야 합니다.   - 드래그 정렬이나 bulk action 후에는 다시 이 API를 읽어 최종 순서를 맞추는 게 좋습니다.   - 공개 화면에서 보이는 순서와 운영 목록 순서가 달라지지 않게 유지해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 목록 패널 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 레슨 목록 패널 PNG가 아직 없습니다. |  특정 코스의 레슨 목록을 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | ADMIN 권한 전용입니다. |  ## Ordering | 항목 | 설명 | |---|---| | 정렬 기준 | chapterNumber → lessonNumber 오름차순 기준으로 정렬된 목록을 기대합니다. |  ## Response Fields | 필드 | 설명 | |---|---| | 필드 | 각 항목에는 lessonId, chapterNumber, lessonNumber, title, retrospectivePurpose, isFree, isPublished, retrospectiveCount, updatedAt이 포함됩니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getLessons(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminLessonListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **importLessonContentZip**
> AdminLessonDetailResponse importLessonContentZip()

                FRD L-10A.                  이미 생성된 레슨에 Notion export ZIP을 업로드해 본문(content)만 교체합니다.  ## Narrative - 이 API는 `/admin/content`에서 레슨 메타는 그대로 두고 본문만 Notion export 기준으로 다시 채우고 싶을 때 호출합니다.   - lessonId는 이미 존재해야 합니다.   - title/description/chapter/lessonNumber 같은 운영 메타는 바꾸지 않습니다. - ZIP 안 markdown와 이미지를 서버가 다시 lesson-content 자산으로 재등록합니다.   - Notion clipboard 참조값을 해석하는 방식이 아니라, export ZIP 안의 실제 markdown/image 파일을 사용합니다.   - 상대경로 이미지와 HTML `<img>`를 모두 ZIP 내부 파일과 매칭합니다. - 저장 전 markdown는 기존 lesson markdown policy를 다시 통과합니다.   - 외부 URL, unsafe HTML/script, 누락 이미지가 있으면 import를 거절합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 편집 폼의 “Notion ZIP import” 액션 | | Outcome | 기존 레슨 메타는 유지하고 본문만 ZIP 기준으로 교체 | | Supported ZIP | outer ZIP 안에 inner ZIP 1개가 들어있는 Notion export 구조 지원 |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | multipart/form-data의 `file` 하나를 받습니다. | | 규칙 | ZIP 내부 markdown 파일은 정확히 1개여야 합니다. | | 규칙 | markdown가 참조한 상대경로 이미지는 ZIP 내부 실파일과 모두 매칭되어야 합니다. | | 규칙 | import 후 저장되는 본문은 `images/lesson-content/...` internal path 기준으로 rewrite됩니다. | | 규칙 | `레슨이름:`, `레슨 설명:` 같은 메타 헤더는 파싱 대상이지만 저장 본문에서는 제거됩니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | lessonId가 없으면 404 | | 오류 상황 | ZIP 구조 불일치 / 누락 이미지 / 외부 이미지 URL 포함 시 400 LESSON_CONTENT_INVALID | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)
let file: File; // (default to undefined)

const { status, data } = await apiInstance.importLessonContentZip(
    lessonId,
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|


### Return type

**AdminLessonDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | import 성공 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |
|**400** | ZIP 구조 오류 또는 본문 이미지 정책 위반 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **linkLessonNotionPage**
> BaseResponseAdminLessonNotionSyncStatusResponse linkLessonNotionPage(adminLessonNotionLinkRequest)


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonNotionLinkRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; // (default to undefined)
let adminLessonNotionLinkRequest: AdminLessonNotionLinkRequest; //

const { status, data } = await apiInstance.linkLessonNotionPage(
    lessonId,
    adminLessonNotionLinkRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonNotionLinkRequest** | **AdminLessonNotionLinkRequest**|  | |
| **lessonId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseAdminLessonNotionSyncStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **previewLessonNotionSync**
> BaseResponseAdminLessonNotionSyncPreviewResponse previewLessonNotionSync()


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; // (default to undefined)

const { status, data } = await apiInstance.previewLessonNotionSync(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseAdminLessonNotionSyncPreviewResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reorderLessons**
> CourseVoidResponse reorderLessons(adminLessonOrderRequest)

                FRD L-09.  ## Narrative - 이 API는 레슨 순서를 드래그하거나 번호 입력으로 바꾼 뒤 저장할 때 호출합니다.   - 운영자가 코스 흐름을 다시 설계하는 액션이라 공개 커리큘럼과 학습여정 순서에 바로 영향이 갑니다.   - lessonId 배열 자체가 최종 순서입니다. - 저장 후 모든 관련 화면이 이 새 순서를 따라야 합니다.   - 코스 상세 커리큘럼, 학습여정, 레슨 드로어가 모두 같은 정렬 기준을 공유합니다.   - 즉 운영 화면에서만 맞고 공개 화면이 다르면 안 되는 API입니다. - 프론트엔드는 optimistic 정렬을 하더라도 서버 저장 후 다시 확인하는 편이 좋습니다.   - 새로고침 후에도 같은 순서가 유지되는지 목록 재조회로 검증해야 합니다.   - 일부 lessonId가 빠지거나 중복되면 오류로 보고 다시 정리하게 해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 순서 변경 영역 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 레슨 순서 변경 UI PNG가 아직 없습니다. |  orderedLessonIds 배열 순서대로 레슨 순서를 재정렬합니다.  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 배열에는 해당 코스의 모든 lessonId가 포함되어야 합니다. | | 규칙 | 누락 또는 다른 코스 레슨이 섞이면 400을 반환합니다. | | 규칙 | chapterNumber는 바꾸지 않고 lessonNumber만 재할당하는 용도입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminLessonOrderRequest: AdminLessonOrderRequest; //정렬 순서 요청

const { status, data } = await apiInstance.reorderLessons(
    courseId,
    adminLessonOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonOrderRequest** | **AdminLessonOrderRequest**| 정렬 순서 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 정렬 성공 |  -  |
|**400** | 현재 코스 레슨 집합과 orderedLessonIds가 일치하지 않음 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **syncLessonNotionContent**
> BaseResponseAdminLessonNotionSyncApplyResponse syncLessonNotionContent()


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; // (default to undefined)

const { status, data } = await apiInstance.syncLessonNotionContent(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseAdminLessonNotionSyncApplyResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **unlinkLessonNotionPage**
> BaseResponseAdminLessonNotionSyncStatusResponse unlinkLessonNotionPage()


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; // (default to undefined)

const { status, data } = await apiInstance.unlinkLessonNotionPage(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseAdminLessonNotionSyncStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBuilderFeedCuration**
> CourseVoidResponse updateBuilderFeedCuration(adminBuilderFeedCurationRequest)

                운영자가 특정 피드의 isOperatorPick / isFeatured / isFeaturedOrder를 수정합니다.  ## Narrative - 이 API는 운영자가 피드를 추천 피드나 쇼케이스로 올릴지 정할 때 호출합니다.   - BuilderFeed 관리 탭에서 isOperatorPick, isFeatured, isFeaturedOrder를 조정하는 저장 액션입니다.   - 코스 상세의 showcase와 공개 목록 추천 영역에 직접 연결됩니다. - 입력값 하나가 여러 공개 화면에 동시에 반영됩니다.   - isOperatorPick은 피드 목록 필터, isFeatured와 isFeaturedOrder는 코스 소개 showcase 순서에 영향을 줍니다.   - 즉 단순 내부 메모가 아니라 공개 노출 정책 저장입니다. - 삭제된 피드는 큐레이션 대상이 아닙니다.   - soft delete된 피드는 운영 감사 화면에서는 보여도 공개 노출 정책 수정은 허용하지 않습니다.   - 삭제된 feedId 또는 존재하지 않는 feedId는 404로 응답합니다. - 프론트엔드는 저장 후 관리 목록과 공개 결과를 다시 보는 흐름이 좋습니다.   - 한 row만 로컬 갱신해도 되지만, 실제 노출 순서는 재조회로 확인하는 편이 안전합니다.   - isFeaturedOrder 충돌이나 순서 변화는 서버 결과를 기준으로 맞춰야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content BuilderFeed 관리 탭의 큐레이션 컨트롤 | | isOperatorPick | S-빌더피드목록의 운영자 추천 필터 source입니다. | | isFeatured / isFeaturedOrder | S-코스상세-A/B showcase 노출 여부와 순서 source입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminBuilderFeedCurationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let feedId: number; //피드 ID (default to undefined)
let adminBuilderFeedCurationRequest: AdminBuilderFeedCurationRequest; //

const { status, data } = await apiInstance.updateBuilderFeedCuration(
    feedId,
    adminBuilderFeedCurationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminBuilderFeedCurationRequest** | **AdminBuilderFeedCurationRequest**|  | |
| **feedId** | [**number**] | 피드 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**404** | 피드 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateChapter**
> BaseResponseVoid updateChapter(adminChapterUpdateRequest)


### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminChapterUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; // (default to undefined)
let chapterNumber: number; // (default to undefined)
let adminChapterUpdateRequest: AdminChapterUpdateRequest; //

const { status, data } = await apiInstance.updateChapter(
    courseId,
    chapterNumber,
    adminChapterUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminChapterUpdateRequest** | **AdminChapterUpdateRequest**|  | |
| **courseId** | [**number**] |  | defaults to undefined|
| **chapterNumber** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCourse**
> CourseVoidResponse updateCourse(adminCourseUpsertRequest)

                FRD L-03.  ## Narrative - 이 API는 기존 코스를 수정할 때 호출합니다.   - 공개 중인 코스라도 운영자는 제목, 소개, 상태를 다시 바꿀 수 있습니다.   - 한 번 수정하면 코스 목록과 상세 소개 문맥에 바로 영향이 갑니다. - 운영 화면에서는 저장값과 공개 노출값의 연결을 계속 의식해야 합니다.   - title, thumbnail, description 같은 값은 바로 사용자 화면에 반영됩니다.   - status를 바꾸면 아예 공개 여부가 달라질 수 있습니다. - 프론트엔드는 부분 갱신보다 재조회 기반이 안전합니다.   - 저장 성공 후 목록과 상세 prefill을 다시 읽어 실제 반영값을 맞추는 편이 좋습니다.   - 날짜와 가격은 표시 포맷보다 서버 저장값 정확도가 더 중요합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 코스 편집 폼 | | 비고 | title, cardHeadline, cardSummary, cardTags, thumbnailUrl은 S-코스목록과 S-코스상세-A의 소개 영역을 함께 갱신합니다. | | 비고 | regularPrice / discountPrice / earlyBirdEndsAt는 레거시 호환용 입력입니다. 실제 가격과 얼리버드는 플랜 관리 섹션(`/api/v5/admin/courses/{courseId}/plans*`)에서만 수정합니다. | | 비고 | description은 S-코스상세-A 로드맵 소개 본문 source입니다. | | 비고 | durationDays는 S-코스상세-A 상단 평균 N일 소요와 S-코스목록 fallback N일 코스에 반영됩니다. | | 비고 | status는 S-코스목록 노출 여부와 CTA 분기(자세히 보기 vs 오픈 알림 받기)의 상위 상태 source입니다. |  코스 정보를 수정합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | ADMIN 권한 전용입니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 현재 구현은 코스 생성과 동일한 request shape를 사용합니다. | | 규칙 | 수정 대상은 courseId path parameter로 식별합니다. | | 규칙 | learnerCount, learnerCount, completionCount, exploringCount 같은 파생 지표는 수정 request로 받지 않습니다. | | 규칙 | `regularPrice`, `discountPrice`, `earlyBirdEndsAt`는 호환성 때문에 request에 남아 있지만 공개 가격/결제 가격 계산에는 사용되지 않습니다. | | 입력 제한 | slug 최대 100자/소문자·숫자·하이픈만 허용, title 최대 150자, cardHeadline 최대 200자, cardSummary 최대 200자, cardTags 최대 10개(각 30자 이하), description 최대 2000자, thumbnailUrl 최대 500자(http/https), durationDays 1 이상. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | 존재하지 않는 코스면 404 | | 오류 상황 | slug 충돌 시 409 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminCourseUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminCourseUpsertRequest: AdminCourseUpsertRequest; //코스 수정 요청

const { status, data } = await apiInstance.updateCourse(
    courseId,
    adminCourseUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCourseUpsertRequest** | **AdminCourseUpsertRequest**| 코스 수정 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | slug 중복 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCoursePlan**
> CourseVoidResponse updateCoursePlan(adminCoursePlanUpsertRequest)

                FRD P-03.  ## Narrative - 플랜 관리 섹션에서 이름, 가격, 얼리버드, 추천 여부, item 구성을 수정할 때 호출합니다. - legacy class-level 가격/얼리버드 필드는 이 API와 무관하며, 공개/결제 가격 계산은 수정된 `course_plan`만 반영합니다. 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminCoursePlanUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let planId: number; //플랜 ID (default to undefined)
let adminCoursePlanUpsertRequest: AdminCoursePlanUpsertRequest; //플랜 수정 요청

const { status, data } = await apiInstance.updateCoursePlan(
    courseId,
    planId,
    adminCoursePlanUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCoursePlanUpsertRequest** | **AdminCoursePlanUpsertRequest**| 플랜 수정 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **planId** | [**number**] | 플랜 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | 플랜 입력 규칙 위반 |  -  |
|**404** | 존재하지 않는 courseId 또는 planId |  -  |
|**409** | 중복된 planCode |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateLesson**
> CourseVoidResponse updateLesson(adminLessonUpsertRequest)

                FRD L-07.  ## Narrative - 이 API는 기존 레슨 내용을 수정할 때 호출합니다.   - 제목이나 본문을 바꾸는 수준을 넘어서, 무료 여부와 공개 여부까지 함께 바꿀 수 있습니다.   - 그래서 공개 레슨 상세, 학습여정, 커리큘럼, 돌아보기 화면에 동시에 영향이 갑니다. - 운영자는 특히 접근 정책이 바뀌는 필드를 주의해야 합니다.   - isFree를 바꾸면 무료수강자 접근 범위가 달라지고, isPublished를 바꾸면 아예 공개 노출 여부가 바뀝니다.   - retrospectivePurpose를 바꾸면 돌아보기 질문 UX도 달라집니다. - 프론트엔드는 저장 후 연관 화면을 다시 읽는 전제로 움직여야 합니다.   - 레슨 상세 prefill만 바꾸고 끝내지 말고, 목록이나 공개 화면 반영까지 이어서 확인하는 편이 좋습니다.   - 본문 이미지 경로도 서버가 정규화한 값을 최종 기준으로 봐야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 레슨 편집 폼 | | Editor Helper | 본문 저장 한도: 최대 65KB / 한글·HTML 포함 시 약 20,000자 내외 / 이미지 최대 10개 / 이미지 파일 개당 최대 5MB | | 비고 | title, content, estimatedMinutes를 바꾸면 S-레슨상세 상단과 따라해보기 본문이 즉시 바뀝니다. | | 비고 | retrospectivePurpose를 바꾸면 S-레슨돌아보기 질문/제출 UI 분기가 바뀝니다. | | 비고 | isFree / isPublished를 바꾸면 S-학습여정-*, S-레슨상세, 질문/피드 공개 surface의 접근 가능 범위가 바뀝니다. |  lessonId 기준으로 레슨 정보를 수정합니다.  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 생성 API와 같은 request shape를 사용합니다. | | 규칙 | content를 바꿀 때도 L-10 업로드 URL API로 발급한 publicUrl만 markdown 이미지로 허용합니다. | | 규칙 | 레슨 본문 이미지는 최대 10개까지 허용합니다. | | 규칙 | 저장 시 서버는 publicUrl을 images/lesson-content/... internal path로 정규화합니다. | | 규칙 | 외부 URL, unsafe HTML/script, resized_image에 없는 internal path는 400 LESSON_CONTENT_INVALID로 거절합니다. | | 규칙 | 수강 이력이 있는 코스에서도 비공개 레슨의 공개 전환은 허용합니다. 서버는 기존 수강생의 진행 위치를 보존하도록 lesson_progress를 재조정합니다. | | 규칙 | 기존 수강생이 이미 공개 전환된 레슨보다 뒤쪽 레슨에 도달했거나 코스를 완주했다면, 해당 progress는 COMPLETION_CREDITED_BY_POLICY로 생성되거나 기존 LOCKED progress에서 전환됩니다. | | 규칙 | 수강 이력이 있는 코스에서는 기존 공개 레슨의 chapterNumber/lessonNumber 변경, 비공개 전환, isFree 변경을 409로 거절합니다. | | 입력 제한 | chapterNumber/lessonNumber/estimatedMinutes는 1 이상, title은 최대 150자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 오류 상황 | 존재하지 않는 lessonId는 404 | | 오류 상황 | lessonNumber 변경 시 중복이면 409 | | 오류 상황 | 수강 이력이 있는 코스의 기존 공개 레슨 순서·공개 여부·무료 여부 변경이면 409 | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminLessonUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)
let adminLessonUpsertRequest: AdminLessonUpsertRequest; //레슨 수정 요청

const { status, data } = await apiInstance.updateLesson(
    lessonId,
    adminLessonUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminLessonUpsertRequest** | **AdminLessonUpsertRequest**| 레슨 수정 요청 | |
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |
|**409** | 레슨 번호 중복 또는 수강 이력이 있는 기존 공개 레슨의 보호된 변경 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **upsertCompletionMessage**
> AdminCompletionMessageResponse upsertCompletionMessage(adminCompletionMessageRequest)

                FRD L-11.  ## Narrative - 이 API는 코스별 완주 메시지를 새로 저장하거나 덮어쓸 때 호출합니다.   - `/admin/content`의 완주 메시지 폼에서 카피를 확정하는 마지막 단계입니다.   - 공개 S-완주 화면의 operatorMessage가 이 값으로 바뀝니다. - 없는 값은 생성하고, 있던 값은 수정하는 upsert 성격입니다.   - 운영자는 생성/수정을 구분하지 않고 같은 저장 버튼으로 다뤄도 됩니다.   - 따라서 프론트엔드도 생성/수정 모드를 굳이 나누지 않아도 됩니다. - 프론트엔드는 저장 성공 후 현재 코스 메시지를 다시 보여주면 됩니다.   - 운영 패널은 저장된 문구가 실제 공개 카피 source라는 점을 분명히 보여주는 게 좋습니다.   - 필요하면 완주 화면 preview나 연결 안내를 붙여도 자연스럽습니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | /admin/content 완주 메시지 관리 폼 | | Prototype Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/L-admin-content.md | | Prototype Note | 현재 repo의 prototype/ 폴더에는 완주 메시지 저장 폼 PNG가 아직 없습니다. |  완주 운영자 메시지를 생성하거나 수정합니다.  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | message는 upsert 대상 본문입니다. | | 규칙 | 동일 코스에 대해 없으면 생성, 있으면 갱신합니다. | | 규칙 | message는 trim 후 저장되며 200자 이하여야 합니다. |  ## Domain Rules | 항목 | 설명 | |---|---| | 규칙 | 이 메시지는 H-01 recap의 operatorMessage SoT로 사용됩니다. | | 규칙 | history, 예약 발행, 다국어는 현재 범위 밖입니다. | 

### Example

```typescript
import {
    AdminCourseContentApi,
    Configuration,
    AdminCompletionMessageRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseContentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let adminCompletionMessageRequest: AdminCompletionMessageRequest; //완주 메시지 요청

const { status, data } = await apiInstance.upsertCompletionMessage(
    courseId,
    adminCompletionMessageRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminCompletionMessageRequest** | **AdminCompletionMessageRequest**| 완주 메시지 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**AdminCompletionMessageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**400** | message가 blank이거나 200자를 초과함 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

