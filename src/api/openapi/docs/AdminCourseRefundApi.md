# AdminCourseRefundApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveCourseRefund**](#approvecourserefund) | **POST** /api/v5/admin/course-refunds/{refundId}/approve | 어드민 클래스 환불 승인|
|[**completeCourseRefund**](#completecourserefund) | **POST** /api/v5/admin/course-refunds/{refundId}/complete | 어드민 클래스 환불 완료|
|[**getAdminCourseRefunds**](#getadmincourserefunds) | **GET** /api/v5/admin/course-refunds | 어드민 클래스 환불 목록 조회|
|[**rejectCourseRefund**](#rejectcourserefund) | **POST** /api/v5/admin/course-refunds/{refundId}/reject | 어드민 클래스 환불 반려|
|[**retryCourseRefund**](#retrycourserefund) | **POST** /api/v5/admin/course-refunds/{refundId}/retry | 어드민 클래스 환불 재시도|

# **approveCourseRefund**
> CourseRefundDetailResponse approveCourseRefund(courseRefundApproveRequest)

코스 환불은 전액 환불만 지원하며 approvedAmount를 보낼 경우 원결제 금액과 같아야 합니다. adminReason은 운영 메모 용도로 함께 남길 수 있습니다.

### Example

```typescript
import {
    AdminCourseRefundApi,
    Configuration,
    CourseRefundApproveRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseRefundApi(configuration);

let refundId: number; // (default to undefined)
let courseRefundApproveRequest: CourseRefundApproveRequest; //환불 승인 요청 (approvedAmount는 optional이지만, 보내면 originalAmount와 같아야 함)

const { status, data } = await apiInstance.approveCourseRefund(
    refundId,
    courseRefundApproveRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseRefundApproveRequest** | **CourseRefundApproveRequest**| 환불 승인 요청 (approvedAmount는 optional이지만, 보내면 originalAmount와 같아야 함) | |
| **refundId** | [**number**] |  | defaults to undefined|


### Return type

**CourseRefundDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 승인 성공 |  -  |
|**400** | 상태 오류 또는 전액 환불 아님 |  -  |
|**404** | 환불 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeCourseRefund**
> CourseRefundDetailResponse completeCourseRefund()

승인된 코스 환불에 대해 Toss refund를 호출하고, 성공 시 결제 접근 권한을 회수합니다.

### Example

```typescript
import {
    AdminCourseRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseRefundApi(configuration);

let refundId: number; // (default to undefined)

const { status, data } = await apiInstance.completeCourseRefund(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] |  | defaults to undefined|


### Return type

**CourseRefundDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 환불 완료 |  -  |
|**400** | 상태 오류 |  -  |
|**404** | 환불 없음 |  -  |
|**502** | PG 환불 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminCourseRefunds**
> PageAdminCourseRefundListResponse getAdminCourseRefunds()

운영자가 클래스 환불 요청/완료 내역을 course/member/status/refundCode로 필터링합니다. page는 0-based index 입니다.

### Example

```typescript
import {
    AdminCourseRefundApi,
    Configuration,
    AdminCourseRefundSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseRefundApi(configuration);

let condition: AdminCourseRefundSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let courseId: number; //특정 코스 환불만 조회 (optional) (default to undefined)
let memberId: number; //특정 회원 환불만 조회 (optional) (default to undefined)
let status: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'FAILED'; //환불 상태 필터 (optional) (default to undefined)
let refundCode: string; //환불 코드 prefix/exact 검색 (optional) (default to undefined)
let page: number; //0-based page index (optional) (default to undefined)
let size: number; //page size (optional) (default to undefined)

const { status, data } = await apiInstance.getAdminCourseRefunds(
    condition,
    pageable,
    courseId,
    memberId,
    status,
    refundCode,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **condition** | **AdminCourseRefundSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **courseId** | [**number**] | 특정 코스 환불만 조회 | (optional) defaults to undefined|
| **memberId** | [**number**] | 특정 회원 환불만 조회 | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;APPROVED&#39; | &#39;COMPLETED&#39; | &#39;REJECTED&#39; | &#39;CANCELED&#39; | &#39;FAILED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;APPROVED&#39; &#124; &#39;COMPLETED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;CANCELED&#39; &#124; &#39;FAILED&#39;>** | 환불 상태 필터 | (optional) defaults to undefined|
| **refundCode** | [**string**] | 환불 코드 prefix/exact 검색 | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page index | (optional) defaults to undefined|
| **size** | [**number**] | page size | (optional) defaults to undefined|


### Return type

**PageAdminCourseRefundListResponse**

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

# **rejectCourseRefund**
> CourseRefundDetailResponse rejectCourseRefund(courseRefundRejectRequest)


### Example

```typescript
import {
    AdminCourseRefundApi,
    Configuration,
    CourseRefundRejectRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseRefundApi(configuration);

let refundId: number; // (default to undefined)
let courseRefundRejectRequest: CourseRefundRejectRequest; //

const { status, data } = await apiInstance.rejectCourseRefund(
    refundId,
    courseRefundRejectRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseRefundRejectRequest** | **CourseRefundRejectRequest**|  | |
| **refundId** | [**number**] |  | defaults to undefined|


### Return type

**CourseRefundDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 반려 성공 |  -  |
|**400** | 상태 오류 |  -  |
|**404** | 환불 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retryCourseRefund**
> CourseRefundDetailResponse retryCourseRefund()


### Example

```typescript
import {
    AdminCourseRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCourseRefundApi(configuration);

let refundId: number; // (default to undefined)

const { status, data } = await apiInstance.retryCourseRefund(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] |  | defaults to undefined|


### Return type

**CourseRefundDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 재시도 성공 |  -  |
|**400** | FAILED 상태가 아님 |  -  |
|**404** | 환불 없음 |  -  |
|**502** | PG 환불 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

