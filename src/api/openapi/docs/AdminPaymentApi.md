# AdminPaymentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**forceCancelPayment**](#forcecancelpayment) | **POST** /api/v1/admin/payments/{paymentId}/cancel | 관리자 결제 강제 취소|
|[**getTransactionsForAdmin**](#gettransactionsforadmin) | **GET** /api/v1/admin/payments/transactions | 관리자 매출 관리 리스트 조회 (결제/환불 통합)|

# **forceCancelPayment**
> forceCancelPayment()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 관리자 권한으로 결제 완료된 건을 강제 취소합니다. - 내부적으로 **환불 도메인 및 PG(Toss) 환불 API**와 연동되어 실제 결제 취소 및 환불이 진행됩니다. - 이미 환불이 진행 중이거나 완료된 결제 건에 대해 호출 시 예외가 발생합니다.  ---  ## Request  | **키**      | **타입** | **위치** | **설명**                                | **필수 여부** | **예시**                      | |------------|---------|---------|----------------------------------------|--------------|-------------------------------| | paymentId  | number  | path    | 강제 취소할 결제 ID                    | Y            | 1                             | | reason     | string  | query   | 관리자 강제 취소 사유 (로그/분쟁 대응용) | N            | \"회원 제재로 인한 강제 취소\"  |  ---  ## Response  | **키**      | **타입** | **설명**                                                                                   | |------------|---------|-------------------------------------------------------------------------------------------| | statusCode | number  | 상태 코드 (200: 성공 / 400: 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 409: 충돌 등)   | | timestamp  | string(datetime) | 응답 일시                                                                             | | content    | null    | 본문 없음 (강제 취소 성공 여부만 반환)                                                   | | message    | string  | 처리 결과 메시지                                                                          | 

### Example

```typescript
import {
    AdminPaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentApi(configuration);

let paymentId: number; //강제 취소할 결제 ID (default to undefined)
let reason: string; //관리자 강제 취소 사유 (선택값) (optional) (default to undefined)

const { status, data } = await apiInstance.forceCancelPayment(
    paymentId,
    reason
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] | 강제 취소할 결제 ID | defaults to undefined|
| **reason** | [**string**] | 관리자 강제 취소 사유 (선택값) | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 결제 강제 취소 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTransactionsForAdmin**
> getTransactionsForAdmin()

작성일자: 2025-12-22  작성자: 이도현  ---  ## Description  - 전체 유저의 결제/환불 거래 내역을 거래(payment)별 최신 히스토리 기준으로 조회합니다. - PaymentHistory 테이블 기반으로 결제와 환불을 통합하여 조회합니다. - 각 거래별로 가장 최근 상태(결제 완료, 환불 완료 등)를 기준으로 리스트를 반환합니다. - 날짜, 스터디명, 거래ID(paymentCode)로 필터링할 수 있습니다.  ---  ## Query Parameters (Filter - PaymentSearchCondition)  | 키          | 타입       | 설명                              | 필수 | 예시           | |-------------|------------|-----------------------------------|------|----------------| | startDate   | LocalDate  | 조회 시작일 (yyyy-MM-dd)          | N    | 2025-01-01     | | endDate     | LocalDate  | 조회 종료일 (yyyy-MM-dd)          | N    | 2025-12-31     | | studyTitle  | string     | 스터디명 검색 (부분 일치)         | N    | 백엔드         | | paymentCode | string     | 거래ID 검색 (부분 일치)           | N    | PAY-20251211   |  ## Query Parameters (Pageable)  | 키   | 타입   | 설명                             | 필수 | 예시           | |------|--------|----------------------------------|------|----------------| | page | number | 페이지 번호(0부터 시작)          | N    | 0              | | size | number | 페이지 크기                      | N    | 20             |  ---  ## Response (PageResponseDto<AdminTransactionListResponse>)  - `content`: 거래별 최신 상태 정보 리스트 - `page`: 현재 페이지(1 기반) - `size`: 페이지 크기 - `totalElements`: 전체 개수 

### Example

```typescript
import {
    AdminPaymentApi,
    Configuration,
    PaymentSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentApi(configuration);

let condition: PaymentSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let startDate: string; //조회 시작일 (yyyy-MM-dd) (optional) (default to undefined)
let endDate: string; //조회 종료일 (yyyy-MM-dd) (optional) (default to undefined)
let studyTitle: string; //스터디명 검색 (부분 일치) (optional) (default to undefined)
let paymentCode: string; //거래ID 검색 (부분 일치) (optional) (default to undefined)
let page: number; //페이지 번호 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)

const { status, data } = await apiInstance.getTransactionsForAdmin(
    condition,
    pageable,
    startDate,
    endDate,
    studyTitle,
    paymentCode,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **condition** | **PaymentSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **startDate** | [**string**] | 조회 시작일 (yyyy-MM-dd) | (optional) defaults to undefined|
| **endDate** | [**string**] | 조회 종료일 (yyyy-MM-dd) | (optional) defaults to undefined|
| **studyTitle** | [**string**] | 스터디명 검색 (부분 일치) | (optional) defaults to undefined|
| **paymentCode** | [**string**] | 거래ID 검색 (부분 일치) | (optional) defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 거래 내역 리스트 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

