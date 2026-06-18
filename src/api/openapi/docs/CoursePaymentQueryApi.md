# CoursePaymentQueryApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyCoursePaymentDetail**](#getmycoursepaymentdetail) | **GET** /api/v5/mypage/course-payments/{paymentId} | 내 클래스 결제 상세 조회|
|[**getMyCoursePayments**](#getmycoursepayments) | **GET** /api/v5/mypage/course-payments | 내 클래스 결제 목록 조회|

# **getMyCoursePaymentDetail**
> MyCoursePaymentDetailResponse getMyCoursePaymentDetail()

                FRD K-05.  ## Narrative - 마이페이지 결제 상세 drawer/modal에서 현재 결제 row를 투명하게 보여주는 canonical read model 입니다. - 코스/플랜 snapshot, PG 주문번호, 영수증 URL, 가상계좌 정보, 생성/완료/취소 시각과 timeline을 한 번에 제공합니다.   - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스결제입금계좌확인.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EA%B2%B0%EC%A0%9C%EC%9E%85%EA%B8%88%EA%B3%84%EC%A2%8C%ED%99%95%EC%9D%B8.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EA%B2%B0%EC%A0%9C%EC%9E%85%EA%B8%88%EA%B3%84%EC%A2%8C%ED%99%95%EC%9D%B8.png\" alt=\"S-클래스결제입금계좌확인\" width=\"720\" />  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인 결제만 상세 조회할 수 있습니다. | | 권한 | 다른 회원 paymentId면 403 PAYMENT_FORBIDDEN 입니다. | 

### Example

```typescript
import {
    CoursePaymentQueryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoursePaymentQueryApi(configuration);

let paymentId: number; //조회할 결제 ID (default to undefined)

const { status, data } = await apiInstance.getMyCoursePaymentDetail(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] | 조회할 결제 ID | defaults to undefined|


### Return type

**MyCoursePaymentDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 비로그인 |  -  |
|**403** | 본인 결제가 아님 |  -  |
|**404** | 결제 ID를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyCoursePayments**
> PageMyCoursePaymentListResponseSchema getMyCoursePayments()

                FRD K-04.  ## Narrative - 마이페이지 결제관리 화면에서 회원이 자신이 결제한 클래스 row들을 투명하게 다시 확인할 때 사용하는 목록 API입니다. - 결제 직후 confirm 응답을 잃어버려도, 이 API로 현재 상태와 금액/플랜/영수증/가상계좌 정보를 다시 조회할 수 있어야 합니다. - `status` 필터로 입금대기 건만 따로 보는 UX를 만들 수 있습니다.   - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스-결제관리.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EA%B2%B0%EC%A0%9C%EA%B4%80%EB%A6%AC.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EA%B2%B0%EC%A0%9C%EA%B4%80%EB%A6%AC.png\" alt=\"S-마이클래스-결제관리\" width=\"720\" />  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인만 자신의 결제 row를 볼 수 있습니다. | | 권한 | 비로그인은 401 UNAUTHORIZED 입니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 생성일시 역순으로 반환합니다. | | 응답 | 항목에는 course/plan/current status/receipt/가상계좌 요약이 포함됩니다. | | 응답 | `canCancelPayment=true`는 K-03 취소 CTA를 다시 노출해도 되는 상태(REQUESTED/PENDING/WAITING_FOR_DEPOSIT)입니다. | 

### Example

```typescript
import {
    CoursePaymentQueryApi,
    Configuration,
    MyCoursePaymentSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new CoursePaymentQueryApi(configuration);

let condition: MyCoursePaymentSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let courseId: number; //특정 코스 ID로 필터 (optional) (default to undefined)
let status: 'REQUESTED' | 'PENDING' | 'WAITING_FOR_DEPOSIT' | 'SUCCESS' | 'FAILED' | 'CANCELED'; //결제 상태 필터 (optional) (default to undefined)
let page: number; //0-based page (optional) (default to 0)
let size: number; //page size (optional) (default to 20)

const { status, data } = await apiInstance.getMyCoursePayments(
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
| **condition** | **MyCoursePaymentSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **courseId** | [**number**] | 특정 코스 ID로 필터 | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;PENDING&#39; | &#39;WAITING_FOR_DEPOSIT&#39; | &#39;SUCCESS&#39; | &#39;FAILED&#39; | &#39;CANCELED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;PENDING&#39; &#124; &#39;WAITING_FOR_DEPOSIT&#39; &#124; &#39;SUCCESS&#39; &#124; &#39;FAILED&#39; &#124; &#39;CANCELED&#39;>** | 결제 상태 필터 | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page | (optional) defaults to 0|
| **size** | [**number**] | page size | (optional) defaults to 20|


### Return type

**PageMyCoursePaymentListResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 비로그인 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

