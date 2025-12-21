# AdminRefundApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveRefund**](#approverefund) | **POST** /api/v1/admin/refunds/{refundId}/approve | 관리자 환불 승인|
|[**completeRefund**](#completerefund) | **POST** /api/v1/admin/refunds/{refundId}/complete | 관리자 환불 완료 처리|
|[**getRefundsForAdmin**](#getrefundsforadmin) | **GET** /api/v1/admin/refunds | 관리자 환불 내역 조회|
|[**rejectRefund**](#rejectrefund) | **POST** /api/v1/admin/refunds/{refundId}/reject | 관리자 환불 거절|
|[**retryRefund**](#retryrefund) | **POST** /api/v1/admin/refunds/{refundId}/retry | 관리자 환불 재시도|

# **approveRefund**
> approveRefund(studyRefundApproveRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 사용자가 요청한 환불 건을 관리자가 승인합니다. - 필요 시 환불 금액을 조정할 수 있습니다. - 승인 후 PG 취소는 수행되지 않으며, `환불 완료 처리` API에서 실제 환불이 진행됩니다. - 다음 조건에 해당하는 경우 에러가 발생할 수 있습니다.   - 이미 동일 결제 건에 대해 환불이 진행 중 또는 완료된 경우   - 해당 스터디에 대해 정산(PENDING/APPROVED/COMPLETED)이 생성된 경우 (이후 환불 불가)   - 환불 상태가 REQUESTED/APPROVED 가 아닌 경우  ---  ## Path Variable  | **키**    | **타입** | **위치** | **설명**   | **필수 여부** | **예시** | |----------|---------|---------|-----------|--------------|----------| | refundId | number  | path    | 환불 ID    | Y            | 1        |  ---  ## Request Body (StudyRefundApproveRequest)  | **키**          | **타입** | **설명**                                                                 | **필수 여부** | **예시**  | |----------------|---------|------------------------------------------------------------------------|--------------|-----------| | approvedAmount | number  | 관리자가 승인한 환불 금액 (null인 경우 정책에 의해 계산된 기본 금액 사용) | N            | 40000     | | adminReason    | string  | 관리자가 남기는 환불 승인/금액 조정 사유                                  | N            | \"출석률 고려 부분 환불\" |  ---  ## Response (StudyRefundDetailResponse)  | **키**          | **타입**   | **설명**                     | |----------------|-----------|------------------------------| | refundId       | number    | 환불 ID                      | | refundCode     | string    | 환불 코드                    | | paymentId      | number    | 결제 ID                      | | paymentCode    | string    | 결제 코드                    | | memberId       | number    | 회원 ID                      | | memberName     | string    | 회원 로그인 ID               | | groupStudyId   | number    | 그룹스터디 ID                | | groupStudyTitle| string    | 그룹스터디 제목              | | originalAmount | number    | 결제 원금                     | | refundAmount   | number    | 최종 승인된 환불 금액        | | status         | string    | 환불 상태(APPROVED)          | | reason         | string    | 사용자/관리자 환불 사유       | | requestedAt    | datetime  | 환불 요청 일시               | | approvedAt     | datetime  | 환불 승인 일시               | | refundedAt     | datetime  | 환불 완료 일시(미완료 시 null)| | canceledAt     | datetime  | 환불 요청 취소 일시(없으면 null) | 

### Example

```typescript
import {
    AdminRefundApi,
    Configuration,
    StudyRefundApproveRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; //환불 ID (default to undefined)
let studyRefundApproveRequest: StudyRefundApproveRequest; //관리자 환불 승인/금액 조정 요청

const { status, data } = await apiInstance.approveRefund(
    refundId,
    studyRefundApproveRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyRefundApproveRequest** | **StudyRefundApproveRequest**| 관리자 환불 승인/금액 조정 요청 | |
| **refundId** | [**number**] | 환불 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 환불 승인 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeRefund**
> completeRefund()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 승인된 환불 건에 대해 실제 PG 환불을 수행합니다. - Toss PG의 결제 취소 API를 호출하여 환불을 완료하고, 환불 상태를 `COMPLETED`로 변경합니다. - 다음 조건에 해당하는 경우 에러가 발생할 수 있습니다.   - 이미 동일 결제 건에 대해 환불이 진행 중 또는 완료된 경우   - 해당 스터디에 대해 정산(PENDING/APPROVED/COMPLETED)이 생성된 경우 (이후 환불 불가)   - 환불 상태가 REQUESTED/APPROVED 가 아닌 경우  ---  ## Path Variable  | **키**    | **타입** | **위치** | **설명**   | **필수 여부** | **예시** | |----------|---------|---------|-----------|--------------|----------| | refundId | number  | path    | 환불 ID    | Y            | 1        |  ---  ## Response (StudyRefundDetailResponse)  | **키**          | **타입**   | **설명**                     | |----------------|-----------|------------------------------| | refundId       | number    | 환불 ID                      | | refundCode     | string    | 환불 코드                    | | paymentId      | number    | 결제 ID                      | | paymentCode    | string    | 결제 코드                    | | memberId       | number    | 회원 ID                      | | memberName     | string    | 회원 로그인 ID               | | groupStudyId   | number    | 그룹스터디 ID                | | groupStudyTitle| string    | 그룹스터디 제목              | | originalAmount | number    | 결제 원금                     | | refundAmount   | number    | 실제 환불된 금액             | | status         | string    | 환불 상태(COMPLETED)         | | reason         | string    | 환불 사유                     | | requestedAt    | datetime  | 환불 요청 일시               | | approvedAt     | datetime  | 환불 승인 일시               | | refundedAt     | datetime  | 환불 완료 일시               | | canceledAt     | datetime  | 환불 요청 취소 일시(없으면 null) | 

### Example

```typescript
import {
    AdminRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; //환불 ID (default to undefined)

const { status, data } = await apiInstance.completeRefund(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] | 환불 ID | defaults to undefined|


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
|**200** | 관리자 환불 완료 처리 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRefundsForAdmin**
> getRefundsForAdmin()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 관리자 페이지에서 유료 스터디 환불 내역을 조회합니다. - 회원 ID, 환불 상태를 기준으로 필터링할 수 있습니다.  ---  ## Request  | **키**      | **타입** | **위치** | **설명**                          | **필수 여부** | **예시**         | |------------|---------|---------|-----------------------------------|--------------|-----------------| | memberId   | number  | query   | 회원 ID                            | N            | 3               | | status     | string  | query   | 환불 상태(REQUESTED/APPROVED/COMPLETED/REJECTED/CANCELED) | N | \"COMPLETED\" | | page       | number  | query   | 페이지 번호(0부터 시작)           | N            | 0               | | size       | number  | query   | 페이지 크기                        | N            | 20              |  ---  ## Response  `content` 필드는 페이징된 환불 요약 정보입니다.  ### content.content (StudyRefundSummaryResponse)  | **키**          | **타입**   | **설명**                               | **예시**                          | |----------------|-----------|----------------------------------------|-----------------------------------| | refundId       | number    | 환불 ID                                | 1                                 | | refundCode     | string    | 환불 코드                              | \"RF-1A2B3C4D\"                     | | paymentId      | number    | 결제 ID                                | 10                                | | paymentCode    | string    | 결제 코드                              | \"PAY-20251211-ABCDEFGH\"          | | memberId       | number    | 회원 ID                                | 3                                 | | memberName     | string    | 회원 로그인 ID                         | \"user01\"                          | | groupStudyId   | number    | 그룹스터디 ID                          | 5                                 | | groupStudyTitle| string    | 그룹스터디 제목                        | \"Spring 웹 백엔드 스터디\"        | | refundAmount   | number    | 환불 금액                              | 50000                             | | status         | string    | 환불 상태                              | \"COMPLETED\"                       | | requestedAt    | datetime  | 환불 요청 일시                         | \"2025-12-10T09:00:00\"             | | refundedAt     | datetime  | 환불 완료 일시(미완료 시 null)        | \"2025-12-10T10:00:00\"             |  ### content (PageResponseDto)  | **키**        | **타입** | **설명**                     | **예시** | |--------------|---------|------------------------------|----------| | content      | array   | 환불 내역 리스트             | [...]    | | page         | number  | 현재 페이지 (1부터 시작)     | 1        | | size         | number  | 페이지 크기                  | 20       | | totalElements| number  | 전체 데이터 개수             | 1        | | totalPages   | number  | 전체 페이지 수               | 1        | | hasNext      | boolean | 다음 페이지 존재 여부        | false    | | hasPrevious  | boolean | 이전 페이지 존재 여부        | false    | 

### Example

```typescript
import {
    AdminRefundApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let pageable: Pageable; // (default to undefined)
let memberId: number; //회원 ID (필터링용, 미전달 시 전체 조회) (optional) (default to undefined)
let status: string; //환불 상태 (REQUESTED/APPROVED/COMPLETED/REJECTED/CANCELED) (optional) (default to undefined)
let page: number; //페이지 번호 (0부터 시작, 기본값 0) (optional) (default to undefined)
let size: number; //페이지 크기 (기본값 20) (optional) (default to undefined)

const { status, data } = await apiInstance.getRefundsForAdmin(
    pageable,
    memberId,
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **memberId** | [**number**] | 회원 ID (필터링용, 미전달 시 전체 조회) | (optional) defaults to undefined|
| **status** | [**string**] | 환불 상태 (REQUESTED/APPROVED/COMPLETED/REJECTED/CANCELED) | (optional) defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0부터 시작, 기본값 0) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 (기본값 20) | (optional) defaults to undefined|


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
|**200** | 관리자 환불 내역 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rejectRefund**
> rejectRefund(studyRefundRejectRequest)

작성일자: 2025-12-20  작성자: 이도현  ---  ## Description  - 사용자가 요청한 환불 건을 관리자가 거절 처리합니다. - 환불 상태는 REQUESTED → REJECTED 로 변경됩니다. - 결제 상태는 변경되지 않습니다. - 거절 사유는 환불 정보 및 결제 히스토리에 관리자 액션으로 기록됩니다. - 환불 요청 상태가 REQUESTED가 아닌 경우 에러가 발생합니다.  ---  ## Path Variable  | **키**    | **타입** | **위치** | **설명** | **필수 여부** | **예시** | |----------|---------|---------|----------|--------------|----------| | refundId | number  | path    | 환불 ID  | Y            | 1        |  ---  ## Request Body (StudyRefundRejectRequest)  | **키** | **타입** | **설명**           | **필수 여부** | **예시** | |------|--------|------------------|--------------|----------| | reason | string | 관리자 환불 거절 사유 | Y            | \"출석률 미달로 환불 불가\" |  ---  ## Response (StudyRefundDetailResponse)  | **키**          | **타입**   | **설명**                     | |----------------|-----------|------------------------------| | refundId       | number    | 환불 ID                      | | refundCode     | string    | 환불 코드                    | | paymentId      | number    | 결제 ID                      | | paymentCode    | string    | 결제 코드                    | | memberId       | number    | 회원 ID                      | | memberName     | string    | 회원 로그인 ID               | | groupStudyId   | number    | 그룹스터디 ID                | | groupStudyTitle| string    | 그룹스터디 제목              | | originalAmount | number    | 결제 원금                    | | refundAmount   | number    | 환불 금액 (거절 시 null)     | | status         | string    | 환불 상태(REJECTED)          | | reason         | string    | 관리자 거절 사유             | | requestedAt    | datetime  | 환불 요청 일시               | | approvedAt     | datetime  | 환불 승인 일시(null)         | | refundedAt     | datetime  | 환불 완료 일시(null)         | | canceledAt     | datetime  | 환불 요청 취소 일시(null)    | 

### Example

```typescript
import {
    AdminRefundApi,
    Configuration,
    StudyRefundRejectRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; //환불 ID (default to undefined)
let studyRefundRejectRequest: StudyRefundRejectRequest; //관리자 환불 거절 요청

const { status, data } = await apiInstance.rejectRefund(
    refundId,
    studyRefundRejectRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyRefundRejectRequest** | **StudyRefundRejectRequest**| 관리자 환불 거절 요청 | |
| **refundId** | [**number**] | 환불 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 환불 거절 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retryRefund**
> retryRefund()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - PG 환불 요청이 실패(FAILED) 상태인 환불 건에 대해 관리자 권한으로 환불을 재시도합니다. - `RefundStatus.FAILED` 상태의 건만 재시도할 수 있습니다. - 재시도 성공 시 환불 상태는 `COMPLETED`로 변경됩니다. - 재시도 중 다시 PG 에러가 발생하면 상태는 `FAILED`로 유지/갱신되며, 에러 메시지가 관리자 사유에 기록될 수 있습니다.  ---  ## Path Variable  | **키**    | **타입** | **위치** | **설명**               | **필수 여부** | **예시** | |----------|---------|---------|------------------------|--------------|----------| | refundId | number  | path    | 재시도할 환불 ID        | Y            | 1        |  ---  ## Request Body  - Request Body는 없습니다.  ---  ## Response (StudyRefundDetailResponse)  | **키**           | **타입**   | **설명**                           | |-----------------|-----------|------------------------------------| | refundId        | number    | 환불 ID                            | | refundCode      | string    | 환불 코드                          | | paymentId       | number    | 결제 ID                            | | paymentCode     | string    | 결제 코드                          | | memberId        | number    | 회원 ID                            | | memberName      | string    | 회원 로그인 ID                     | | groupStudyId    | number    | 그룹스터디 ID                      | | groupStudyTitle | string    | 그룹스터디 제목                    | | originalAmount  | number    | 결제 원금                          | | refundAmount    | number    | 환불 금액                          | | status          | string    | 환불 상태(FAILED/COMPLETED 등)     | | reason          | string    | 사용자/관리자 환불 사유            | | requestedAt     | datetime  | 환불 요청 일시                     | | approvedAt      | datetime  | 환불 승인 일시(없으면 null)        | | refundedAt      | datetime  | 환불 완료 일시(실패 시 null)      | | canceledAt      | datetime  | 환불 요청 취소 일시(없으면 null)   | 

### Example

```typescript
import {
    AdminRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; //재시도할 환불 ID (default to undefined)

const { status, data } = await apiInstance.retryRefund(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] | 재시도할 환불 ID | defaults to undefined|


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
|**200** | 관리자 환불 재시도 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

