# GroupStudyReviewApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createStudyReview**](#createstudyreview) | **POST** /api/v1/group-studies/{groupStudyId}/reviews | 스터디 경험 후기 작성|
|[**deleteStudyReview**](#deletestudyreview) | **DELETE** /api/v1/group-studies/reviews/{reviewId} | 스터디 경험 후기 삭제|
|[**getGroupStudyReviewSummary**](#getgroupstudyreviewsummary) | **GET** /api/v1/group-studies/{groupStudyId}/review-summary | 그룹스터디 후기 집계 조회|
|[**getReview**](#getreview) | **GET** /api/v1/group-studies/reviews/{reviewId} | 스터디 경험 후기 상세 조회|
|[**getSelectableReviewItems**](#getselectablereviewitems) | **GET** /api/v1/group-studies/reviews/selectable-items | 선택형 평가 항목 전체 조회|
|[**hasWrittenReview**](#haswrittenreview) | **GET** /api/v1/group-studies/{groupStudyId}/reviews/written | 경험 후기 작성 여부 확인|
|[**isReviewAvailable**](#isreviewavailable) | **GET** /api/v1/group-studies/{groupStudyId}/reviews/availability | 스터디 후기 작성 가능 여부 확인|
|[**listStudyReviews**](#liststudyreviews) | **GET** /api/v1/group-studies/{groupStudyId}/reviews | 스터디 경험 후기 목록 조회|
|[**updateStudyReview**](#updatestudyreview) | **PUT** /api/v1/group-studies/reviews/{reviewId} | 스터디 경험 후기 수정|

# **createStudyReview**
> BaseResponseLong createStudyReview(groupStudyExperienceReviewCreationRequestDto)

종료된 그룹스터디에 대한 경험 후기를 작성합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration,
    GroupStudyExperienceReviewCreationRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let groupStudyId: number; // (default to undefined)
let groupStudyExperienceReviewCreationRequestDto: GroupStudyExperienceReviewCreationRequestDto; //

const { status, data } = await apiInstance.createStudyReview(
    groupStudyId,
    groupStudyExperienceReviewCreationRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyExperienceReviewCreationRequestDto** | **GroupStudyExperienceReviewCreationRequestDto**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseLong**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 후기 작성 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteStudyReview**
> BaseResponseVoid deleteStudyReview()

작성한 경험 후기를 삭제합니다. 스터디 종료 후 7일 이내에만 가능합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let reviewId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteStudyReview(
    reviewId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 후기 삭제 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getGroupStudyReviewSummary**
> GroupStudyReviewDetailResponse getGroupStudyReviewSummary()

그룹스터디의 후기 수, 만족도, 평점, 선택 평가 항목 집계를 조회합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.getGroupStudyReviewSummary(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**GroupStudyReviewDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReview**
> BaseResponseGroupStudyExperienceReviewDetailResponseDto getReview()

경험 후기의 상세 정보를 조회합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let reviewId: number; // (default to undefined)

const { status, data } = await apiInstance.getReview(
    reviewId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reviewId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseGroupStudyExperienceReviewDetailResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSelectableReviewItems**
> BaseResponseSelectableReviewItemListResponseDto getSelectableReviewItems()

만족도별 선택형 평가 항목 목록을 조회합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

const { status, data } = await apiInstance.getSelectableReviewItems();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponseSelectableReviewItemListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hasWrittenReview**
> BaseResponseBoolean hasWrittenReview()

현재 사용자가 해당 그룹스터디에 대한 경험 후기를 작성했는지 확인합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let groupStudyId: number; // (default to undefined)

const { status, data } = await apiInstance.hasWrittenReview(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseBoolean**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **isReviewAvailable**
> PageResponse isReviewAvailable()

특정 그룹스터디의 스터디 후기 작성 가능 여부를 확인합니다. AVAILABLE - 스터디 후기 작성 가능, PERIOD_EXPIRED - 작성 기간 만료, STUDY_NOT_COMPLETED - 그룹스터디 종료되지 않음, ALREADY_REVIEWED - 이미 후기 작성됨

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.isReviewAvailable(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**PageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 확인 성공 |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listStudyReviews**
> BaseResponsePageResponseGroupStudyExperienceReviewListItemResponseDto listStudyReviews()

그룹스터디의 경험 후기 목록을 페이지네이션으로 조회합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let groupStudyId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listStudyReviews(
    groupStudyId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 20|


### Return type

**BaseResponsePageResponseGroupStudyExperienceReviewListItemResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateStudyReview**
> BaseResponseVoid updateStudyReview(groupStudyExperienceReviewUpdateRequestDto)

작성한 경험 후기를 수정합니다. 스터디 종료 후 7일 이내에만 가능합니다.

### Example

```typescript
import {
    GroupStudyReviewApi,
    Configuration,
    GroupStudyExperienceReviewUpdateRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyReviewApi(configuration);

let reviewId: number; // (default to undefined)
let groupStudyExperienceReviewUpdateRequestDto: GroupStudyExperienceReviewUpdateRequestDto; //

const { status, data } = await apiInstance.updateStudyReview(
    reviewId,
    groupStudyExperienceReviewUpdateRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyExperienceReviewUpdateRequestDto** | **GroupStudyExperienceReviewUpdateRequestDto**|  | |
| **reviewId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 후기 수정 완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

