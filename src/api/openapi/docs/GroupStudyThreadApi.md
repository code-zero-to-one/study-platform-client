# GroupStudyThreadApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createComment**](#createcomment) | **POST** /api/v1/group-studies/{groupStudyId}/threads/{threadId}/comments | 그룹스터디 스레드 댓글 등록|
|[**createThread**](#createthread) | **POST** /api/v1/group-studies/{groupStudyId}/threads | 그룹스터디 스레드 글 등록|
|[**deleteComment**](#deletecomment) | **DELETE** /api/v1/group-studies/{groupStudyId}/threads/{threadId}/comments/{commentId} | 그룹스터디 스레드 댓글 삭제|
|[**deleteThread**](#deletethread) | **DELETE** /api/v1/group-studies/{groupStudyId}/threads/{threadId} | 그룹스터디 스레드 글 삭제|
|[**getComments**](#getcomments) | **GET** /api/v1/group-studies/{groupStudyId}/threads/{threadId}/comments | 그룹스터디 스레드 댓글 조회|
|[**getThreads**](#getthreads) | **GET** /api/v1/group-studies/{groupStudyId}/threads | 그룹스터디 스레드 글 조회|
|[**toggleCommentReaction**](#togglecommentreaction) | **POST** /api/v1/group-studies/comments/{threadId}/{commentId}/reactions | 스레드 및 댓글에 좋아요/싫어요 토글 눌렀을 때|
|[**toggleThreadReaction**](#togglethreadreaction) | **POST** /api/v1/group-studies/threads/{groupStudyId}/{threadId}/reactions | 스레드 및 댓글에 좋아요/싫어요 토글 눌렀을 때|
|[**updateComment**](#updatecomment) | **PUT** /api/v1/group-studies/{groupStudyId}/threads/{threadId}/comments/{commentId} | 그룹스터디 스레드 댓글 수정|
|[**updateThread**](#updatethread) | **PUT** /api/v1/group-studies/{groupStudyId}/threads/{threadId} | 그룹스터디 스레드 글 수정|

# **createComment**
> ThreadCommentResponseSchema createComment(groupStudyThreadCommentRequest)

스터디 멤버가 특정 스레드에 댓글을 등록합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    GroupStudyThreadCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let groupStudyThreadCommentRequest: GroupStudyThreadCommentRequest; //

const { status, data } = await apiInstance.createComment(
    groupStudyId,
    threadId,
    groupStudyThreadCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyThreadCommentRequest** | **GroupStudyThreadCommentRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|


### Return type

**ThreadCommentResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 스레드 댓글 등록 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createThread**
> ThreadSummaryResponse createThread(groupStudyThreadRequest)

스터디 멤버가 특정 그룹스터디의 스레드 글을 등록합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    GroupStudyThreadRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let groupStudyThreadRequest: GroupStudyThreadRequest; //

const { status, data } = await apiInstance.createThread(
    groupStudyId,
    groupStudyThreadRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyThreadRequest** | **GroupStudyThreadRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**ThreadSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 스레드 글 등록 성공 |  -  |
|**403** | 스티더 리더나 멤버가 아닌 경우 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteComment**
> StringResponseSchema deleteComment()

특정 스레드 댓글을 삭제합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let commentId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteComment(
    groupStudyId,
    threadId,
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 댓글 삭제 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteThread**
> StringResponseSchema deleteThread()

특정 그룹스터디의 스레드 글을 삭제합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteThread(
    groupStudyId,
    threadId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 글 삭제 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getComments**
> ThreadCommentResponseSchema getComments()

특정 그룹스터디의 스레드 댓글을 조회합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getComments(
    groupStudyId,
    threadId,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**ThreadCommentResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 댓글 조회 성공 |  -  |
|**404** | 스레드 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getThreads**
> ThreadSummaryResponse getThreads()

특정 그룹스터디의 스레드 글을 조회합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getThreads(
    groupStudyId,
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**ThreadSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 글 조회 성공 |  -  |
|**404** | 스터디 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleCommentReaction**
> ReactionSummaryResponse toggleCommentReaction(reactionRequest)

스터디 멤버가 특정 스레드/댓글에 좋아요/싫어요 토글을 누릅니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    ReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let threadId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let reactionRequest: ReactionRequest; //

const { status, data } = await apiInstance.toggleCommentReaction(
    threadId,
    commentId,
    reactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reactionRequest** | **ReactionRequest**|  | |
| **threadId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|


### Return type

**ReactionSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 좋아요 눌린 상태에서 싫어요 눌렀을 때 |  -  |
|**403** | 스티더 리더나 멤버가 아닌 경우 |  -  |
|**404** | 올바르지 않은 스레드/댓글을 입력했을 경우 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleThreadReaction**
> ReactionSummaryResponse toggleThreadReaction(reactionRequest)

스터디 멤버가 특정 스레드/댓글에 좋아요/싫어요 토글을 누릅니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    ReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let reactionRequest: ReactionRequest; //

const { status, data } = await apiInstance.toggleThreadReaction(
    groupStudyId,
    threadId,
    reactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reactionRequest** | **ReactionRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|


### Return type

**ReactionSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 좋아요 눌린 상태에서 싫어요 눌렀을 때 |  -  |
|**403** | 스티더 리더나 멤버가 아닌 경우 |  -  |
|**404** | 올바르지 않은 스레드/댓글을 입력했을 경우 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateComment**
> ThreadCommentResponseSchema updateComment(groupStudyThreadCommentRequest)

특정 스레드 댓글을 수정합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    GroupStudyThreadCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let groupStudyThreadCommentRequest: GroupStudyThreadCommentRequest; //

const { status, data } = await apiInstance.updateComment(
    groupStudyId,
    threadId,
    commentId,
    groupStudyThreadCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyThreadCommentRequest** | **GroupStudyThreadCommentRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|


### Return type

**ThreadCommentResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 댓글 수정 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateThread**
> ThreadSummaryResponse updateThread(groupStudyThreadRequest)

특정 그룹스터디의 스레드 글을 수정합니다.

### Example

```typescript
import {
    GroupStudyThreadApi,
    Configuration,
    GroupStudyThreadRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyThreadApi(configuration);

let groupStudyId: number; // (default to undefined)
let threadId: number; // (default to undefined)
let groupStudyThreadRequest: GroupStudyThreadRequest; //

const { status, data } = await apiInstance.updateThread(
    groupStudyId,
    threadId,
    groupStudyThreadRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyThreadRequest** | **GroupStudyThreadRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **threadId** | [**number**] |  | defaults to undefined|


### Return type

**ThreadSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스레드 글 수정 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

