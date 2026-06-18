# RefundUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelRefundRequest**](#cancelrefundrequest) | **POST** /api/v1/refunds/{refundId}/cancel | 사용자 환불 요청 취소|
|[**getMyRefunds**](#getmyrefunds) | **GET** /api/v1/mypage/refunds | 마이페이지 환불 내역 조회|
|[**requestRefund**](#requestrefund) | **POST** /api/v1/payments/{paymentId}/refunds | 사용자 환불 요청|

# **cancelRefundRequest**
> VoidResponseSchema cancelRefundRequest()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 사용자가 본인이 요청한 환불 요청을 취소합니다. - 환불 상태가 `REQUESTED` 인 경우에만 취소 가능합니다. - 다음 조건에 해당하는 경우 에러가 발생할 수 있습니다.   - 다른 사용자의 환불 건을 취소하려는 경우   - 환불 상태가 REQUESTED가 아닌 경우 (APPROVED / COMPLETED / CANCELED 등)  ---  ## Path Variable  | **키**    | **타입** | **위치** | **설명**     | **필수 여부** | **예시** | |----------|---------|---------|-------------|--------------|----------| | refundId | number  | path    | 취소할 환불 ID | Y           | 1        |  ---  ## Request Body  - Request Body는 필요하지 않습니다.  ---  ## Response  - `content`는 `null`이며, 상태 코드 200과 함께 성공 메시지를 반환합니다. 

### Example

```typescript
import {
    RefundUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let refundId: number; //취소할 환불 요청 ID (default to undefined)

const { status, data } = await apiInstance.cancelRefundRequest(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] | 취소할 환불 요청 ID | defaults to undefined|


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
|**200** | 사용자 환불 요청 취소 성공 |  -  |
|**400** | 환불 상태가 유효하지 않거나 이미 취소됨 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 환불 정보를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyRefunds**
> PageStudyRefundSummaryResponseSchema getMyRefunds()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 사용자의 환불 내역을 페이징 형태로 조회합니다. - 최근 요청( requestedAt ) 기준으로 정렬하여 보여줍니다.  ---  ## Query Parameters (Pageable)  | **키**  | **타입** | **위치** | **설명**                          | **필수 여부** | **예시**             | |--------|---------|---------|------------------------------------|--------------|----------------------| | page   | number  | query   | 조회할 페이지 (0부터 시작)           | N            | 0                    | | size   | number  | query   | 페이지당 데이터 개수                 | N            | 10                   | | sort   | string  | query   | 정렬 기준 필드명, `requestedAt` 기준 권장 | N       | requestedAt,desc     |  ---  ## Response (PageResponseDto<StudyRefundSummaryResponse>)  ### PageResponseDto  | **키**         | **타입**          | **설명**                    | |---------------|------------------|----------------------------| | content       | array           | 환불 요약 정보 리스트         | | page          | number          | 현재 페이지(1부터 시작)       | | size          | number          | 페이지 크기                   | | totalElements | number          | 전체 데이터 개수              |  ### StudyRefundSummaryResponse  | **키**           | **타입**   | **설명**              | |-----------------|-----------|-----------------------| | refundId        | number    | 환불 ID               | | refundCode      | string    | 환불 코드             | | paymentId       | number    | 결제 ID               | | paymentCode     | string    | 결제 코드             | | memberId        | number    | 회원 ID               | | memberName      | string    | 회원 로그인 ID        | | groupStudyId    | number    | 그룹스터디 ID         | | groupStudyTitle | string    | 그룹스터디 제목       | | refundAmount    | number    | 환불 금액             | | status          | string    | 환불 상태             | | requestedAt     | datetime  | 환불 요청 일시        | | refundedAt      | datetime  | 환불 완료 일시        | 

### Example

```typescript
import {
    RefundUserApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let pageable: Pageable; // (default to undefined)
let page: number; //조회할 페이지 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지당 데이터 개수 (optional) (default to undefined)
let sort: string; //정렬 기준 (예: requestedAt,desc) (optional) (default to undefined)

const { status, data } = await apiInstance.getMyRefunds(
    pageable,
    page,
    size,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **page** | [**number**] | 조회할 페이지 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지당 데이터 개수 | (optional) defaults to undefined|
| **sort** | [**string**] | 정렬 기준 (예: requestedAt,desc) | (optional) defaults to undefined|


### Return type

**PageStudyRefundSummaryResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 마이페이지 환불 내역 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestRefund**
> StudyRefundDetailResponseSchema requestRefund(studyRefundCreateRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 특정 결제 건에 대해 사용자가 환불을 요청합니다. - 실제 환불 가능 여부(정산 여부, 스터디 상태 등)는 서버에서 정책에 따라 검증합니다. - 환불 금액은 결제 금액과 환불 정책(진행 기간, 출석률 등)에 따라 서버에서 계산됩니다. - 다음 조건에 해당하는 경우 에러가 발생할 수 있습니다.   - 결제가 완료되지 않은 경우   - 이미 동일 결제 건에 대해 환불이 진행 중 또는 완료된 경우   - 해당 스터디에 대해 정산(PENDING/APPROVED/COMPLETED)이 생성된 경우   - 스터디에서 정상 퇴장/강퇴( EXIT / KICKED ) 상태가 아닌 경우   - 환불 정책상 환불 가능 금액이 0원 이하인 경우  ---  ## Path Variable  | **키**      | **타입** | **위치** | **설명**     | **필수 여부** | **예시** | |------------|---------|---------|-------------|--------------|----------| | paymentId  | number  | path    | 결제 ID      | Y            | 10       |  ---  ## Request Body (StudyRefundCreateRequest)  | **키**  | **타입** | **설명**                           | **필수 여부** | **예시**                          | |--------|---------|------------------------------------|--------------|-----------------------------------| | reason | string  | 사용자가 남기는 환불 요청 사유        | N            | \"스터디 일정과 맞지 않아 환불 요청\" |  ---  ## Response (StudyRefundDetailResponse)  | **키**           | **타입**   | **설명**                 | |-----------------|-----------|--------------------------| | refundId        | number    | 환불 ID                  | | refundCode      | string    | 환불 코드                | | paymentId       | number    | 결제 ID                  | | paymentCode     | string    | 결제 코드                | | memberId        | number    | 회원 ID                  | | memberName      | string    | 회원 로그인 ID           | | groupStudyId    | number    | 그룹스터디 ID            | | groupStudyTitle | string    | 그룹스터디 제목          | | originalAmount  | number    | 기존 결제 금액           | | refundAmount    | number    | 환불 예정 금액           | | status          | string    | 환불 상태(REQUESTED 등)  | | reason          | string    | 사용자 환불 요청 사유     | | requestedAt     | datetime  | 환불 요청 일시           | | approvedAt      | datetime  | 환불 승인 일시           | | refundedAt      | datetime  | 환불 완료 일시           | | canceledAt      | datetime  | 환불 요청 취소 일시      | 

### Example

```typescript
import {
    RefundUserApi,
    Configuration,
    StudyRefundCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let paymentId: number; //환불을 요청할 결제 ID (default to undefined)
let studyRefundCreateRequest: StudyRefundCreateRequest; //사용자 환불 요청 정보

const { status, data } = await apiInstance.requestRefund(
    paymentId,
    studyRefundCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyRefundCreateRequest** | **StudyRefundCreateRequest**| 사용자 환불 요청 정보 | |
| **paymentId** | [**number**] | 환불을 요청할 결제 ID | defaults to undefined|


### Return type

**StudyRefundDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 사용자 환불 요청 성공 |  -  |
|**400** | 환불 불가 상태 (이미 환불 진행중, 정산 후, 환불 금액 0원 등) |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 결제 정보를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

