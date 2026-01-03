# PeerReviewApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPeerReview**](#createpeerreview) | **POST** /api/v1/homeworks/{homeworkId}/peer-reviews | 피어리뷰 작성|
|[**deletePeerReview**](#deletepeerreview) | **DELETE** /api/v1/peer-reviews/{peerReviewId} | 피어리뷰 삭제|
|[**getPeerReviews**](#getpeerreviews) | **GET** /api/v1/homeworks/{homeworkId}/peer-reviews | 과제별 피어리뷰 목록 조회|
|[**updatePeerReview**](#updatepeerreview) | **PUT** /api/v1/peer-reviews/{peerReviewId} | 피어리뷰 수정|

# **createPeerReview**
> PeerReviewCreationResponseSchema createPeerReview(peerReviewCreateRequest)

과제에 대한 피어리뷰(댓글)를 작성합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 그룹스터디 참가자만 작성 가능  **[Request]** - PathVariable: homeworkId (필수) - 과제 ID - RequestBody: PeerReviewCreateRequest (필수)   - comment (필수): 피어리뷰 내용 (최대 3000자)  **[Response]** - 201 Created: 피어리뷰 생성 성공 

### Example

```typescript
import {
    PeerReviewApi,
    Configuration,
    PeerReviewCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PeerReviewApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)
let peerReviewCreateRequest: PeerReviewCreateRequest; //피어리뷰 작성 요청 정보

const { status, data } = await apiInstance.createPeerReview(
    homeworkId,
    peerReviewCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **peerReviewCreateRequest** | **PeerReviewCreateRequest**| 피어리뷰 작성 요청 정보 | |
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**PeerReviewCreationResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 피어리뷰 작성 성공 |  -  |
|**400** | 잘못된 요청 (validation 실패) |  -  |
|**404** | 리소스를 찾을 수 없음 |  -  |
|**409** | Conflict |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletePeerReview**
> NoContentResponse deletePeerReview()

작성한 피어리뷰를 삭제합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 본인이 작성한 피어리뷰만 삭제 가능  **[Request]** - PathVariable: peerReviewId (필수) - 피어리뷰 ID  **[Response]** - 204 No Content: 삭제 성공 

### Example

```typescript
import {
    PeerReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PeerReviewApi(configuration);

let peerReviewId: number; //피어리뷰 ID (default to undefined)

const { status, data } = await apiInstance.deletePeerReview(
    peerReviewId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **peerReviewId** | [**number**] | 피어리뷰 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 피어리뷰 삭제 성공 |  -  |
|**403** | 권한 없음 (본인 피어리뷰가 아님) |  -  |
|**404** | 피어리뷰를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPeerReviews**
> PeerReviewListResponse getPeerReviews()

특정 과제에 달린 모든 피어리뷰를 조회합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 그룹스터디 참가자만 조회 가능  **[Request]** - PathVariable: homeworkId (필수) - 과제 ID  **[Response]** - 200 OK: 피어리뷰 목록 (작성일시 오름차순 정렬) 

### Example

```typescript
import {
    PeerReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PeerReviewApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)

const { status, data } = await apiInstance.getPeerReviews(
    homeworkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**PeerReviewListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 피어리뷰 목록 조회 성공 |  -  |
|**404** | 과제를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePeerReview**
> NoContentResponse updatePeerReview(peerReviewUpdateRequest)

작성한 피어리뷰를 수정합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 본인이 작성한 피어리뷰만 수정 가능  **[Request]** - PathVariable: peerReviewId (필수) - 피어리뷰 ID - RequestBody: PeerReviewUpdateRequest (필수)   - comment (필수): 수정할 피어리뷰 내용  **[Response]** - 204 No Content: 피어리뷰 수정 성공 

### Example

```typescript
import {
    PeerReviewApi,
    Configuration,
    PeerReviewUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PeerReviewApi(configuration);

let peerReviewId: number; //피어리뷰 ID (default to undefined)
let peerReviewUpdateRequest: PeerReviewUpdateRequest; //피어리뷰 수정 요청 정보

const { status, data } = await apiInstance.updatePeerReview(
    peerReviewId,
    peerReviewUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **peerReviewUpdateRequest** | **PeerReviewUpdateRequest**| 피어리뷰 수정 요청 정보 | |
| **peerReviewId** | [**number**] | 피어리뷰 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 피어리뷰 수정 성공 |  -  |
|**403** | 권한 없음 (본인 피어리뷰가 아님) |  -  |
|**404** | 피어리뷰를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

