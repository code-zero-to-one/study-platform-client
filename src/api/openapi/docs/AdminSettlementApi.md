# AdminSettlementApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**completeSettlement**](#completesettlement) | **POST** /api/v1/admin/settlements/{settlementId}/complete | 관리자 정산 완료 처리|
|[**createSettlement**](#createsettlement) | **POST** /api/v1/admin/settlements | 관리자 정산 생성|
|[**getSettlementsForAdmin**](#getsettlementsforadmin) | **GET** /api/v1/admin/settlements | 관리자 정산 내역 목록 조회|

# **completeSettlement**
> StudySettlementDetailResponseSchema completeSettlement()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 생성된 정산 건을 `COMPLETED` 상태로 변경합니다. - 실제로는 관리자에 의해 정산 금액이 리더에게 지급 완료된 시점에 호출됩니다. - `PENDING` 상태가 아닌 정산에 대해 완료 처리를 시도하면 에러가 발생합니다.  ---  ## Request  | **키** | **타입** | **위치** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | --- | | settlementId | number | path | 완료 처리할 정산 ID | Y | 1 |  ---  ## Response  - `StudySettlementDetailResponse` 반환 - 상태가 `COMPLETED`로 변경된 최종 정산 정보입니다. 

### Example

```typescript
import {
    AdminSettlementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let settlementId: number; //완료 처리할 정산 ID (default to undefined)

const { status, data } = await apiInstance.completeSettlement(
    settlementId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **settlementId** | [**number**] | 완료 처리할 정산 ID | defaults to undefined|


### Return type

**StudySettlementDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 정산 완료 처리 성공 |  -  |
|**400** | 정산 상태가 유효하지 않거나 이미 완료됨 |  -  |
|**404** | 정산 정보를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createSettlement**
> StudySettlementDetailResponseSchema createSettlement(studySettlementCreateRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 관리자 권한으로 특정 유료 스터디에 대한 정산을 생성합니다. - 스터디 종료 상태(`GroupStudyStatus.COMPLETED`)이며, 성공 결제 내역이 존재하고,   환불이 모두 처리된 상태(진행 중 환불 없음)에서만 정산을 생성할 수 있습니다. - 생성된 정산은 `PENDING` 상태로 저장되며, 이후 정산 완료 처리 API를 통해 `COMPLETED`로 변경됩니다. - 다음 조건을 만족하지 않으면 정산이 생성되지 않습니다.   - 해당 스터디에 SUCCESS 상태의 결제가 하나 이상 존재해야 합니다.   - REQUESTED/APPROVED 상태의 환불 건이 없어야 합니다.   - (총 결제액 - 완료된 환불액) > 0 이어야 합니다.   - 동일 스터디에 대해 PENDING/APPROVED/COMPLETED 상태의 정산이 이미 존재하지 않아야 합니다.  ---  ## Request Body (`StudySettlementCreateRequest`)  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | groupStudyId | number | 정산 대상 스터디 ID | Y | 10 | | platformFeeRate | number(decimal) | 플랫폼 수수료율 (미전달 시 기본 0.10) | N | 0.10 | | taxRate | number(decimal) | 세금/원천징수 비율 (미전달 시 기본 0.033) | N | 0.033 | | scheduledAt | string(datetime) | 정산 예정 일시 (미전달 시 기준+3일) | N | \"2025-12-20T00:00:00\" |  ---  ## Response  `StudySettlementDetailResponse`를 content로 반환합니다.  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | settlementId | number | 정산 ID | 1 | | settlementCode | string | 정산 코드 | \"SET-AB12CD34\" | | groupStudyId | number | 스터디 ID | 10 | | groupStudyTitle | string | 스터디 제목 | \"알고리즘 스터디 1기\" | | leaderId | number | 스터디 리더 회원 ID | 3 | | leaderName | string | 스터디 리더 로그인 ID | \"leader01\" | | totalSalesAmount | number | 총 매출 금액(성공 결제 합산) | 1000000 | | totalRefundAmount | number | 총 환불 금액(완료 환불 합산) | 100000 | | platformFeeRate | number(decimal) | 플랫폼 수수료율 | 0.10 | | taxRate | number(decimal) | 세율 | 0.033 | | settlementAmount | number | 최종 정산 금액(원) | 810000 | | scheduledAt | string(datetime) | 정산 예정 일시 | \"2025-12-20T00:00:00\" | | settledAt | string(datetime) | 정산 완료 일시(생성 시 null) | null | | status | string(SettlementStatus) | 정산 상태 | \"PENDING\" | 

### Example

```typescript
import {
    AdminSettlementApi,
    Configuration,
    StudySettlementCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let studySettlementCreateRequest: StudySettlementCreateRequest; //정산 생성 요청 본문

const { status, data } = await apiInstance.createSettlement(
    studySettlementCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studySettlementCreateRequest** | **StudySettlementCreateRequest**| 정산 생성 요청 본문 | |


### Return type

**StudySettlementDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 관리자 정산 생성 성공 |  -  |
|**400** | 정산 생성 불가 상태 |  -  |
|**404** | 그룹스터디를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSettlementsForAdmin**
> PageStudySettlementSummaryResponseSchema getSettlementsForAdmin()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 관리자 페이지에서 정산 내역을 페이지 단위로 조회합니다. - 날짜, 스터디명, 정산ID, 정산 상태로 필터링하여 조회할 수 있습니다. - 정산 정보에는 스터디, 리더, 정산 금액, 정산 예정일/완료일, 상태 정보가 포함됩니다.  ---  ## Query Parameters (Filter - SettlementSearchCondition)  | **키**        | **타입**   | **위치** | **설명**                                   | **필수 여부** | **예시**         | |--------------|-----------|---------|-------------------------------------------|--------------|------------------| | startDate    | LocalDate | query   | 정산 예정일 조회 시작일 (yyyy-MM-dd)        | N            | 2025-01-01       | | endDate      | LocalDate | query   | 정산 예정일 조회 종료일 (yyyy-MM-dd)        | N            | 2025-12-31       | | studyTitle   | string    | query   | 스터디명 검색 (부분 일치)                   | N            | 백엔드           | | settlementId | number    | query   | 정산 ID로 조회                             | N            | 123              | | status       | string    | query   | 정산 상태 (PENDING, APPROVED, COMPLETED 등) | N            | PENDING          |  ## Query Parameters (Pageable)  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | page | number | 페이지 번호 (0부터 시작) | N | 0 | | size | number | 페이지 크기 | N | 20 | | sort | string | 정렬 기준 | N | \"scheduledAt,desc\" |  ---  ## Response  ### content  - `content`: 정산 목록 (배열) - 각 요소는 `StudySettlementSummaryResponse` 형식입니다.  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | settlementId | number | 정산 ID | 1 | | settlementCode | string | 정산 코드 | \"SET-AB12CD34\" | | groupStudyId | number | 스터디 ID | 10 | | groupStudyTitle | string | 스터디 제목 | \"알고리즘 스터디 1기\" | | leaderId | number | 스터디 개설자 ID | 53 | | leaderName | string | 스터디 개설자명 | \"이도현\" | | settlementAmount | number | 정산 금액(원) | 900000 | | status | string | 정산 상태 | \"PENDING\" | | bankName | string | 정산 계좌 은행명 | \"카카오뱅크\" | | accountNumber | string | 정산 계좌번호 | \"3333-12-3456789\" | | scheduledAt | string(datetime) | 정산 예정 일시 | \"2025-12-20T00:00:00\" | | settledAt | string(datetime) | 정산 완료 일시(완료 전 null) | null |  ### page 정보  - `PageResponseDto` 형식  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | content | array | 정산 목록 | [ { ... } ] | | page | number | 현재 페이지 번호(1부터 시작) | 1 | | size | number | 페이지 크기 | 20 | | totalElements | number | 전체 데이터 개수 | 1 | | totalPages | number | 전체 페이지 수 | 1 | | hasNext | boolean | 다음 페이지 존재 여부 | false | | hasPrevious | boolean | 이전 페이지 존재 여부 | false | 

### Example

```typescript
import {
    AdminSettlementApi,
    Configuration,
    SettlementSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let condition: SettlementSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let startDate: string; //정산 예정일 조회 시작일 (yyyy-MM-dd) (optional) (default to undefined)
let endDate: string; //정산 예정일 조회 종료일 (yyyy-MM-dd) (optional) (default to undefined)
let studyTitle: string; //스터디명 검색 (부분 일치) (optional) (default to undefined)
let settlementCode: string; //정산 Code로 조회 (optional) (default to undefined)
let status: string; //정산 상태 필터 (PENDING, APPROVED, COMPLETED, CANCELED) (optional) (default to undefined)
let page: number; //페이지 번호 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)
let sort: string; //정렬 기준 (optional) (default to undefined)

const { status, data } = await apiInstance.getSettlementsForAdmin(
    condition,
    pageable,
    startDate,
    endDate,
    studyTitle,
    settlementCode,
    status,
    page,
    size,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **condition** | **SettlementSearchCondition** |  | defaults to undefined|
| **pageable** | **Pageable** |  | defaults to undefined|
| **startDate** | [**string**] | 정산 예정일 조회 시작일 (yyyy-MM-dd) | (optional) defaults to undefined|
| **endDate** | [**string**] | 정산 예정일 조회 종료일 (yyyy-MM-dd) | (optional) defaults to undefined|
| **studyTitle** | [**string**] | 스터디명 검색 (부분 일치) | (optional) defaults to undefined|
| **settlementCode** | [**string**] | 정산 Code로 조회 | (optional) defaults to undefined|
| **status** | [**string**] | 정산 상태 필터 (PENDING, APPROVED, COMPLETED, CANCELED) | (optional) defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to undefined|
| **sort** | [**string**] | 정렬 기준 | (optional) defaults to undefined|


### Return type

**PageStudySettlementSummaryResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 관리자 정산 내역 목록 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

