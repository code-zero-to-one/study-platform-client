# CourseApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getCourseCompletionRecap**](#getcoursecompletionrecap) | **GET** /api/v5/courses/{courseId}/completion-recap | 완주 Recap 지표 조회|
|[**getCourseCurriculum**](#getcoursecurriculum) | **GET** /api/v5/courses/{slug}/curriculum | 코스 커리큘럼 조회|
|[**getCourseDetail1**](#getcoursedetail1) | **GET** /api/v5/courses/{slug} | 코스 상세 조회|
|[**getCourseDrawer**](#getcoursedrawer) | **GET** /api/v5/courses/{courseId}/drawer | 코스 커리큘럼 드로어 조회|
|[**getCourseJourneyMap**](#getcoursejourneymap) | **GET** /api/v5/courses/{courseId}/journey-map | 코스 학습 여정 맵 조회|
|[**getCourseProgress**](#getcourseprogress) | **GET** /api/v5/courses/{courseId}/progress | 코스 진행률 조회|
|[**getCourses1**](#getcourses1) | **GET** /api/v5/courses | 코스 목록 조회|
|[**upsertCourseCompletionNextPlan**](#upsertcoursecompletionnextplan) | **POST** /api/v5/courses/{courseId}/next-plan | 완주 후 다음 계획 저장|

# **getCourseCompletionRecap**
> CourseCompletionRecapResponse getCourseCompletionRecap()

                FRD H-01.                  결제 완료 후 코스를 완주한 사용자의 recap 지표를 조회합니다.  ## Narrative - 이 API는 완주 화면의 recap 숫자와 축하 메시지를 열 때 호출합니다.   - S-완주 화면은 단순 성공 화면이 아니라, 얼마나 해냈는지 숫자로 되돌아보게 하는 페이지라 이 응답이 핵심입니다.   - operatorMessage도 여기서 같이 받아야 완주 카피가 코스별로 달라집니다. - 완주 조건을 만족한 결제자만 정상 응답을 받습니다.   - 미완주 결제자나 무료수강자는 403으로 막히므로, 이 화면은 진입 전부터 완주 상태를 기대하는 화면입니다.   - completedAt, siteUrlCount 같은 값은 이미 완주 판정을 통과한 사람의 결과로 보면 됩니다. - 프론트엔드는 recap 숫자를 다시 계산하지 말고 그대로 보여주면 됩니다.   - operatorMessage가 없으면 기본 축하 문구 fallback만 준비하면 됩니다.   - 이 API 성공 뒤에는 바로 다음 계획 저장 API로 이어지는 UX를 붙이면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-완주 | | studyDays | 상단의 N일 만에 코스를 완주했어요 headline source입니다. | | latestCompletedLessonCount, studyDays, siteUrlCount | recap 3지표 카드 source입니다. | | completedAt | 완주 시각 메타/공유 문구 source입니다. | | operatorMessage | 하단 운영진 축하 메시지 영역 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 비로그인 요청은 401 AUTHENTICATION_FAILED | | 권한 | 로그인했지만 결제자/운영자가 아니거나 아직 완주하지 않았으면 403 AUTHORIZATION_FAILED |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | latestCompletedLessonCount는 완주 시점 snapshot인 course_completion.lesson_count를 반환합니다. | | 규칙 | studyDays는 첫 lesson_progress.created_at ~ course_completion.completed_at inclusive day 기준으로 계산합니다. | | 규칙 | siteUrlCount는 retrospective.artifact_type = LINK 건수입니다. | | 규칙 | operatorMessage는 course_completion_message의 최신 message를 SoT로 사용합니다. | 

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCourseCompletionRecap(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseCompletionRecapResponse**

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
|**403** | 결제자/운영자 외 접근 또는 미완주 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseCurriculum**
> CourseCurriculumResponse getCourseCurriculum()

                FRD A-04.  ## Narrative - 이 API는 코스 상세의 커리큘럼 아코디언을 그리기 위한 공개 조회 API입니다.   - S-코스상세-B/C에서 챕터 순서와 레슨 제목, 무료 여부, 소요 시간을 보여줄 때 사용합니다.   - 아직 수강하지 않은 사람도 코스 구성을 먼저 훑어볼 수 있게 해주는 역할입니다. - 이 API는 사용자 개인 상태를 거의 반영하지 않습니다.   - 비회원과 로그인 사용자가 같은 구조를 받습니다.   - 잠금 해제 여부나 실제 진도는 여기서 계산하지 않고 A-03 학습여정 API에서 다룹니다. - 프론트엔드는 이 응답을 안내용 구조로 해석하면 됩니다.   - isFree는 무료 레슨 배지나 잠금 아이콘 판단에만 쓰고, 실제 클릭 허용 여부는 다른 API와 함께 판단해야 합니다.   - 레슨이 없는 챕터도 올 수 있으니 빈 챕터도 정상 데이터로 취급해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-코스상세-B, S-코스상세-C | | 비고 | S-코스상세-B | | 비고 | S-코스상세-C | | 비고 | 커리큘럼 섹션의 챕터/레슨 렌더링 기준 API입니다. |  - 이미지명: S-코스상세-B   - 이미지 설명: 코스 상세 중간 영역에서 커리큘럼과 연관 콘텐츠가 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-B.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png\" alt=\"S-코스상세-B\" width=\"720\" />  - 이미지명: S-코스상세-C   - 이미지 설명: 코스 상세 하단 영역에서 추가 정보와 후속 CTA를 보여주는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-C.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-C.png\" alt=\"S-코스상세-C\" width=\"720\" />  공개 코스 커리큘럼을 조회합니다.  ## Request Scope | 항목 | 설명 | |---|---| | 적용 범위 | slug 기준으로 코스를 찾습니다. | | 적용 범위 | 현재 구현은 path에 courseId가 아니라 slug를 사용합니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 응답은 courseId, durationDays, totalChapters, totalLessons, chapters[]를 포함합니다. | | 응답 | 각 chapter에는 chapterId, order, chapterNumber, title, estimatedMinutes, lessons[]가 포함됩니다. | | 응답 | 각 lesson에는 lessonId, order, title, isFree, isLocked, estimatedMinutes가 포함됩니다. | | 응답 | locked는 공개 미리보기 기준 잠금 표시용이며, 사용자별 진도/수강권 overlay는 포함하지 않습니다. | 

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let slug: string; //코스 slug (default to undefined)

const { status, data } = await apiInstance.getCourseCurriculum(
    slug
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] | 코스 slug | defaults to undefined|


### Return type

**CourseCurriculumResponse**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseDetail1**
> CourseDetailResponse getCourseDetail1()

                FRD A-02.  ## Narrative - 이 API는 코스 상세 화면 전체를 여는 기준 API입니다.   - S-코스상세-A/B/C는 모두 이 응답을 바탕으로 같은 코스를 서로 다른 구역에 나눠 보여줍니다.   - 무료수강, 결제, 질문, 학습여정으로 이어지는 다음 액션도 여기서 받은 courseId를 기준으로 연결됩니다. - 이 API에서 가장 중요한 값은 viewerStatus입니다.   - 비로그인은 ANONYMOUS, 로그인만 한 사용자는 LOGIN_ONLY, 무료수강자는 FREE_ENROLLED, 결제자는 PAID, 관리자는 ADMIN으로 내려옵니다.   - 화면은 이 값으로 CTA 문구, 가격 카드, 학습여정 진입 가능 여부를 분기해야 합니다. - 프론트엔드는 상태를 스스로 다시 계산하지 말고 서버 응답을 그대로 믿어야 합니다.   - FREE_ENROLLED면 freeLessonCount와 journeyMapAvailable를 기준으로 무료 범위 UX를 그립니다.   - PAID면 hasFullAccess와 isPaidEnrolled를 기준으로 학습 시작 상태로 바꾸면 됩니다.   - ADMIN은 관리 권한으로 전체 코스를 볼 수 있지만, 실제 무료수강/결제 여부는 isFreeEnrolled, isPaidEnrolled로 따로 판단해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-코스상세-A, S-코스상세-B, S-코스상세-C | | 비고 | S-코스상세-A (헤로/사이드 결제 카드) | | 비고 | S-코스상세-B | | 비고 | S-코스상세-C | | 비고 | 프론트는 이 응답 하나로 viewer 상태 분기, CTA 문구, 결제 카드 노출 여부를 결정합니다. |  - 이미지명: S-코스상세-A   - 이미지 설명: 코스 상세 상단에서 코스 소개와 가격·CTA 카드가 함께 보이는 대표 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-A.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-A.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-A.png\" alt=\"S-코스상세-A\" width=\"720\" />  - 이미지명: S-코스상세-B   - 이미지 설명: 코스 상세 중간 영역에서 커리큘럼과 연관 콘텐츠가 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-B.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-B.png\" alt=\"S-코스상세-B\" width=\"720\" />  - 이미지명: S-코스상세-C   - 이미지 설명: 코스 상세 하단 영역에서 추가 정보와 후속 CTA를 보여주는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-C.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-C.png\" alt=\"S-코스상세-C\" width=\"720\" />  slug 기준으로 코스 상세를 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 비회원도 호출 가능하며 401 대신 viewerStatus=ANONYMOUS 응답을 반환합니다. | | 권한 | 로그인 상태와 수강 상태에 따라 viewerStatus가 ANONYMOUS, LOGIN_ONLY, FREE_ENROLLED, PAID, ADMIN으로 달라집니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | A-02는 코스 진입의 canonical read model입니다. 이후 무료수강신청/결제 API에는 이 응답의 courseId를 재사용합니다. | | 공통 필드 | courseId, slug, viewerStatus, title, description, thumbnailUrl | | 화면 메타 | learnerCount, durationDays, completionCount, exploringCount | | ANONYMOUS/LOGIN_ONLY | plans, earlyBirdEndsAt, canFreeEnroll, canPurchase | | FREE_ENROLLED | isFreeEnrolled=true, freeLessonCount, journeyMapAvailable=true, hasFullAccess=false | | PAID | isPaidEnrolled=true, journeyMapAvailable=true, hasFullAccess=true | | ADMIN | journeyMapAvailable=true, hasFullAccess=true 이지만 실제 수강 상태는 isFreeEnrolled / isPaidEnrolled로 별도 표현합니다. | | ADMIN | 관리자가 아직 무료수강신청/결제를 하지 않았다면 canFreeEnroll=true, canPurchase=true 로 내려옵니다. | | 응답 | plans와 가격 정보는 활성 `course_plan` 목록 기준으로 내려갑니다. | | 응답 | top-level `earlyBirdEndsAt`은 대표 활성 플랜의 `course_plan.early_bird_ends_at`를 KST offset 포함 ISO8601 형식으로 직렬화한 값입니다. class-level legacy 컬럼은 사용하지 않습니다. | | 응답 | 현재 구현은 JsonInclude.NON_NULL 기준이라 상태에 맞지 않는 optional field는 null 대신 JSON에서 생략될 수 있습니다. |  ## Lookup Rules | 항목 | 설명 | |---|---| | 조회 규칙 | 공개 상태 코스(OPEN, COMING_SOON)만 조회 대상입니다. | | 조회 규칙 | 존재하지 않거나 HIDDEN인 코스는 404를 반환합니다. | | 조회 규칙 | 로그인 사용자 상태 판정 우선순위는 ADMIN > PAID > FREE_ENROLLED > LOGIN_ONLY 입니다. | 

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let slug: string; //코스 slug (예: vibe-coding-intro) (default to undefined)

const { status, data } = await apiInstance.getCourseDetail1(
    slug
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] | 코스 slug (예: vibe-coding-intro) | defaults to undefined|


### Return type

**CourseDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseDrawer**
> CourseDrawerResponse getCourseDrawer()

                FRD A-07.                  커리큘럼 드로어는 레슨 상세에서 현재 위치와 전체 구조를 빠르게 왕복하기 위한 보조 탐색 모델입니다. 접근 가능한 레슨, 잠금 상태, 현재 레슨 강조가 함께 들어와야 FE가 추가 계산 없이 바로 그릴 수 있습니다.  ## Narrative - 이 API는 레슨 상세 옆의 커리큘럼 드로어를 열 때 호출합니다.   - S-레슨드로어는 현재 코스 전체 구조와 사용자의 진행 상태를 함께 보여줘야 해서, 단순 커리큘럼보다 더 개인화된 응답이 필요합니다.   - 사용자는 여기서 다음 레슨으로 바로 이동하거나 완료한 레슨을 다시 열 수 있습니다. - 이 응답은 결제자 기준 학습 구조입니다.   - 무료수강자는 이 드로어 대신 학습여정 FREE 화면을 써야 합니다.   - 각 lesson의 status와 accessible을 보고 현재 클릭 가능한지 판단합니다. - 프론트엔드는 드로어 안의 현재 위치를 이 응답으로 표시하면 됩니다.   - status가 COMPLETED면 완료 표시, IN_PROGRESS면 현재 레슨 강조, LOCKED면 비활성 처리로 해석하면 됩니다.   - 레슨 순서는 chapters와 lessons 배열 순서를 그대로 써야 합니다.  ## Screen Preview - 이미지명: S-레슨드로어   - 이미지 설명: 현재 코스의 레슨 순서와 잠금 상태를 옆 패널에서 보여주는 드로어 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨드로어.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%93%9C%EB%A1%9C%EC%96%B4.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%93%9C%EB%A1%9C%EC%96%B4.png\" alt=\"S-레슨드로어\" width=\"720\" />  - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨드로어 | | Screenmap Path | src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨드로어.png | | Screenmap Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EB%93%9C%EB%A1%9C%EC%96%B4.png |  레슨 상세 좌측 커리큘럼 드로어에 필요한 챕터/레슨 트리와 개인 진도를 반환합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 비로그인 요청은 401 AUTHENTICATION_FAILED | | 권한 | 결제자/운영자 외 사용자는 403 LESSON_ACCESS_DENIED | | 권한 | 무료수강신청자는 A-03 journey-map을 사용하고, drawer API 대상이 아닙니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 챕터는 order ASC, 레슨은 order ASC 정렬입니다. | | 규칙 | status는 호출자 기준 LOCKED / IN_PROGRESS / COMPLETED 입니다. | | 규칙 | isLocked는 status == LOCKED와 동일한 의미의 UI 편의 필드입니다. | | 규칙 | isCurrentLesson은 현재 IN_PROGRESS 레슨에만 true 입니다. | | 규칙 | isDefaultExpanded는 현재 레슨이 있거나, 챕터 내 모든 레슨이 COMPLETED이면 true 입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | chapters[] | 드로어에 렌더링할 챕터 목록입니다. | | chapters[].lessons[] | 각 챕터의 레슨 목록입니다. | | status | 현재 사용자 기준 LOCKED, IN_PROGRESS, COMPLETED 상태입니다. | | isLocked | 클릭 가능 여부를 바로 판단하기 위한 UI 편의 필드입니다. | | isCurrentLesson | 현재 열려 있는 레슨 강조 표시 source입니다. | | isDefaultExpanded | 초기 펼침 상태입니다. |  

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCourseDrawer(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseDrawerResponse**

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
|**403** | 결제자/운영자 외 접근 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseJourneyMap**
> CourseJourneyMapResponse getCourseJourneyMap()

                FRD A-03.                  학습 여정 맵은 무료수강자와 결제자의 진행 경험을 가장 크게 갈라주는 핵심 화면입니다. 같은 챕터 구조를 보더라도 accessible과 status 해석이 사용자 상태에 따라 달라집니다.  ## Narrative - 이 API는 학습여정 화면에서 챕터와 레슨 트리를 보여주기 위해 호출합니다.   - S-학습여정-결제자와 S-학습여정-무료는 같은 코스 구조를 보지만, 접근 가능한 레슨 수가 다르기 때문에 이 응답이 꼭 필요합니다.   - 특히 nextAccessibleLesson 카드와 현재 진행 상태를 한 번에 맞추는 용도입니다. - 사용자 상태에 따라 같은 레슨도 다르게 보입니다.   - FREE_ENROLLED는 전체 트리를 보되 무료 레슨만 isAccessible=true 입니다.   - PAID는 전체 레슨이 열리고 status 값으로 COMPLETED, IN_PROGRESS, LOCKED를 그대로 표시하면 됩니다.   - ADMIN도 전체 레슨이 열리며, 실제 결제/무료수강 여부와 무관하게 운영 검수용 full access로 동작합니다. - 프론트엔드는 isAccessible과 status를 별개로 봐야 합니다.   - FREE_ENROLLED에서 유료 레슨은 보여주되 잠금 처리만 하면 됩니다.   - nextAccessibleLesson과 isCourseCompleted는 별도 계산하지 말고 서버가 준 값을 그대로 써야 다음 이동이 틀어지지 않습니다.  ## Screen Preview - 이미지명: S-학습여정-결제자   - 이미지 설명: 결제자의 학습여정에서 전체 레슨 접근과 진행 상태가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-학습여정-결제자.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EA%B2%B0%EC%A0%9C%EC%9E%90.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EA%B2%B0%EC%A0%9C%EC%9E%90.png\" alt=\"S-학습여정-결제자\" width=\"720\" />  - 이미지명: S-학습여정-무료   - 이미지 설명: 무료수강자의 학습여정에서 무료 레슨 범위와 잠금 상태가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-학습여정-무료.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EB%AC%B4%EB%A3%8C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EB%AC%B4%EB%A3%8C.png\" alt=\"S-학습여정-무료\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen (PAID) | S-학습여정-결제자 | | Screenmap Path (PAID) | src/main/resources/static/api-docs/frd-screenmap/v0.6/S-학습여정-결제자.png | | Screenmap Raw URL (PAID) | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EA%B2%B0%EC%A0%9C%EC%9E%90.png | | Primary Screen (FREE_ENROLLED) | S-학습여정-무료 | | Screenmap Path (FREE) | src/main/resources/static/api-docs/frd-screenmap/v0.6/S-학습여정-무료.png | | Screenmap Raw URL (FREE) | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EB%AC%B4%EB%A3%8C.png |  결제자 또는 무료수강신청자의 학습 여정 맵을 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 비로그인 요청은 401 AUTHENTICATION_FAILED | | 권한 | 로그인했지만 수강권이 없으면 403 LESSON_ACCESS_DENIED | | 권한 | FREE_ENROLLED, PAID, ADMIN만 호출할 수 있습니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 응답은 chapters[].order ASC, 각 챕터 내부 lessons[].order ASC로 정렬됩니다. flat lessons[]도 같은 순서를 유지합니다. | | 응답 | FREE_ENROLLED는 전체 챕터/레슨 구조를 보되, 무료 레슨만 isAccessible=true 입니다. | | 응답 | FREE_ENROLLED의 유료 레슨은 status=LOCKED, isAccessible=false 로 반환합니다. | | 응답 | PAID는 전체 레슨이 isAccessible=true 입니다. | | 응답 | ADMIN도 전체 레슨이 isAccessible=true 입니다. | | 응답 | status는 LOCKED / IN_PROGRESS / COMPLETED 중 하나입니다. |  ## Field Notes | 필드 | 설명 | |---|---| | viewerStatus | FREE_ENROLLED, PAID, ADMIN | | chapters[].chapterNumber | 화면의 Chapter 01 같은 표기 기준 번호 | | chapters[].lessons[].isAccessible | 현재 사용자가 실제로 클릭 진입 가능한지 여부 | | chapters[].lessons[].status | 호출자 기준 진도 상태 |  ## Flow Notes | 상황 | 설명 | |---|---| | FREE_ENROLLED | 무료 레슨만 클릭 가능하고 유료 레슨은 미리보기 수준으로 보입니다. | | PAID | 전체 레슨이 접근 가능하며 다음 레슨 해금 상태가 그대로 반영됩니다. | | ADMIN | 전체 레슨이 접근 가능하며 운영 검수용 full access 상태입니다. | | COMPLETED | 완료 레슨은 회고 완료/완주 흐름 시각화 source가 됩니다. |  

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCourseJourneyMap(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseJourneyMapResponse**

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
|**403** | 수강권 없음 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourseProgress**
> CourseProgressResponse getCourseProgress()

                FRD A-06.                  진행률 API는 상단 진행바 숫자만 채우는 용도가 아니라, 최근 완료 레슨과 다음 레슨 CTA까지 연결하는 요약 모델입니다. 그래서 단순 퍼센트 외에 완주 여부와 다음 이동 문맥도 함께 담습니다.  ## Narrative - 이 API는 진행률 막대와 다음 레슨 요약을 그릴 때 호출합니다.   - S-레슨상세 상단, S-학습여정-결제자 상단, 완주 직전 요약 문맥이 이 응답을 공유합니다.   - 사용자가 지금 어디까지 왔는지 숫자로 바로 보여주기 위한 API입니다. - 결제자 전용 진행 모델입니다.   - 무료수강자나 미결제 사용자는 이 API 대상이 아니며, 그 경우에는 학습여정 FREE 모델을 사용해야 합니다.   - latestCompletedLesson과 nextAccessibleLesson은 결제자의 실제 lesson_progress 상태를 반영합니다. - 프론트엔드는 퍼센트나 다음 레슨을 다시 계산하지 않는 편이 안전합니다.   - completedCount, totalCount, progressPercent가 이미 화면 표시용으로 준비된 값입니다.   - nextAccessibleLesson이 null이면 완주 상태로 해석하고 recap 진입 UX로 넘기면 됩니다.  ## Screen Preview - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  - 이미지명: S-학습여정-결제자   - 이미지 설명: 결제자의 학습여정에서 전체 레슨 접근과 진행 상태가 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-학습여정-결제자.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EA%B2%B0%EC%A0%9C%EC%9E%90.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%95%99%EC%8A%B5%EC%97%AC%EC%A0%95-%EA%B2%B0%EC%A0%9C%EC%9E%90.png\" alt=\"S-학습여정-결제자\" width=\"720\" />  - 이미지명: S-완주   - 이미지 설명: 코스 완주 후 회고와 다음 계획, 완주 메시지가 노출되는 완료 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-완주.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%99%84%EC%A3%BC.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%99%84%EC%A3%BC.png\" alt=\"S-완주\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨상세 상단 진행바 | | Screenmap Path | src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png | | Screenmap Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png | | Also Used By | S-학습여정-결제자, S-완주 |  결제자의 코스 전체 진행률을 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 비로그인 요청은 401 AUTHENTICATION_FAILED | | 권한 | 로그인했지만 결제자/운영자가 아니면 403 LESSON_ACCESS_DENIED | | 권한 | 무료수강신청자는 부분 진도만 가지므로 이 API 대상이 아닙니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | completedLessons는 LessonProgress.status=COMPLETED 개수입니다. | | 규칙 | totalLessons는 해당 코스 전체 lesson 수입니다. | | 규칙 | progressRate는 completedLessons / totalLessons를 소수 둘째 자리까지 반올림한 값입니다. | | 규칙 | isCourseCompleted는 course_completion record 존재 여부를 기준으로 반환합니다. 이 record는 결제자가 모든 레슨을 완료했을 때만 생성됩니다. |  ## Response Fields | 필드 | 설명 | |---|---| | completedLessons | 완료한 레슨 수입니다. | | totalLessons | 전체 레슨 수입니다. | | progressRate | 진행률 퍼센트입니다. | | isCourseCompleted | 모든 레슨 완료로 생성된 완주 기록 존재 여부입니다. |  

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getCourseProgress(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseProgressResponse**

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
|**403** | 결제자/운영자 외 접근 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCourses1**
> CourseListResponse getCourses1()

                FRD A-01.  ## Narrative - 이 API는 코스 목록 화면을 그릴 때 가장 먼저 부르는 공개 조회 API입니다.   - S-코스목록과 홈 랜딩은 이 응답으로 카드 제목, 요약, 태그, 가격, CTA를 한 번에 그립니다.   - OPEN 코스와 COMING_SOON 코스가 한 리스트에 같이 보이기 때문에, 화면은 카드마다 ctaType과 가격 메타를 따로 해석해야 합니다. - 사용자 상태에 따라 응답이 달라지는 API는 아닙니다.   - 비회원, 로그인 사용자, 무료수강신청자, 결제자 모두 같은 shape의 목록을 받습니다.   - 즉 이 화면에서는 로그인 상태보다 코스 상태가 더 중요합니다. - 프론트엔드는 카드별 상태를 직접 추론하지 말고 응답값을 그대로 써야 합니다.   - OPEN 카드는 바로 상세로 보내고, COMING_SOON 카드는 알림 신청 CTA로 보내면 됩니다.   - 빈 목록이어도 오류가 아니라 정상 결과이므로 empty state를 그리면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-코스목록, S-홈랜딩-A, S-홈랜딩-B, S-홈랜딩-C | | 비고 | S-코스목록 | | 비고 | S-홈랜딩-A | | 비고 | S-홈랜딩-B | | 비고 | S-홈랜딩-C |  - 이미지명: S-코스목록   - 이미지 설명: 클래스 코스 카드들이 나열되고 비교되는 코스 목록 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스목록.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EB%AA%A9%EB%A1%9D.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EB%AA%A9%EB%A1%9D.png\" alt=\"S-코스목록\" width=\"720\" />  - 이미지명: S-홈랜딩-A   - 이미지 설명: 홈 랜딩 상단에서 대표 코스와 첫 진입 CTA를 노출하는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-홈랜딩-A.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-A.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-A.png\" alt=\"S-홈랜딩-A\" width=\"720\" />  - 이미지명: S-홈랜딩-B   - 이미지 설명: 홈 랜딩 중간에서 코스/콘텐츠 소개 섹션이 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-홈랜딩-B.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-B.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-B.png\" alt=\"S-홈랜딩-B\" width=\"720\" />  - 이미지명: S-홈랜딩-C   - 이미지 설명: 홈 랜딩 하단에서 추가 추천과 보조 CTA가 이어지는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-홈랜딩-C.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%99%88%EB%9E%9C%EB%94%A9-C.png\" alt=\"S-홈랜딩-C\" width=\"720\" />  공개 코스 목록을 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 비회원/로그인 사용자 모두 호출할 수 있습니다. | | 권한 | 인증 토큰 유무와 관계없이 같은 shape의 응답을 반환합니다. |  ## Query Rules | 항목 | 설명 | |---|---| | 조회 규칙 | status 기본값은 ALL_PUBLIC 입니다. | | 조회 규칙 | ALL_PUBLIC은 OPEN, COMING_SOON을 함께 반환합니다. | | 조회 규칙 | sort 기본값은 LATEST 입니다. | | 조회 규칙 | enum 외 값은 400으로 거부합니다. | | 조회 규칙 | page는 0 이상, size는 1~50 범위여야 합니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 응답은 BaseResponse<PageResponseDto<CourseSummaryResponse>> 입니다. | | 응답 | 빈 목록도 200으로 반환하며 content=[], totalElements=0을 사용합니다. | | 응답 | 목록 필드에는 카드 렌더링용 headline, summary, tags, learnerLabel, ctaType가 함께 포함됩니다. | | 응답 | 가격 필드는 regularPrice(정가), discountPrice(할인가) 이름을 사용합니다. | 

### Example

```typescript
import {
    CourseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let status: 'ALL_PUBLIC' | 'OPEN' | 'COMING_SOON'; //코스 상태 필터. 미지정 시 ALL_PUBLIC (optional) (default to 'ALL_PUBLIC')
let sort: 'LATEST' | 'POPULAR' | 'COMPLETION_RATE'; //목록 정렬. 미지정 시 LATEST (optional) (default to 'LATEST')
let page: number; //0-based 페이지 번호 (optional) (default to 0)
let size: number; //페이지 크기(1~50) (optional) (default to 20)

const { status, data } = await apiInstance.getCourses1(
    status,
    sort,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**&#39;ALL_PUBLIC&#39; | &#39;OPEN&#39; | &#39;COMING_SOON&#39;**]**Array<&#39;ALL_PUBLIC&#39; &#124; &#39;OPEN&#39; &#124; &#39;COMING_SOON&#39;>** | 코스 상태 필터. 미지정 시 ALL_PUBLIC | (optional) defaults to 'ALL_PUBLIC'|
| **sort** | [**&#39;LATEST&#39; | &#39;POPULAR&#39; | &#39;COMPLETION_RATE&#39;**]**Array<&#39;LATEST&#39; &#124; &#39;POPULAR&#39; &#124; &#39;COMPLETION_RATE&#39;>** | 목록 정렬. 미지정 시 LATEST | (optional) defaults to 'LATEST'|
| **page** | [**number**] | 0-based 페이지 번호 | (optional) defaults to 0|
| **size** | [**number**] | 페이지 크기(1~50) | (optional) defaults to 20|


### Return type

**CourseListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 status/page/size 파라미터 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **upsertCourseCompletionNextPlan**
> CourseCompletionNextPlanResponse upsertCourseCompletionNextPlan(courseCompletionNextPlanRequest)

                FRD H-02.                  결제 완료 후 코스를 완주한 사용자의 다음 계획을 저장합니다.  ## Narrative - 이 API는 완주 화면에서 다음에 만들 계획을 저장할 때 호출합니다.   - S-완주 화면은 회고만 보여주고 끝나는 게 아니라, 다음 액션까지 적게 만드는 흐름이라 저장 API가 같이 필요합니다.   - 사용자는 같은 화면에서 처음 저장하거나 다시 수정할 수 있습니다. - 접근 조건은 recap 조회와 같습니다.   - 완주한 결제자만 저장할 수 있고, 미완주 상태에서는 403으로 막힙니다.   - 첫 저장과 재저장이 모두 가능하므로 FE는 생성/수정 버튼을 굳이 나눌 필요가 없습니다. - 프론트엔드는 저장 성공 뒤 상태를 간단하게 해석하면 됩니다.   - nextPlanId가 오면 이후 수정의 기준 키로 보관하면 됩니다.   - 재저장도 성공 결과로 보고 작성 중 상태만 정리하면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-완주 | | request content | 다음엔 무엇을 만들고 싶은가요? textarea source입니다. | | response savedAt | 저장 완료 toast/최근 저장 시각 표시 source입니다. | | response nextPlanId | 재저장 시 동일 draft row를 식별하는 내부 key입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 비로그인 요청은 401 AUTHENTICATION_FAILED | | 권한 | 로그인했지만 결제자/운영자가 아니거나 아직 완주하지 않았으면 403 AUTHORIZATION_FAILED |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | (member_id, course_id) 기준으로 1개 row만 유지합니다. | | 규칙 | 첫 저장은 201, 재저장은 200으로 응답합니다. | | 규칙 | 재저장은 기존 row의 content를 최신값으로 갱신하며 nextPlanId는 유지됩니다. | | 규칙 | savedAt은 최신 저장 시각입니다. | 

### Example

```typescript
import {
    CourseApi,
    Configuration,
    CourseCompletionNextPlanRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let courseCompletionNextPlanRequest: CourseCompletionNextPlanRequest; //

const { status, data } = await apiInstance.upsertCourseCompletionNextPlan(
    courseId,
    courseCompletionNextPlanRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseCompletionNextPlanRequest** | **CourseCompletionNextPlanRequest**|  | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseCompletionNextPlanResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 첫 저장 성공 |  -  |
|**200** | 재저장 성공 |  -  |
|**400** | content blank 또는 잘못된 요청 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 결제자/운영자 외 접근 또는 미완주 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

