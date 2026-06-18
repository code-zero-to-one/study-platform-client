# CommunityQnAAnswersApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignAnswerReaction**](#assignanswerreaction) | **POST** /api/v1/community/answers/{answerId}/reactions | QnA 답변 반응(좋아요) 등록/취소|
|[**createCommunityQnaAnswer**](#createcommunityqnaanswer) | **POST** /api/v1/community/questions/{questionId}/answers | QnA 답변 생성|
|[**deleteCommunityQnaAnswer**](#deletecommunityqnaanswer) | **DELETE** /api/v1/community/answers/{answerId} | QnA 답변 삭제|
|[**updateCommunityQnaAnswer**](#updatecommunityqnaanswer) | **PUT** /api/v1/community/answers/{answerId} | QnA 답변 수정|

# **assignAnswerReaction**
> BaseResponseCommunityQnaReactionResponse assignAnswerReaction(assignCommunityQnaReactionRequest)


### Example

```typescript
import {
    CommunityQnAAnswersApi,
    Configuration,
    AssignCommunityQnaReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswersApi(configuration);

let answerId: number; // (default to undefined)
let assignCommunityQnaReactionRequest: AssignCommunityQnaReactionRequest; //

const { status, data } = await apiInstance.assignAnswerReaction(
    answerId,
    assignCommunityQnaReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignCommunityQnaReactionRequest** | **AssignCommunityQnaReactionRequest**|  | |
| **answerId** | [**number**] |  | defaults to undefined|


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

# **createCommunityQnaAnswer**
> CommunityQnaAnswerCreateResponse createCommunityQnaAnswer(createCommunityQnaAnswerRequest)

Idempotency-Key를 사용해 질문의 답변 리소스를 생성합니다. developer 등록 회원만 답변할 수 있고, 질문당 같은 회원은 답변 하나만 허용됩니다.

### Example

```typescript
import {
    CommunityQnAAnswersApi,
    Configuration,
    CreateCommunityQnaAnswerRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswersApi(configuration);

let questionId: number; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let createCommunityQnaAnswerRequest: CreateCommunityQnaAnswerRequest; //

const { status, data } = await apiInstance.createCommunityQnaAnswer(
    questionId,
    idempotencyKey,
    createCommunityQnaAnswerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityQnaAnswerRequest** | **CreateCommunityQnaAnswerRequest**|  | |
| **questionId** | [**number**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaAnswerCreateResponse**

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
|**404** | 질문을 찾을 수 없음 |  -  |
|**409** | 질문당 1인 1답변 제약 또는 같은 Idempotency-Key 충돌 |  -  |
|**422** | 답변 본문 이미지 ownership을 확인할 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCommunityQnaAnswer**
> CommunityQnaAnswerDeleteResponse deleteCommunityQnaAnswer()

If-Match revision을 사용해 답변 리소스를 soft delete합니다. 채택된 답변을 삭제하면 질문의 acceptedAnswer도 함께 해제됩니다.

### Example

```typescript
import {
    CommunityQnAAnswersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswersApi(configuration);

let answerId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCommunityQnaAnswer(
    answerId,
    ifMatch
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaAnswerDeleteResponse**

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
|**404** | 답변을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCommunityQnaAnswer**
> CommunityQnaAnswerMutationResponse updateCommunityQnaAnswer(updateCommunityQnaAnswerRequest)

If-Match revision을 사용해 답변 리소스를 수정합니다.

### Example

```typescript
import {
    CommunityQnAAnswersApi,
    Configuration,
    UpdateCommunityQnaAnswerRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswersApi(configuration);

let answerId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)
let updateCommunityQnaAnswerRequest: UpdateCommunityQnaAnswerRequest; //

const { status, data } = await apiInstance.updateCommunityQnaAnswer(
    answerId,
    ifMatch,
    updateCommunityQnaAnswerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCommunityQnaAnswerRequest** | **UpdateCommunityQnaAnswerRequest**|  | |
| **answerId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaAnswerMutationResponse**

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
|**404** | 답변을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**422** | 답변 본문 이미지 ownership을 확인할 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

