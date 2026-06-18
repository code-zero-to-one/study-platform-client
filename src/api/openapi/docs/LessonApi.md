# LessonApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getLessonDetail1**](#getlessondetail1) | **GET** /api/v5/lessons/{lessonId} | 레슨 상세 조회|

# **getLessonDetail1**
> LessonDetailResponse getLessonDetail1()

                FRD A-05.                  로그인 사용자가 레슨 영상/따라해보기 본문과 자신의 진도 상태를 조회합니다.                  레슨 상세는 학습 경험의 중심 화면이라 비디오, 본문, 진도, 돌아보기 분기 정보를 한 번에 내려줘야 합니다. FE는 이 응답을 기준으로 따라해보기와 돌아보기 탭 전환을 같은 문맥에서 처리합니다.  ## Narrative - 이 API는 레슨 상세 화면의 중심 데이터입니다.   - S-레슨상세에서 영상, 따라해보기 본문, 현재 진도, 돌아보기 진입 정보를 한 번에 열 때 사용합니다.   - deep link로 바로 들어와도 courseTitle과 레슨 메타를 같이 내려주기 때문에 별도 선행 조회를 줄일 수 있습니다. - 사용자 상태에 따라 접근 가능 범위가 갈립니다.   - 비로그인은 무료 레슨이어도 401입니다.   - 유료 레슨은 결제자만 볼 수 있고, 무료수강자는 무료 레슨 범위 안에서만 정상 응답을 받습니다. - 프론트엔드는 본문과 돌아보기 분기를 이 응답 기준으로 맞추면 됩니다.   - retrospectivePurpose, retrospectivePrompt, artifactSubmissionRequired는 돌아보기 화면을 어떻게 보여줄지 정하는 핵심 값입니다.   - contentMarkdown은 이미 공개 URL로 정리된 값이므로 FE가 추가 변환 없이 렌더링해도 됩니다.  ## Screen Preview - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨상세의 따라해보기 탭 | | courseTitle | 상단 breadcrumb/뒤로가기 문맥 source입니다. | | title | 본문 상단 레슨 제목 source입니다. | | estimatedMinutes | 제목 하단의 약 N분 소요 메타 source입니다. | | learnerCount | 상단 현재 N명과 함께 공부중! 문구 source입니다. | | videoUrl | 상단 비디오 플레이어 source입니다. | | viewCount | 시청/참여 메타 source이며 정상 조회 시 증가합니다. | | retrospectivePurpose / retrospectivePrompt | S-레슨돌아보기 탭 질문 세트와 제출 안내 문구 분기 source입니다. | | artifactSubmissionRequired | 돌아보기 탭의 스크린샷/링크 입력 필수 여부 source입니다. | | contentMarkdown | 따라해보기 본문 source이며 resolve된 public URL이 포함되어 FE가 그대로 렌더링하면 됩니다. | | progressStatus | 상단 진행 상태 및 다음 레슨 이동 분기 source입니다. | | retrospectiveSubmitted | 탭 재진입 시 제출 완료 상태 분기 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | FREE 레슨도 로그인은 필수입니다. 비로그인 요청은 401을 반환합니다. | | 권한 | 유료 레슨은 결제 완료 사용자만 접근 가능합니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 접근 권한 검증을 통과한 정상 조회마다 viewCount가 1 증가합니다. | | 응답 | contentMarkdown은 레슨 본문을 마크다운 문자열로 반환합니다. 저장 시 internal path로 정규화된 이미지는 조회 시 현재 환경 public URL로 resolve된 상태여서 FE가 그대로 렌더링하면 됩니다. | | 응답 | progressStatus는 사용자의 lesson_progress 상태를 반영하며, 레코드가 없으면 LOCKED입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | lessonId / courseId / courseSlug | 레슨 진입과 상위 코스 문맥 식별자입니다. | | title / estimatedMinutes | 상단 제목과 메타 정보입니다. | | videoUrl | 상단 플레이어 source입니다. | | contentMarkdown | 따라해보기 본문 전체입니다. | | retrospectivePurpose | 돌아보기 질문 세트 분기 기준입니다. | | artifactSubmissionRequired | 스크린샷/링크 입력 노출 여부입니다. | | progressStatus | 현재 레슨 진행 상태입니다. | | retrospectiveSubmitted | 회고 탭 재진입 시 읽기/쓰기 모드 분기 기준입니다. |  ## Flow Notes | 상황 | 설명 | |---|---| | 조회 성공 | viewCount가 증가한 값을 응답에 포함합니다. | | 미결제 유료 레슨 | 403으로 막히며 본문/비디오를 내려주지 않습니다. |  

### Example

```typescript
import {
    LessonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getLessonDetail1(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**LessonDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 유료 레슨 접근 권한 없음 |  -  |
|**404** | 레슨을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

