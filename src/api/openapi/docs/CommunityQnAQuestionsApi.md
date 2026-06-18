# CommunityQnAQuestionsApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignQuestionReaction**](#assignquestionreaction) | **POST** /api/v1/community/questions/{questionId}/reactions | QnA 질문 반응(좋아요) 등록/취소|
|[**createCommunityQnaQuestion**](#createcommunityqnaquestion) | **POST** /api/v1/community/questions | QnA 질문 생성|
|[**deleteCommunityQnaQuestion**](#deletecommunityqnaquestion) | **DELETE** /api/v1/community/questions/{questionId} | QnA 질문 삭제|
|[**getCommunityQnaQuestionDetail**](#getcommunityqnaquestiondetail) | **GET** /api/v1/community/questions/{questionId} | QnA 질문 상세 aggregate 조회|
|[**getCommunityQnaQuestions**](#getcommunityqnaquestions) | **GET** /api/v1/community/questions | QnA 질문 목록 조회|
|[**recordCommunityQnaQuestionView**](#recordcommunityqnaquestionview) | **POST** /api/v1/community/questions/{questionId}/views | QnA 질문 조회수 이벤트 기록|
|[**updateCommunityQnaQuestion**](#updatecommunityqnaquestion) | **PUT** /api/v1/community/questions/{questionId} | QnA 질문 수정|

# **assignQuestionReaction**
> BaseResponseCommunityQnaReactionResponse assignQuestionReaction(assignCommunityQnaReactionRequest)


### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration,
    AssignCommunityQnaReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let questionId: number; // (default to undefined)
let assignCommunityQnaReactionRequest: AssignCommunityQnaReactionRequest; //

const { status, data } = await apiInstance.assignQuestionReaction(
    questionId,
    assignCommunityQnaReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignCommunityQnaReactionRequest** | **AssignCommunityQnaReactionRequest**|  | |
| **questionId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseCommunityQnaReactionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityQnaQuestion**
> CommunityQnaQuestionMutationResponse createCommunityQnaQuestion(createCommunityQnaQuestionRequest)

Idempotency-Key를 사용해 질문 리소스를 생성합니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration,
    CreateCommunityQnaQuestionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let idempotencyKey: string; // (default to undefined)
let createCommunityQnaQuestionRequest: CreateCommunityQnaQuestionRequest; //

const { status, data } = await apiInstance.createCommunityQnaQuestion(
    idempotencyKey,
    createCommunityQnaQuestionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityQnaQuestionRequest** | **CreateCommunityQnaQuestionRequest**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaQuestionMutationResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**400** | 잘못된 요청 본문 또는 헤더 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**409** | 같은 Idempotency-Key에 다른 payload가 들어옴 |  -  |
|**422** | 질문 본문 이미지 ownership을 확인할 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCommunityQnaQuestion**
> CommunityQnaQuestionDeleteResponse deleteCommunityQnaQuestion()

If-Match revision을 사용해 질문 리소스를 soft delete합니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let questionId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCommunityQnaQuestion(
    questionId,
    ifMatch
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaQuestionDeleteResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**400** | 잘못된 헤더 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 질문을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityQnaQuestionDetail**
> CommunityQnaQuestionAggregateResponse getCommunityQnaQuestionDetail()

질문 본문, 채택 답변, 비채택 답변 페이지, 질문 댓글 페이지를 함께 다루는 질문 상세 전용 read surface입니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let questionId: number; // (default to undefined)
let answerPage: number; // (optional) (default to 1)
let answerSize: number; // (optional) (default to 20)
let questionCommentPage: number; // (optional) (default to 1)
let questionCommentSize: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getCommunityQnaQuestionDetail(
    questionId,
    answerPage,
    answerSize,
    questionCommentPage,
    questionCommentSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionId** | [**number**] |  | defaults to undefined|
| **answerPage** | [**number**] |  | (optional) defaults to 1|
| **answerSize** | [**number**] |  | (optional) defaults to 20|
| **questionCommentPage** | [**number**] |  | (optional) defaults to 1|
| **questionCommentSize** | [**number**] |  | (optional) defaults to 20|


### Return type

**CommunityQnaQuestionAggregateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 questionId 또는 페이지 파라미터 |  -  |
|**404** | 질문을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityQnaQuestions**
> CommunityQnaQuestionListResponse getCommunityQnaQuestions()

질문 목록 전용 aggregate read surface입니다. status filter와 myAnswerExists를 포함한 summary를 반환합니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let status: string; // (optional) (default to 'open')
let page: number; // (optional) (default to 1)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getCommunityQnaQuestions(
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | (optional) defaults to 'open'|
| **page** | [**number**] |  | (optional) defaults to 1|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**CommunityQnaQuestionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 허용되지 않은 status filter |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recordCommunityQnaQuestionView**
> CommunityQnaQuestionViewEventResponse recordCommunityQnaQuestionView()

로그인 사용자 또는 익명 viewer key 기준으로 QnA 질문의 24시간 dedupe 조회수를 기록합니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let questionId: number; // (default to undefined)
let communityViewerKey: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.recordCommunityQnaQuestionView(
    questionId,
    communityViewerKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionId** | [**number**] |  | defaults to undefined|
| **communityViewerKey** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CommunityQnaQuestionViewEventResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 기록 성공 |  -  |
|**400** | 잘못된 questionId |  -  |
|**404** | 질문을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCommunityQnaQuestion**
> CommunityQnaQuestionMutationResponse updateCommunityQnaQuestion(updateCommunityQnaQuestionRequest)

If-Match revision을 사용해 질문 리소스를 수정합니다.

### Example

```typescript
import {
    CommunityQnAQuestionsApi,
    Configuration,
    UpdateCommunityQnaQuestionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAQuestionsApi(configuration);

let questionId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)
let updateCommunityQnaQuestionRequest: UpdateCommunityQnaQuestionRequest; //

const { status, data } = await apiInstance.updateCommunityQnaQuestion(
    questionId,
    ifMatch,
    updateCommunityQnaQuestionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCommunityQnaQuestionRequest** | **UpdateCommunityQnaQuestionRequest**|  | |
| **questionId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaQuestionMutationResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | 잘못된 요청 본문 또는 헤더 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 질문을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**422** | 질문 본문 이미지 ownership을 확인할 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

