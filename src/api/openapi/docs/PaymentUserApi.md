# PaymentUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelPayment**](#cancelpayment) | **POST** /api/v1/payments/{paymentId}/cancel | 결제 취소 (SUCCESS 이전 단계)|
|[**confirmTossPayment**](#confirmtosspayment) | **POST** /api/v1/payments/toss/confirm | Toss 결제 서버 Confirm|
|[**getMyTransactions**](#getmytransactions) | **GET** /api/v1/mypage/transactions | 마이페이지 결제 관리 리스트 조회 (결제/환불 통합)|
|[**getMyTransactionsByGroupStudy**](#getmytransactionsbygroupstudy) | **GET** /api/v1/mypage/transactions/group-studies/{groupStudyId} | 마이페이지 결제 관리 상세 조회 (그룹스터디별 전체 히스토리)|
|[**preparePayment**](#preparepayment) | **POST** /api/v1/group-studies/{groupStudyId}/payments/prepare | 유료 스터디 결제 준비|

# **cancelPayment**
> VoidResponseSchema cancelPayment()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 결제창을 열기 전 또는 결제 진행 중, 사용자가 결제를 취소할 때 사용합니다. - 아직 SUCCESS 가 아닌 결제에 한해서만 취소 상태로 변경합니다. - 실제 PG 환불/취소가 아닌, 내부 결제 엔티티 상태를 CANCELED 로 변경하는 용도입니다.  ---  ## Path Variable  | 키        | 타입   | 위치 | 설명     | 필수 | 예시 | |-----------|--------|------|----------|------|------| | paymentId | number | path | 결제 ID  | Y    | 123  |  ---  ## Response  - `BaseResponse<Void>` 형태이며, content 는 null 로 반환됩니다. 

### Example

```typescript
import {
    PaymentUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let paymentId: number; //취소할 결제 ID (default to undefined)

const { status, data } = await apiInstance.cancelPayment(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] | 취소할 결제 ID | defaults to undefined|


### Return type

**VoidResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 결제 취소 처리 성공 |  -  |
|**400** | 이미 성공하거나 취소된 결제 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 결제 정보를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **confirmTossPayment**
> StudyPaymentDetailResponseSchema confirmTossPayment(tossPaymentConfirmRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 토스 결제창에서 사용자가 결제를 완료한 뒤, 클라이언트가 서버로 결제 검증을 요청하는 API입니다. - 서버는 다음을 검증합니다.   - 결제 요청을 생성한 회원과 현재 토큰의 회원이 동일한지   - 서버에 저장된 orderId, amount 와 클라이언트/토스에서 전달된 값이 일치하는지   - 토스 PG 응답 상태가 DONE 인지 - 모든 검증이 통과되면 결제 상태를 SUCCESS 로 변경합니다. - 이미 SUCCESS 상태인 결제에 대해 다시 호출되면, 재검증 없이 현재 결제 정보를 그대로 반환합니다.  ---  ## Request Body (TossPaymentConfirmRequest)  | 키        | 타입   | 설명                               | 필수 | 예시                          | |-----------|--------|------------------------------------|------|-------------------------------| | paymentId | number | 서버에서 생성한 결제 ID           | Y    | 123                           | | orderId   | string | 토스 결제의 orderId (tossOrderId) | Y    | \"ZTO-STUDY-10-1-XYZ123\"       | | amount    | number | 결제 금액                          | Y    | 99000                         | | paymentKey| string | 토스 paymentKey                    | Y    | \"pay_20251211_abcdef123456\"   |  ---  ## Response (StudyPaymentDetailResponse)  - 결제 상세 정보 전체를 반환하며, 마이페이지 상세 조회와 동일한 필드를 가집니다. 

### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    TossPaymentConfirmRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let tossPaymentConfirmRequest: TossPaymentConfirmRequest; //토스 결제 서버 confirm 요청

const { status, data } = await apiInstance.confirmTossPayment(
    tossPaymentConfirmRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tossPaymentConfirmRequest** | **TossPaymentConfirmRequest**| 토스 결제 서버 confirm 요청 | |


### Return type

**StudyPaymentDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 결제 confirm 성공 |  -  |
|**400** | 잘못된 요청 (orderId/amount 불일치, 이미 승인된 결제 등) |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 결제 정보를 찾을 수 없음 |  -  |
|**502** | 토스 결제 승인 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyTransactions**
> PageUserTransactionListResponseSchema getMyTransactions()

작성일자: 2025-12-22  작성자: 이도현  ---  ## Description  - 로그인한 회원의 결제/환불 거래 내역을 그룹스터디별 최신 거래 기준으로 조회합니다. - PaymentHistory 테이블 기반으로 결제와 환불을 통합하여 조회합니다. - 각 그룹스터디별로 가장 최근 거래(결제 또는 환불)를 기준으로 리스트를 반환합니다. - 날짜, 스터디명, 거래ID(paymentCode)로 필터링할 수 있습니다.  ---  ## Query Parameters (Filter - PaymentSearchCondition)  | 키          | 타입       | 설명                              | 필수 | 예시           | |-------------|------------|-----------------------------------|------|----------------| | startDate   | LocalDate  | 조회 시작일 (yyyy-MM-dd)          | N    | 2025-01-01     | | endDate     | LocalDate  | 조회 종료일 (yyyy-MM-dd)          | N    | 2025-12-31     | | studyTitle  | string     | 스터디명 검색 (부분 일치)         | N    | 백엔드         | | paymentCode | string     | 거래ID 검색 (부분 일치)           | N    | PAY-20251211   |  ## Query Parameters (Pageable)  | 키   | 타입   | 설명                             | 필수 | 예시           | |------|--------|----------------------------------|------|----------------| | page | number | 페이지 번호(0부터 시작)          | N    | 0              | | size | number | 페이지 크기                      | N    | 10             |  ---  ## Response (PageResponseDto<UserTransactionListResponse>)  - `content`: 그룹스터디별 최신 거래 정보 리스트 - `page`: 현재 페이지(1 기반) - `size`: 페이지 크기 - `totalElements`: 전체 개수 

### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    PaymentSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let condition: PaymentSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let startDate: string; //조회 시작일 (yyyy-MM-dd) (optional) (default to undefined)
let endDate: string; //조회 종료일 (yyyy-MM-dd) (optional) (default to undefined)
let studyTitle: string; //스터디명 검색 (부분 일치) (optional) (default to undefined)
let paymentCode: string; //거래ID 검색 (부분 일치) (optional) (default to undefined)
let page: number; //페이지 번호 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)

const { status, data } = await apiInstance.getMyTransactions(
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

**PageUserTransactionListResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 거래 내역 리스트 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyTransactionsByGroupStudy**
> PageUserTransactionDetailResponseSchema getMyTransactionsByGroupStudy()

작성일자: 2025-12-22  작성자: 이도현  ---  ## Description  - 특정 그룹스터디에 대한 해당 유저의 전체 결제/환불 히스토리를 조회합니다. - 리스트 화면에서 토글 클릭 시 호출되어 상세 거래 내역을 표시합니다. - 결과는 최신순으로 정렬됩니다. - PAYMENT_SUCCESS,   PAYMENT_FAILED,   PAYMENT_CANCELED,   REFUND_COMPLETED,   REFUND_FAILED,   REFUND_REJECTED 기록만 조회합니다.  ---  ## Path Parameters  | 키           | 타입   | 설명                             | 필수 | 예시           | |--------------|--------|----------------------------------|------|----------------| | groupStudyId | Long   | 그룹스터디 ID                    | Y    | 10             |  ## Query Parameters (Pageable)  | 키   | 타입   | 설명                             | 필수 | 예시           | |------|--------|----------------------------------|------|----------------| | page | number | 페이지 번호(0부터 시작)          | N    | 0              | | size | number | 페이지 크기                      | N    | 20             |  ---  ## Response (PageResponseDto<UserTransactionDetailResponse>)  - `content`: 거래 히스토리 리스트 - `page`: 현재 페이지(1 기반) - `size`: 페이지 크기 - `totalElements`: 전체 개수 

### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let pageable: Pageable; // (default to undefined)
let page: number; //페이지 번호 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)

const { status, data } = await apiInstance.getMyTransactionsByGroupStudy(
    groupStudyId,
    pageable,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to undefined|


### Return type

**PageUserTransactionDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 거래 내역 상세 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **preparePayment**
> StudyPaymentPrepareResponseSchema preparePayment(studyPaymentPrepareRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 유료 스터디 결제를 진행하기 위해 결제 정보를 생성합니다. - 사용자는 이미 신청(PENDING/APPROVED)한 유료 스터디에 대해 결제 페이지로 진입할 때 이 API를 호출합니다. - 서버 기준 스터디 가격(`group_study.price`)과 클라이언트에서 전달한 금액이 다를 경우 결제 준비를 거부합니다. - 동일 회원이 동일 스터디에 대해 SUCCESS 상태 결제를 이미 보유한 경우 재결제를 허용하지 않습니다.  ---  ## Business Rule  - 그룹스터디 조건   - 삭제된 스터디일 경우 결제 불가   - 스터디 상태가 `RECRUITING` 이 아닐 경우 결제 불가   - 무료 스터디(`price == null or 0`)는 결제 불가  - 신청 여부   - 회원이 해당 스터디에 `PENDING` 또는 `APPROVED` 상태로 신청한 기록이 없으면 결제 불가  - 결제 중복 방지   - 동일 회원/스터디 조합에 대해 SUCCESS 결제가 이미 존재하면 에러  ---  ## Path Variable  | 키           | 타입   | 위치  | 설명                | 필수 | 예시 | |--------------|--------|-------|---------------------|------|------| | groupStudyId | number | path  | 결제 대상 스터디 ID | Y    | 10   |  ---  ## Request Body (StudyPaymentPrepareRequest)  | 키     | 타입   | 설명                                                         | 필수 | 예시  | |--------|--------|--------------------------------------------------------------|------|-------| | amount | number | 클라이언트에서 인지한 결제 금액 (null 가능, 있을 경우 서버 금액과 일치 검증) | N    | 99000 |  ---  ## Response (StudyPaymentPrepareResponse)  | 키                        | 타입    | 설명                               | |---------------------------|---------|------------------------------------| | paymentId                 | number  | 생성된 결제 ID                       | | paymentCode               | string  | 비즈니스용 결제 코드 (PAY-...)        | | groupStudyId              | number  | 스터디 ID                           | | groupStudyTitle           | string  | 스터디 제목                          | | groupStudyDescription     | string  | 스터디 설명                          | | groupStudyImage           | string  | 스터디 이미지                        | | memberId                  | number  | 결제 회원 ID                        | | memberName                | string  | 결제 회원 이름(또는 프로필 이름)       | | amount                    | number  | 결제 금액                           | | currency                  | string  | 통화 (예: KRW)                     | | pgProvider                | string  | PG사 식별자 (예: TOSS)             | | tossOrderId               | string  | 토스 payment orderId (유니크 값)   | 

### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    StudyPaymentPrepareRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let groupStudyId: number; //결제 대상 그룹스터디 ID (default to undefined)
let studyPaymentPrepareRequest: StudyPaymentPrepareRequest; //결제 준비 요청

const { status, data } = await apiInstance.preparePayment(
    groupStudyId,
    studyPaymentPrepareRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyPaymentPrepareRequest** | **StudyPaymentPrepareRequest**| 결제 준비 요청 | |
| **groupStudyId** | [**number**] | 결제 대상 그룹스터디 ID | defaults to undefined|


### Return type

**StudyPaymentPrepareResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 결제 준비 성공 |  -  |
|**400** | 잘못된 요청 (금액 불일치, 무료 스터디, 스터디 시작 후 결제 시도, 미신청 스터디 등) |  -  |
|**404** | 존재하지 않는 회원 요청 |  -  |
|**409** | 이미 결제 완료된 스터디 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

