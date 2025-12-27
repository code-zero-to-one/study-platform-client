# SettlementUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMySettlements**](#getmysettlements) | **GET** /api/v1/mypage/settlements | 마이페이지 정산 내역 조회 (리더)|

# **getMySettlements**
> PageStudySettlementSummaryResponseSchema getMySettlements()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 사용자가 **리더로 참여한 유료 스터디의 정산 내역**을 페이징 형태로 조회합니다. - 정산 예정일(`scheduledAt`) 기준으로 정렬하여 보여주는 것을 권장합니다. - 각 정산 건은 스터디 단위로 생성되며, 상태값에 따라 아래와 같이 해석할 수 있습니다.   - `PENDING`   : 정산 예정(검증 전)   - `APPROVED` : 정산 승인(지급 대기)   - `COMPLETED`: 정산 완료(지급 완료)   - `CANCELED` : 정산 취소  ---  ## Query Parameters (Filter - SettlementSearchCondition)  | **키**        | **타입**   | **위치** | **설명**                                   | **필수 여부** | **예시**         | |--------------|-----------|---------|-------------------------------------------|--------------|------------------| | startDate    | LocalDate | query   | 정산 예정일 조회 시작일 (yyyy-MM-dd)        | N            | 2025-01-01       | | endDate      | LocalDate | query   | 정산 예정일 조회 종료일 (yyyy-MM-dd)        | N            | 2025-12-31       | | studyTitle   | string    | query   | 스터디명 검색 (부분 일치)                   | N            | 백엔드           | | settlementId | number    | query   | 정산 ID로 조회                             | N            | 123              | | status       | string    | query   | 정산 상태 (PENDING, APPROVED, COMPLETED 등) | N            | PENDING          |  ## Query Parameters (Pageable)  | **키**  | **타입** | **위치** | **설명**                          | **필수 여부** | **예시**             | |--------|---------|---------|------------------------------------|--------------|----------------------| | page   | number  | query   | 조회할 페이지 (0부터 시작)           | N            | 0                    | | size   | number  | query   | 페이지당 데이터 개수                 | N            | 10                   | | sort   | string  | query   | 정렬 기준 필드명, `scheduledAt` 기준 권장 | N       | scheduledAt,desc     |  ---  ## Response (PageResponseDto<StudySettlementSummaryResponse>)  ### PageResponseDto  | **키**         | **타입**          | **설명**                    | |---------------|------------------|----------------------------| | content       | array           | 정산 요약 정보 리스트         | | page          | number          | 현재 페이지(1부터 시작)       | | size          | number          | 페이지 크기                   | | totalElements | number          | 전체 데이터 개수              |  ### StudySettlementSummaryResponse  | **키**            | **타입**   | **설명**                      | |------------------|-----------|-------------------------------| | settlementId     | number    | 정산 ID                       | | settlementCode   | string    | 정산 코드                     | | groupStudyId     | number    | 그룹스터디 ID                 | | groupStudyTitle  | string    | 그룹스터디 제목               | | totalSalesAmount | number    | 총 판매 금액(원)              | | totalRefundAmount| number    | 총 환불 금액(원)              | | settlementAmount | number    | 정산 금액(리더에게 지급 예정/완료 금액) | | status           | string    | 정산 상태                     | | scheduledAt      | datetime  | 정산 예정 일시                | | settledAt        | datetime  | 실제 정산 완료 일시(없으면 null) | 

### Example

```typescript
import {
    SettlementUserApi,
    Configuration,
    SettlementSearchCondition,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementUserApi(configuration);

let condition: SettlementSearchCondition; // (default to undefined)
let pageable: Pageable; // (default to undefined)
let startDate: string; //정산 예정일 조회 시작일 (yyyy-MM-dd) (optional) (default to undefined)
let endDate: string; //정산 예정일 조회 종료일 (yyyy-MM-dd) (optional) (default to undefined)
let studyTitle: string; //스터디명 검색 (부분 일치) (optional) (default to undefined)
let settlementCode: number; //정산 Code로 조회 (optional) (default to undefined)
let status: string; //정산 상태 필터 (PENDING, APPROVED, COMPLETED, CANCELED) (optional) (default to undefined)
let page: number; //조회할 페이지 (0부터 시작) (optional) (default to undefined)
let size: number; //페이지당 데이터 개수 (optional) (default to undefined)
let sort: string; //정렬 기준 (예: scheduledAt,desc) (optional) (default to undefined)

const { status, data } = await apiInstance.getMySettlements(
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
| **settlementCode** | [**number**] | 정산 Code로 조회 | (optional) defaults to undefined|
| **status** | [**string**] | 정산 상태 필터 (PENDING, APPROVED, COMPLETED, CANCELED) | (optional) defaults to undefined|
| **page** | [**number**] | 조회할 페이지 (0부터 시작) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지당 데이터 개수 | (optional) defaults to undefined|
| **sort** | [**string**] | 정렬 기준 (예: scheduledAt,desc) | (optional) defaults to undefined|


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
|**200** | 마이페이지 정산 내역 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

