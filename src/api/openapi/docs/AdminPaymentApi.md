# AdminPaymentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**forceCancelPayment**](#forcecancelpayment) | **POST** /api/v1/admin/payments/{paymentId}/cancel | 관리자 결제 강제 취소|
|[**getPaymentsForAdmin**](#getpaymentsforadmin) | **GET** /api/v1/admin/payments | 관리자 결제 내역 목록 조회|

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

# **getPaymentsForAdmin**
> getPaymentsForAdmin()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 관리자 페이지에서 유료 스터디 결제 내역을 조회합니다. - `memberId`, `groupStudyId`, `status`를 이용해 필터링할 수 있으며, 페이지네이션이 적용됩니다.  ---  ## Request  | **키**        | **타입** | **위치** | **설명**                                   | **필수 여부** | **예시**               | |--------------|---------|---------|-------------------------------------------|--------------|------------------------| | memberId     | number  | query   | 회원 ID (필터용)                           | N            | 53                     | | groupStudyId | number  | query   | 스터디 ID (필터용)                         | N            | 55                     | | status       | string  | query   | 결제 상태 (`REQUESTED`, `SUCCESS` 등)      | N            | \"SUCCESS\"              | | page         | number  | query   | 페이지 번호 (0부터 시작)                   | N            | 0                      | | size         | number  | query   | 페이지 크기                                | N            | 20                     | | sort         | string  | query   | 정렬 기준 (예: `\"createdAt,desc\"`)         | N            | \"createdAt,desc\"       |  ---  ## Response  | **키**       | **타입** | **설명**                                                                                   | |-------------|---------|-------------------------------------------------------------------------------------------| | statusCode  | number  | 상태 코드 (200: 성공 / 400: 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 500: 서버 오류 등) | | timestamp   | string(datetime) | 응답 일시                                                                                 | | content     | object  | 페이지네이션된 결제 요약 목록 (`PageResponseDto<StudyPaymentSummaryResponse>`)            | | message     | string  | 처리 결과 메시지                                                                          |  ### content 구조 (PageResponseDto)  | **키**         | **타입** | **설명**                        | |---------------|---------|--------------------------------| | content       | array  | 결제 요약 목록                 | | page          | number | 현재 페이지 번호 (1부터 시작)  | | size          | number | 페이지 크기                    | | totalElements | number | 전체 데이터 개수               | | totalPages    | number | 전체 페이지 수                 | | hasNext       | bool   | 다음 페이지 존재 여부          | | hasPrevious   | bool   | 이전 페이지 존재 여부          |  ### content[].content[i] 구조 (StudyPaymentSummaryResponse)  | **키**           | **타입** | **설명**                  | |-----------------|---------|---------------------------| | paymentId       | number  | 결제 ID                   | | paymentCode     | string  | 결제 코드                 | | groupStudyId    | number  | 스터디 ID                 | | groupStudyTitle | string  | 스터디 제목               | | memberId        | number  | 결제 회원 ID              | | memberName      | string  | 결제 회원명/로그인ID      | | amount          | number  | 결제 금액(원)             | | status          | string  | 결제 상태 (`SUCCESS` 등)  | | method          | string  | 결제 수단 (`CARD` 등)     | | createdAt       | string(datetime) | 결제 레코드 생성 시각 | | paidAt          | string(datetime) | 실제 결제 완료 시각    | 

### Example

```typescript
import {
    AdminPaymentApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentApi(configuration);

let pageable: Pageable; // (default to undefined)
let memberId: number; //회원 ID (필터용) (optional) (default to undefined)
let groupStudyId: number; //스터디 ID (필터용) (optional) (default to undefined)
let status: string; //결제 상태 (예: REQUESTED, SUCCESS, FAILED, CANCELED) (optional) (default to undefined)
let page: number; //페이지 번호 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)
let sort: string; //정렬 기준 (예: createdAt,desc) (optional) (default to undefined)

const { status, data } = await apiInstance.getPaymentsForAdmin(
    pageable,
    memberId,
    groupStudyId,
    status,
    page,
    size,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **memberId** | [**number**] | 회원 ID (필터용) | (optional) defaults to undefined|
| **groupStudyId** | [**number**] | 스터디 ID (필터용) | (optional) defaults to undefined|
| **status** | [**string**] | 결제 상태 (예: REQUESTED, SUCCESS, FAILED, CANCELED) | (optional) defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to undefined|
| **sort** | [**string**] | 정렬 기준 (예: createdAt,desc) | (optional) defaults to undefined|


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
|**200** | 관리자 결제 내역 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

