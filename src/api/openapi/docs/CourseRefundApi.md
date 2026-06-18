# CourseRefundApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelCourseRefundRequest**](#cancelcourserefundrequest) | **POST** /api/v5/course-refunds/{refundId}/cancel | 클래스 환불 요청 취소|
|[**getMyCourseRefunds**](#getmycourserefunds) | **GET** /api/v5/mypage/course-refunds | 내 클래스 환불 목록 조회|
|[**requestCourseRefund**](#requestcourserefund) | **POST** /api/v5/course-payments/{paymentId}/refunds | 클래스 환불 요청|

# **cancelCourseRefundRequest**
> BaseResponseVoid cancelCourseRefundRequest()

REQUESTED 상태의 클래스 환불 요청을 본인이 취소합니다.

### Example

```typescript
import {
    CourseRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseRefundApi(configuration);

let refundId: number; // (default to undefined)

const { status, data } = await apiInstance.cancelCourseRefundRequest(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] |  | defaults to undefined|


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
|**200** | 취소 성공 |  -  |
|**400** | 요청 상태가 아님 |  -  |
|**403** | 본인 환불이 아님 |  -  |
|**404** | 환불 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyCourseRefunds**
> PageMyCourseRefundListResponse getMyCourseRefunds()

FRD B-15.  마이페이지에서 내 클래스 환불 요청/완료 내역을 조회합니다. page는 0-based index 입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스환불완료.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%98%EB%B6%88%EC%99%84%EB%A3%8C.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%98%EB%B6%88%EC%99%84%EB%A3%8C.png\" alt=\"S-클래스환불완료\" width=\"720\" /> 

### Example

```typescript
import {
    CourseRefundApi,
    Configuration,
    MyCourseRefundSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseRefundApi(configuration);

let condition: MyCourseRefundSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let courseId: number; //특정 코스 환불만 조회 (optional) (default to undefined)
let status: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'FAILED'; //환불 상태 필터 (optional) (default to undefined)
let page: number; //0-based page index (optional) (default to undefined)
let size: number; //page size (optional) (default to undefined)

const { status, data } = await apiInstance.getMyCourseRefunds(
    condition,
    pageable,
    courseId,
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **condition** | **MyCourseRefundSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **courseId** | [**number**] | 특정 코스 환불만 조회 | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;APPROVED&#39; | &#39;COMPLETED&#39; | &#39;REJECTED&#39; | &#39;CANCELED&#39; | &#39;FAILED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;APPROVED&#39; &#124; &#39;COMPLETED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;CANCELED&#39; &#124; &#39;FAILED&#39;>** | 환불 상태 필터 | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page index | (optional) defaults to undefined|
| **size** | [**number**] | page size | (optional) defaults to undefined|


### Return type

**PageMyCourseRefundListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestCourseRefund**
> CourseRefundDetailResponse requestCourseRefund(courseRefundCreateRequest)

FRD B-16.  `S-클래스환불요청`에서 SUCCESS 상태의 클래스 결제에 대해 전액 환불 요청을 생성합니다. `refundReasonCode`는 화면 select 값이고, `refundReasonCode=OTHER`를 선택하면 `refundReasonDetail`이 필수입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스환불요청.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%98%EB%B6%88%EC%9A%94%EC%B2%AD.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%99%98%EB%B6%88%EC%9A%94%EC%B2%AD.png\" alt=\"S-클래스환불요청\" width=\"720\" /> 

### Example

```typescript
import {
    CourseRefundApi,
    Configuration,
    CourseRefundCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseRefundApi(configuration);

let paymentId: number; // (default to undefined)
let courseRefundCreateRequest: CourseRefundCreateRequest; //

const { status, data } = await apiInstance.requestCourseRefund(
    paymentId,
    courseRefundCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseRefundCreateRequest** | **CourseRefundCreateRequest**|  | |
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**CourseRefundDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 환불 요청 성공 |  -  |
|**400** | 완료 결제가 아니거나 refundReasonCode/refundReasonDetail 검증 실패 |  -  |
|**403** | 본인 결제가 아님 |  -  |
|**404** | 결제 없음 |  -  |
|**409** | 이미 환불 진행/완료 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

