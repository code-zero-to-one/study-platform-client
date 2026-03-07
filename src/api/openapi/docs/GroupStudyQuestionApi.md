# GroupStudyQuestionApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createQuestion**](#createquestion) | **POST** /api/v1/group-studies/{groupStudyId}/questions | 그룹스터디 질문 등록|
|[**getCategoriesByStudyClassification**](#getcategoriesbystudyclassification) | **GET** /api/v1/group-studies/questions/categories | 그룹스터디 문의사항 카테고리 목록 조회|
|[**getQuestion**](#getquestion) | **GET** /api/v1/group-studies/{groupStudyId}/questions/{questionId} | 그룹스터디 질문 단건 조회|
|[**getQuestions**](#getquestions) | **GET** /api/v1/group-studies/{groupStudyId}/questions | 그룹스터디 질문 목록 조회|
|[**submitAnswer**](#submitanswer) | **POST** /api/v1/group-studies/{groupStudyId}/questions/{questionId}/answer | 그룹스터디 질문 답변 등록|

# **createQuestion**
> CreateQuestionResponseSchema createQuestion(questionCreationRequest)

그룹스터디에 질문을 등록합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 해당 그룹스터디의 승인된 멤버만 질문 등록 가능  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - RequestBody: QuestionCreationRequest (필수)   - title (필수): 질문 제목 (2 ~ 50자)   - content (필수): 질문 내용 (20 ~ 500자)   - category (필수): 질문 카테고리 (PAYMENT, STUDY_COMMON, LEADER, BUG, CONCERN)   - imageExtension (선택): 이미지 확장자 (PNG, JPG 등 - 이미지 첨부 시에만 전송)  **[Response]** - QuestionCreationResult: 생성된 질문 ID, 이미지 업로드 URL (이미지 첨부 시) - Location 헤더: /group-studies/{groupStudyId}/questions/{questionId} 

### Example

```typescript
import {
    GroupStudyQuestionApi,
    Configuration,
    QuestionCreationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyQuestionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let questionCreationRequest: QuestionCreationRequest; //질문 등록 요청 정보

const { status, data } = await apiInstance.createQuestion(
    groupStudyId,
    questionCreationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionCreationRequest** | **QuestionCreationRequest**| 질문 등록 요청 정보 | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**CreateQuestionResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 질문 등록 성공 |  -  |
|**400** | 요청 파라미터 검증 실패 (CMM001) - 제목(2~50자) 또는 내용(20~500자) 제약 조건 위반 |  -  |
|**403** | 질문 작성자가 그룹스터디 멤버가 아님 (QST001) |  -  |
|**404** | 회원 또는 그룹스터디를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCategoriesByStudyClassification**
> getCategoriesByStudyClassification()

그룹스터디 문의사항의 카테고리를 조회합니다.  **[Request]** - Question Parameter: study-classification - 문의사항을 남기려는 그룹스터디의 classification (MENTOR_STUDY or GROUP_STUDY) 

### Example

```typescript
import {
    GroupStudyQuestionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyQuestionApi(configuration);

let studyClassification: 'GROUP_STUDY' | 'PREMIUM_STUDY' | 'MENTOR_STUDY'; //스터디 분류 (GROUP_STUDY / MENTOR_STUDY) (default to undefined)

const { status, data } = await apiInstance.getCategoriesByStudyClassification(
    studyClassification
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyClassification** | [**&#39;GROUP_STUDY&#39; | &#39;PREMIUM_STUDY&#39; | &#39;MENTOR_STUDY&#39;**]**Array<&#39;GROUP_STUDY&#39; &#124; &#39;PREMIUM_STUDY&#39; &#124; &#39;MENTOR_STUDY&#39;>** | 스터디 분류 (GROUP_STUDY / MENTOR_STUDY) | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 카테고리 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQuestion**
> GetQuestionResponse getQuestion()

질문 ID를 통해 특정 질문의 상세 정보를 조회합니다.  **[권한]** - 작성자, 리더, 관리자만 접근 가능  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - PathVariable: questionId (필수) - 질문 ID 

### Example

```typescript
import {
    GroupStudyQuestionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyQuestionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let questionId: number; //질문 ID (default to undefined)

const { status, data } = await apiInstance.getQuestion(
    groupStudyId,
    questionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **questionId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

**GetQuestionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 질문 조회 성공 |  -  |
|**403** | 질문 접근 권한 없음 (QST004) |  -  |
|**404** | 질문을 찾을 수 없음 (QST003) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQuestions**
> GetQuestionListResponse getQuestions()

그룹스터디의 질문 목록을 페이지네이션으로 조회합니다.  **[권한]** - 리더/관리자: 모든 질문의 상세 내용 열람 가능 (accessible: true) - 일반 멤버: 본인 질문만 상세 내용 열람 가능, 타인 질문은 마스킹 처리 (accessible: false, title/content/authorNickname/authorProfileImage가 null)  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - RequestParam: page (기본값 1) - 페이지 번호 - RequestParam: page-size (기본값 10) - 페이지 크기 

### Example

```typescript
import {
    GroupStudyQuestionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyQuestionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let page: number; //페이지 번호 (1부터 시작) (optional) (default to 1)
let pageSize: number; //페이지 크기 (optional) (default to 15)

const { status, data } = await apiInstance.getQuestions(
    groupStudyId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (1부터 시작) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to 15|


### Return type

**GetQuestionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 질문 목록 조회 성공 |  -  |
|**404** | 그룹스터디를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitAnswer**
> submitAnswer(answerSubmitRequest)

그룹스터디 질문에 답변을 등록합니다.  **[권한]** - 해당 그룹스터디의 리더 또는 관리자만 답변 등록 가능  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - PathVariable: questionId (필수) - 질문 ID - RequestBody: AnswerSubmitRequest (필수)   - answer (필수): 답변 내용 (20 ~ 1500자)  **[Response]** - AnswerSubmitResult: 질문 ID, 변경된 상태 

### Example

```typescript
import {
    GroupStudyQuestionApi,
    Configuration,
    AnswerSubmitRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyQuestionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let questionId: number; //질문 ID (default to undefined)
let answerSubmitRequest: AnswerSubmitRequest; //답변 등록 요청 정보

const { status, data } = await apiInstance.submitAnswer(
    groupStudyId,
    questionId,
    answerSubmitRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerSubmitRequest** | **AnswerSubmitRequest**| 답변 등록 요청 정보 | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **questionId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 답변 등록 성공 |  -  |
|**400** | 요청 파라미터 검증 실패 (CMM001) - 답변 내용(20~1500자) 제약 조건 위반 |  -  |
|**403** | 답변 권한 없음 (QST004) - 리더 또는 관리자만 답변 가능 |  -  |
|**404** | 질문을 찾을 수 없음 (QST003) |  -  |
|**409** | 이미 답변된 질문 (QST005) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

