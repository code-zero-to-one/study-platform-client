# AdminCoursePaymentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAdminCoursePaymentDetail**](#getadmincoursepaymentdetail) | **GET** /api/v5/admin/course-payments/{paymentId} | 어드민 클래스 결제 상세 조회|
|[**getAdminCoursePayments**](#getadmincoursepayments) | **GET** /api/v5/admin/course-payments | 어드민 클래스 결제 목록 조회|

# **getAdminCoursePaymentDetail**
> AdminCoursePaymentDetailResponse getAdminCoursePaymentDetail()

                FRD K-07.  ## Narrative - 운영자가 클래스 결제 민원/정산/입금대기 확인 시 단건 row를 풀필드로 검증하는 상세 API입니다. - member/course/plan snapshot, PG 주문번호, 영수증 URL, 가상계좌 메타와 timeline을 포함합니다. 

### Example

```typescript
import {
    AdminCoursePaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCoursePaymentApi(configuration);

let paymentId: number; //조회할 결제 ID (default to undefined)

const { status, data } = await apiInstance.getAdminCoursePaymentDetail(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] | 조회할 결제 ID | defaults to undefined|


### Return type

**AdminCoursePaymentDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 결제 ID를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAdminCoursePayments**
> PageAdminCoursePaymentListResponseSchema getAdminCoursePayments()

                FRD K-06.  ## Narrative - 운영자가 클래스 결제 row를 상태/회원/코스 기준으로 추적하는 결제관리 목록 API입니다. - 기존 study payment 거래내역과 별도로 `course_payment` 전용 read model 을 제공합니다.  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 생성일시 역순 정렬입니다. | | 응답 | 회원 식별용 memberId/memberLoginId/memberName과 코스/플랜 요약을 함께 제공합니다. | 

### Example

```typescript
import {
    AdminCoursePaymentApi,
    Configuration,
    AdminCoursePaymentSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminCoursePaymentApi(configuration);

let condition: AdminCoursePaymentSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let courseId: number; //코스 ID 필터 (optional) (default to undefined)
let memberId: number; //회원 ID 필터 (optional) (default to undefined)
let status: 'REQUESTED' | 'PENDING' | 'WAITING_FOR_DEPOSIT' | 'SUCCESS' | 'FAILED' | 'CANCELED'; //결제 상태 필터 (optional) (default to undefined)
let paymentCode: string; //결제코드 부분 검색 (optional) (default to undefined)
let page: number; //0-based page (optional) (default to 0)
let size: number; //page size (optional) (default to 20)

const { status, data } = await apiInstance.getAdminCoursePayments(
    condition,
    pageable,
    courseId,
    memberId,
    status,
    paymentCode,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **condition** | **AdminCoursePaymentSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **courseId** | [**number**] | 코스 ID 필터 | (optional) defaults to undefined|
| **memberId** | [**number**] | 회원 ID 필터 | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;PENDING&#39; | &#39;WAITING_FOR_DEPOSIT&#39; | &#39;SUCCESS&#39; | &#39;FAILED&#39; | &#39;CANCELED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;PENDING&#39; &#124; &#39;WAITING_FOR_DEPOSIT&#39; &#124; &#39;SUCCESS&#39; &#124; &#39;FAILED&#39; &#124; &#39;CANCELED&#39;>** | 결제 상태 필터 | (optional) defaults to undefined|
| **paymentCode** | [**string**] | 결제코드 부분 검색 | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page | (optional) defaults to 0|
| **size** | [**number**] | page size | (optional) defaults to 20|


### Return type

**PageAdminCoursePaymentListResponseSchema**

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

