# CommunityCommentsApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignCommunityCommentReaction**](#assigncommunitycommentreaction) | **POST** /api/v1/community/posts/{postId}/comments/{commentId}/reactions | 커뮤니티 댓글 반응 지정|
|[**createCommunityReplyComment**](#createcommunityreplycomment) | **POST** /api/v1/community/posts/{postId}/comments/{commentId}/replies | 커뮤니티 답글 생성|
|[**createCommunityRootComment**](#createcommunityrootcomment) | **POST** /api/v1/community/posts/{postId}/comments | 커뮤니티 루트 댓글 생성|
|[**deleteCommunityComment**](#deletecommunitycomment) | **DELETE** /api/v1/community/posts/{postId}/comments/{commentId} | 커뮤니티 댓글 삭제|
|[**getCommunityComments**](#getcommunitycomments) | **GET** /api/v1/community/posts/{postId}/comments | 커뮤니티 댓글 목록 조회|
|[**updateCommunityComment**](#updatecommunitycomment) | **PUT** /api/v1/community/posts/{postId}/comments/{commentId} | 커뮤니티 댓글 수정|

# **assignCommunityCommentReaction**
> CommunityCommentReactionResponse assignCommunityCommentReaction(assignCommunityCommentReactionRequest)

로그인 사용자가 댓글에 like, dislike, none 반응을 지정합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration,
    AssignCommunityCommentReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let assignCommunityCommentReactionRequest: AssignCommunityCommentReactionRequest; //

const { status, data } = await apiInstance.assignCommunityCommentReaction(
    postId,
    commentId,
    assignCommunityCommentReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignCommunityCommentReactionRequest** | **AssignCommunityCommentReactionRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|


### Return type

**CommunityCommentReactionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 반응 지정 성공 |  -  |
|**400** | 잘못된 요청 본문, postId 또는 commentId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글 또는 댓글을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityReplyComment**
> CommunityCommentMutationResponse createCommunityReplyComment(createCommunityCommentRequest)

Idempotency-Key를 사용해 depth 1 답글을 생성합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration,
    CreateCommunityCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let createCommunityCommentRequest: CreateCommunityCommentRequest; //

const { status, data } = await apiInstance.createCommunityReplyComment(
    postId,
    commentId,
    idempotencyKey,
    createCommunityCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityCommentRequest** | **CreateCommunityCommentRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityCommentMutationResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**400** | 잘못된 요청 본문, 헤더, postId 또는 commentId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글 또는 부모 댓글을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityRootComment**
> CommunityCommentMutationResponse createCommunityRootComment(createCommunityCommentRequest)

Idempotency-Key를 사용해 루트 댓글을 생성합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration,
    CreateCommunityCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let idempotencyKey: string; // (default to undefined)
let createCommunityCommentRequest: CreateCommunityCommentRequest; //

const { status, data } = await apiInstance.createCommunityRootComment(
    postId,
    idempotencyKey,
    createCommunityCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityCommentRequest** | **CreateCommunityCommentRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityCommentMutationResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**400** | 잘못된 요청 본문, 헤더 또는 postId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCommunityComment**
> CommunityCommentDeleteResponse deleteCommunityComment()

If-Match revision을 검증하고 댓글을 tombstone 처리합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCommunityComment(
    postId,
    commentId,
    ifMatch
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityCommentDeleteResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**400** | 잘못된 헤더, postId 또는 commentId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글 또는 댓글을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityComments**
> CommunityCommentPageResponse getCommunityComments()

루트 댓글 페이지와 각 루트의 replies를 함께 조회합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getCommunityComments(
    postId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**CommunityCommentPageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 postId/page/size |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCommunityComment**
> CommunityCommentUpdateResponse updateCommunityComment(updateCommunityCommentRequest)

If-Match revision을 검증하고 댓글을 수정합니다.

### Example

```typescript
import {
    CommunityCommentsApi,
    Configuration,
    UpdateCommunityCommentRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityCommentsApi(configuration);

let postId: number; // (default to undefined)
let commentId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)
let updateCommunityCommentRequest: UpdateCommunityCommentRequest; //

const { status, data } = await apiInstance.updateCommunityComment(
    postId,
    commentId,
    ifMatch,
    updateCommunityCommentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCommunityCommentRequest** | **UpdateCommunityCommentRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|
| **commentId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityCommentUpdateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | 잘못된 요청 본문, 헤더, postId 또는 commentId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글 또는 댓글을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

