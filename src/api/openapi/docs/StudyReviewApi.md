# StudyReviewApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyReviews**](#getmyreviews) | **GET** /api/v1/study/reviews/members | 자신의 스터디 후기 목록 조회|
|[**getNegativeEvalKeywords**](#getnegativeevalkeywords) | **GET** /api/v1/study/reviews/members/keywords/negative | 자신의 스터디 후기 부정 평가키워드 목록 조회|
|[**getPositiveEvalKeywords**](#getpositiveevalkeywords) | **GET** /api/v1/study/reviews/members/keywords/positive | 자신 또는 다른 사용자의 스터디 후기 긍정 평가 키워드 목록 조회|
|[**getReviewTargetStudy**](#getreviewtargetstudy) | **GET** /api/v1/study/reviews/this-week/target-study | 자신이 이번 주에 진행한 스터디 및 전체 평가 키워드 목록 조회|
|[**isWriter**](#iswriter) | **GET** /api/v1/study/reviews/this-week/is-writer | 자신이 이번 주 스터디 후기 작성 대상자인지 여부 조회|
|[**registerReview**](#registerreview) | **POST** /api/v1/study/reviews | 스터디 후기 등록|

# **getMyReviews**
> BaseResponse getMyReviews()

자신의 스터디 후기 목록을 조회합니다.  - 페이로드에 cursor 값이 없는 경우(첫 페이지): 사용자가 받은 총 후기 개수 반환 O  - 페이로드에 cursor 값이 있는 경우(더 보기): 사용자가 받은 총 후기 개수 반환 X

### Example

```typescript
import {
    StudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

let cursor: number; //조회를 시작할 스터디 후기 ID, 전송하지 않는 경우 첫 데이터부터 조회 (optional) (default to undefined)
let pageSize: number; //조회할 데이터 개수 (optional) (default to 10)

const { status, data } = await apiInstance.getMyReviews(
    cursor,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cursor** | [**number**] | 조회를 시작할 스터디 후기 ID, 전송하지 않는 경우 첫 데이터부터 조회 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 조회할 데이터 개수 | (optional) defaults to 10|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getNegativeEvalKeywords**
> BaseResponse getNegativeEvalKeywords()

자신의 스터디 후기 부정 평가(아쉬웠어요) 키워드 목록을 조회합니다.  - 페이로드에 pageSize 값이 있는 경우(첫 페이지): 사용자가 받은 총 후기 개수(totalCount) 및 총 평가 사용자 수(reviewerCount) 반환 O  - 페이로드에 pageSize 값이 없는 경우(더 보기): 사용자가 받은 총 후기 개수(totalCount) 및 총 평가 사용자 수(reviewerCount) 반환 X

### Example

```typescript
import {
    StudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

let pageSize: number; //조회할 데이터 개수, 전송하지 않는 경우 전체 (optional) (default to undefined)

const { status, data } = await apiInstance.getNegativeEvalKeywords(
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageSize** | [**number**] | 조회할 데이터 개수, 전송하지 않는 경우 전체 | (optional) defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPositiveEvalKeywords**
> BaseResponse getPositiveEvalKeywords()

자신 또는 다른 사용자의 스터디 후기 긍정 평가(좋았어요 + 괜찮았어요) 키워드 목록을 조회합니다.  - 페이로드에 pageSize 값이 있는 경우(첫 페이지): 사용자가 받은 총 후기 개수(totalCount) 및 총 평가 사용자 수(reviewerCount) 반환 O  - 페이로드에 pageSize 값이 없는 경우(더 보기): 사용자가 받은 총 후기 개수(totalCount) 및 총 평가 사용자 수(reviewerCount) 반환 X

### Example

```typescript
import {
    StudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

let memberId: number; //조회 대상 회원 ID, 전송하지 않는 경우 자신 (optional) (default to undefined)
let pageSize: number; //조회할 데이터 개수, 전송하지 않는 경우 전체 (optional) (default to undefined)

const { status, data } = await apiInstance.getPositiveEvalKeywords(
    memberId,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 조회 대상 회원 ID, 전송하지 않는 경우 자신 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 조회할 데이터 개수, 전송하지 않는 경우 전체 | (optional) defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReviewTargetStudy**
> BaseResponse getReviewTargetStudy()

자신이 이번 주에 진행한 스터디 및 전체 평가 키워드 목록을 조회합니다.

### Example

```typescript
import {
    StudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

const { status, data } = await apiInstance.getReviewTargetStudy();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 대상 스터디 조회 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **isWriter**
> BaseResponse isWriter()

자신이 이번 주 스터디 후기 작성 대상자인지 여부를 조회합니다.

### Example

```typescript
import {
    StudyReviewApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

const { status, data } = await apiInstance.isWriter();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerReview**
> BaseResponse registerReview(registerReviewRequest)

스터디 후기를 등록합니다.  후기 글 내용이 없는 경우 content 파라미터를 전송하지 않습니다.  content 파라미터를 전송하는 경우에는 0 < content.length <= 1000 으로 전송해야 합니다.

### Example

```typescript
import {
    StudyReviewApi,
    Configuration,
    RegisterReviewRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyReviewApi(configuration);

let registerReviewRequest: RegisterReviewRequest; //

const { status, data } = await apiInstance.registerReview(
    registerReviewRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerReviewRequest** | **RegisterReviewRequest**|  | |


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 후기 등록 성공 |  -  |
|**400** | 이미 작성한 후기 |  -  |
|**404** | 스터디 또는 멤버 조회 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

