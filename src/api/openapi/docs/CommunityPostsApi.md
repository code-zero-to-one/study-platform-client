# CommunityPostsApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignCommunityPostReaction**](#assigncommunitypostreaction) | **POST** /api/v1/community/posts/{postId}/reactions | 커뮤니티 게시글 반응 지정|
|[**createCommunityContentImageUploadTicket**](#createcommunitycontentimageuploadticket) | **POST** /api/v1/community/posts/content-images/upload-ticket | 커뮤니티 본문 이미지 업로드 티켓 발급|
|[**createCommunityPost**](#createcommunitypost) | **POST** /api/v1/community/posts | 커뮤니티 게시글 생성|
|[**deleteCommunityPost**](#deletecommunitypost) | **DELETE** /api/v1/community/posts/{postId} | 커뮤니티 게시글 삭제|
|[**getCommunityPostDetail**](#getcommunitypostdetail) | **GET** /api/v1/community/posts/{postId} | 커뮤니티 게시글 상세 조회|
|[**getCommunityPosts**](#getcommunityposts) | **GET** /api/v1/community/posts | 커뮤니티 게시글 목록 조회|
|[**getRelatedCommunityPosts**](#getrelatedcommunityposts) | **GET** /api/v1/community/posts/{postId}/related-posts | 커뮤니티 관련 글 조회|
|[**recordCommunityPostView**](#recordcommunitypostview) | **POST** /api/v1/community/posts/{postId}/views | 커뮤니티 게시글 조회수 이벤트 기록|
|[**updateCommunityPost**](#updatecommunitypost) | **PUT** /api/v1/community/posts/{postId} | 커뮤니티 게시글 수정|

# **assignCommunityPostReaction**
> CommunityPostReactionResponse assignCommunityPostReaction(assignCommunityPostReactionRequest)

로그인 사용자가 커뮤니티 게시글에 like 또는 none 반응을 지정합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration,
    AssignCommunityPostReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)
let assignCommunityPostReactionRequest: AssignCommunityPostReactionRequest; //

const { status, data } = await apiInstance.assignCommunityPostReaction(
    postId,
    assignCommunityPostReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignCommunityPostReactionRequest** | **AssignCommunityPostReactionRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|


### Return type

**CommunityPostReactionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 반응 지정 성공 |  -  |
|**400** | 잘못된 요청 본문 또는 postId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityContentImageUploadTicket**
> CommunityContentImageUploadTicketResponse createCommunityContentImageUploadTicket(communityContentImageUploadTicketRequest)

로그인 사용자가 커뮤니티 게시글 본문 이미지 업로드용 티켓을 발급받습니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration,
    CommunityContentImageUploadTicketRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let communityContentImageUploadTicketRequest: CommunityContentImageUploadTicketRequest; //

const { status, data } = await apiInstance.createCommunityContentImageUploadTicket(
    communityContentImageUploadTicketRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **communityContentImageUploadTicketRequest** | **CommunityContentImageUploadTicketRequest**|  | |


### Return type

**CommunityContentImageUploadTicketResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 티켓 발급 성공 |  -  |
|**400** | 잘못된 파일 확장자 또는 요청 본문 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCommunityPost**
> CommunityPostDetailResponse createCommunityPost(createCommunityPostRequest)

Idempotency-Key를 사용해 공개 커뮤니티 게시글을 생성합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration,
    CreateCommunityPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let idempotencyKey: string; // (default to undefined)
let createCommunityPostRequest: CreateCommunityPostRequest; //

const { status, data } = await apiInstance.createCommunityPost(
    idempotencyKey,
    createCommunityPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommunityPostRequest** | **CreateCommunityPostRequest**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**CommunityPostDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |
|**400** | 잘못된 요청 본문, 헤더 또는 게시판 코드 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 본문 이미지 ownership을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCommunityPost**
> DeleteCommunityPostResponse deleteCommunityPost()

If-Match revision을 검증하고 커뮤니티 게시글을 soft delete 처리합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)

const { status, data } = await apiInstance.deleteCommunityPost(
    postId,
    ifMatch
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**DeleteCommunityPostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**400** | 잘못된 헤더 또는 postId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityPostDetail**
> CommunityPostDetailResponse getCommunityPostDetail()

공개 상태의 커뮤니티 게시글 상세를 조회합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)

const { status, data } = await apiInstance.getCommunityPostDetail(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|


### Return type

**CommunityPostDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 postId |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCommunityPosts**
> CommunityPostFeedResponse getCommunityPosts()

board/page/size 조건으로 공개 커뮤니티 목록을 조회합니다. board=all 인 경우 일반 게시글과 질문답변(QnA) 질문 summary를 함께 반환합니다. 

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let board: string; // (optional) (default to 'all')
let page: number; // (optional) (default to 1)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getCommunityPosts(
    board,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **board** | [**string**] |  | (optional) defaults to 'all'|
| **page** | [**number**] |  | (optional) defaults to 1|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**CommunityPostFeedResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 게시판 필터 또는 페이지 파라미터 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRelatedCommunityPosts**
> CommunityPostSummaryListResponse getRelatedCommunityPosts()

기준 게시글과 연관된 공개 게시글 목록을 조회합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)
let size: number; // (optional) (default to 4)

const { status, data } = await apiInstance.getRelatedCommunityPosts(
    postId,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|
| **size** | [**number**] |  | (optional) defaults to 4|


### Return type

**CommunityPostSummaryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 postId 또는 size |  -  |
|**404** | 기준 게시글을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recordCommunityPostView**
> CommunityPostViewEventResponse recordCommunityPostView()

로그인 사용자 또는 익명 viewer key 기준으로 게시글 조회수를 기록합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)
let communityViewerKey: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.recordCommunityPostView(
    postId,
    communityViewerKey
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**number**] |  | defaults to undefined|
| **communityViewerKey** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CommunityPostViewEventResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 기록 성공 |  -  |
|**400** | 잘못된 postId |  -  |
|**404** | 게시글을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCommunityPost**
> CommunityPostDetailResponse updateCommunityPost(updateCommunityPostRequest)

If-Match revision을 검증하고 커뮤니티 게시글을 수정합니다.

### Example

```typescript
import {
    CommunityPostsApi,
    Configuration,
    UpdateCommunityPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityPostsApi(configuration);

let postId: number; // (default to undefined)
let ifMatch: string; // (default to undefined)
let updateCommunityPostRequest: UpdateCommunityPostRequest; //

const { status, data } = await apiInstance.updateCommunityPost(
    postId,
    ifMatch,
    updateCommunityPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCommunityPostRequest** | **UpdateCommunityPostRequest**|  | |
| **postId** | [**number**] |  | defaults to undefined|
| **ifMatch** | [**string**] |  | defaults to undefined|


### Return type

**CommunityPostDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | 잘못된 요청 본문, 헤더 또는 postId |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 게시글 또는 본문 이미지 ownership을 찾을 수 없음 |  -  |
|**409** | revision 충돌 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

