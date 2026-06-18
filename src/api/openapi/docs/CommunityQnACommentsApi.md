# CommunityQnACommentsApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCommunityQnaAnswerComment**](#createcommunityqnaanswercomment) | **POST** /api/v1/community/answers/{answerId}/comments | QnA 답변 댓글 생성|
|[**createCommunityQnaQuestionComment**](#createcommunityqnaquestioncomment) | **POST** /api/v1/community/questions/{questionId}/comments | QnA 질문 댓글 생성|
|[**deleteCommunityQnaComment**](#deletecommunityqnacomment) | **DELETE** /api/v1/community/qna-comments/{commentId} | QnA 댓글 삭제|
|[**getCommunityQnaAnswerComments**](#getcommunityqnaanswercomments) | **GET** /api/v1/community/answers/{answerId}/comments | QnA 답변 댓글 목록 조회|
|[**getCommunityQnaQuestionComments**](#getcommunityqnaquestioncomments) | **GET** /api/v1/community/questions/{questionId}/comments | QnA 질문 댓글 목록 조회|
|[**updateCommunityQnaComment**](#updatecommunityqnacomment) | **PUT** /api/v1/community/qna-comments/{commentId} | QnA 댓글 수정|

# **createCommunityQnaAnswerComment**
> CommunityQnaCommentMutationResponse createCommunityQnaAnswerComment(createCommunityQnaCommentRequest)

Idempotency-Key를 사용해 답변 댓글 리소스를 생성합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration,
    CreateCommunityQnaCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let answerId: number; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let createCommunityQnaCommentRequest: CreateCommunityQnaCommentRequest; //

const { status, data } = await apiInstance.createCommunityQnaAnswerComment(
    answerId,
    idempotencyKey,
    createCommunityQnaCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityQnaCommentRequest** | **CreateCommunityQnaCommentRequest**|  | |
| **answerId** | [**number**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaCommentMutationResponse**

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
|**404** | 답변을 찾을 수 없음 |  -  |
|**409** | 같은 Idempotency-Key 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityQnaQuestionComment**
> CommunityQnaCommentMutationResponse createCommunityQnaQuestionComment(createCommunityQnaCommentRequest)

Idempotency-Key를 사용해 질문 댓글 리소스를 생성합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration,
    CreateCommunityQnaCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let questionId: number; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let createCommunityQnaCommentRequest: CreateCommunityQnaCommentRequest; //

const { status, data } = await apiInstance.createCommunityQnaQuestionComment(
    questionId,
    idempotencyKey,
    createCommunityQnaCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityQnaCommentRequest** | **CreateCommunityQnaCommentRequest**|  | |
| **questionId** | [**number**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaCommentMutationResponse**

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
|**404** | 질문을 찾을 수 없음 |  -  |
|**409** | 같은 Idempotency-Key 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCommunityQnaComment**
> CommunityQnaCommentDeleteResponse deleteCommunityQnaComment()

If-Match revision을 사용해 QnA 댓글 리소스를 soft delete합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let commentId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCommunityQnaComment(
    commentId,
    ifMatch
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commentId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaCommentDeleteResponse**

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
|**404** | 댓글을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityQnaAnswerComments**
> CommunityQnaCommentPageResponse getCommunityQnaAnswerComments()

답변에 속한 댓글 목록을 페이지네이션으로 조회합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let answerId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getCommunityQnaAnswerComments(
    answerId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**CommunityQnaCommentPageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 답변을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityQnaQuestionComments**
> CommunityQnaCommentPageResponse getCommunityQnaQuestionComments()

질문에 속한 댓글 목록을 페이지네이션으로 조회합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let questionId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getCommunityQnaQuestionComments(
    questionId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**CommunityQnaCommentPageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 질문을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCommunityQnaComment**
> CommunityQnaCommentMutationResponse updateCommunityQnaComment(updateCommunityQnaCommentRequest)

If-Match revision을 사용해 QnA 댓글 리소스를 수정합니다.

### Example

```typescript
import {
    CommunityQnACommentsApi,
    Configuration,
    UpdateCommunityQnaCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnACommentsApi(configuration);

let commentId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)
let updateCommunityQnaCommentRequest: UpdateCommunityQnaCommentRequest; //

const { status, data } = await apiInstance.updateCommunityQnaComment(
    commentId,
    ifMatch,
    updateCommunityQnaCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCommunityQnaCommentRequest** | **UpdateCommunityQnaCommentRequest**|  | |
| **commentId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityQnaCommentMutationResponse**

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
|**404** | 댓글을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

