# AdminMatchingApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMatchingRequestByAdmin**](#creatematchingrequestbyadmin) | **POST** /api/v1/admin/matching/requests | 관리자 매칭 생성|
|[**deleteMatchingRequestByAdmin**](#deletematchingrequestbyadmin) | **DELETE** /api/v1/admin/matching/requests/{matchingRequestId} | 관리자 매칭 삭제|
|[**endStudyCycle**](#endstudycycle) | **POST** /api/v1/admin/matching/end-cycle | 스터디 사이클 종료|
|[**getMatchingRequest**](#getmatchingrequest) | **GET** /api/v1/admin/matching/requests/{matchingRequestId} | 관리자 매칭 상세 조회|
|[**resetWeeklyMatching**](#resetweeklymatching) | **DELETE** /api/v1/admin/matching/reset-weekly | 주차 매칭 데이터 초기화|
|[**runAutoMatchingJob**](#runautomatchingjob) | **POST** /api/v1/admin/matching/run | 자동 매칭 수동 트리거|
|[**startStudyCycle**](#startstudycycle) | **POST** /api/v1/admin/matching/start-cycle | 스터디 사이클 시작|
|[**updateMatchingRequestByAdmin**](#updatematchingrequestbyadmin) | **PATCH** /api/v1/admin/matching/requests/{matchingRequestId} | 관리자 매칭 변경/취소|

# **createMatchingRequestByAdmin**
> BaseResponseMatchingRequestResponse createMatchingRequestByAdmin(adminMatchingCreateRequest)

관리자가 수동으로 매칭 요청을 생성합니다. weeklyPeriodIdentifier는 매칭이 속할 주간을 지정하며, 해당 주간의 토요일 날짜를 사용합니다.

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration,
    AdminMatchingCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let adminMatchingCreateRequest: AdminMatchingCreateRequest; //

const { status, data } = await apiInstance.createMatchingRequestByAdmin(
    adminMatchingCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminMatchingCreateRequest** | **AdminMatchingCreateRequest**|  | |


### Return type

**BaseResponseMatchingRequestResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**201** | 매칭 생성 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMatchingRequestByAdmin**
> deleteMatchingRequestByAdmin()

관리자가 특정 매칭 요청을 논리적으로 삭제합니다.

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let matchingRequestId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteMatchingRequestByAdmin(
    matchingRequestId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **matchingRequestId** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**204** | 매칭 삭제 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endStudyCycle**
> BaseResponse endStudyCycle()

현재 진행 중인 스터디 사이클을 종료하고, 다음 스터디 참여자 모집 상태로 변경합니다. **관리자 권한(ROLE_ADMIN)이 필요합니다.**

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

const { status, data } = await apiInstance.endStudyCycle();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 스터디 사이클 종료 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMatchingRequest**
> BaseResponseMatchingRequestResponse getMatchingRequest()

관리자가 특정 매칭 요청을 조회합니다.

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let matchingRequestId: number; // (default to undefined)

const { status, data } = await apiInstance.getMatchingRequest(
    matchingRequestId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **matchingRequestId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseMatchingRequestResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 매칭 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetWeeklyMatching**
> ResetWeeklyMatchingSchema resetWeeklyMatching(resetWeeklyMatchingRequest)

특정 주차의 모든 매칭 관련 데이터를 삭제합니다. **관리자 권한(ROLE_ADMIN)이 필요합니다.**  1. 출석 (attendance) - 가장 먼저 삭제 2. 데일리 스터디 (daily_study) 3. 스터디 멤버 (study_member) 4. 매칭 요청 파트너 결과 (matching_request_partner) 5. 매칭 요청 (matching_request) 6. 스터디 스페이스 (study_space) - 가장 마지막에 삭제  **주의사항:** - 트랜잭션 내에서 실행되며, 실패 시 자동 롤백됩니다 - 삭제된 데이터 건수가 응답으로 반환됩니다 - 해당 주차에 데이터가 없는 경우에도 성공으로 처리됩니다 (삭제 건수가 0) 

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration,
    ResetWeeklyMatchingRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let resetWeeklyMatchingRequest: ResetWeeklyMatchingRequest; //초기화할 주차의 식별자

const { status, data } = await apiInstance.resetWeeklyMatching(
    resetWeeklyMatchingRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetWeeklyMatchingRequest** | **ResetWeeklyMatchingRequest**| 초기화할 주차의 식별자 | |


### Return type

**ResetWeeklyMatchingSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 주차 매칭 데이터 초기화 성공 |  -  |
|**400** | 잘못된 요청 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 해당 주차 데이터 없음 |  -  |
|**500** | 서버 내부 오류 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **runAutoMatchingJob**
> BaseResponse runAutoMatchingJob(autoRunMatchingRequestDto)

자동 매칭 배치 작업을 수동으로 시작합니다. **관리자 권한(ROLE_ADMIN)이 필요합니다.**  실행하는 관리자는 Bearer 토큰으로 식별됩니다. **파라미터 동작 방식:** - `targetWeek`: \'CURRENT\' 또는 \'NEXT\'를 지정하여 각각 이번 주 또는 다음 주의 매칭을 실행합니다. (기본값: NEXT) - `adminId`: 매칭 후 홀로 남는 사용자와 매칭될 \'땜빵\' 관리자 ID입니다. **수동 실행 시에는 이 필드가 필수입니다.** - `templateType`: 사용할 매칭 템플릿을 지정합니다. STUDY(학습 우선), TIME(시간 우선), RANDOM(랜덤) 중 선택. (기본값: STUDY) - 나머지 파라미터(`matchingKValue`, `chunkSize` 등)는 선택 사항입니다.   - 값을 제공하면 해당 값으로 Job이 실행됩니다.   - 값을 제공하지 않으면, 시스템이 현재 매칭 대상자 수를 기반으로 최적의 값을 **자동으로 계산**하여 실행합니다. 

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration,
    AutoRunMatchingRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let autoRunMatchingRequestDto: AutoRunMatchingRequestDto; //자동 매칭 실행 파라미터. 값을 제공하지 않으면 시스템이 자동으로 최적의 값을 계산합니다.

const { status, data } = await apiInstance.runAutoMatchingJob(
    autoRunMatchingRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **autoRunMatchingRequestDto** | **AutoRunMatchingRequestDto**| 자동 매칭 실행 파라미터. 값을 제공하지 않으면 시스템이 자동으로 최적의 값을 계산합니다. | |


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 자동 매칭 작업 시작 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**409** | 작업 충돌 (이미 동일 파라미터 Job이 실행 중이거나 완료됨) |  -  |
|**500** | 서버 내부 오류 (Job 실행 실패 등) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **startStudyCycle**
> BaseResponse startStudyCycle()

매칭 시스템 상태를 RECRUITING에서 STUDYING으로 변경합니다. **관리자 권한(ROLE_ADMIN)이 필요합니다.**

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

const { status, data } = await apiInstance.startStudyCycle();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 스터디 사이클 시작 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMatchingRequestByAdmin**
> BaseResponseMatchingRequestResponse updateMatchingRequestByAdmin(adminMatchingUpdateRequest)

관리자가 특정 매칭 요청의 상태, 파트너 등을 변경합니다.

### Example

```typescript
import {
    AdminMatchingApi,
    Configuration,
    AdminMatchingUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminMatchingApi(configuration);

let matchingRequestId: number; // (default to undefined)
let adminMatchingUpdateRequest: AdminMatchingUpdateRequest; //

const { status, data } = await apiInstance.updateMatchingRequestByAdmin(
    matchingRequestId,
    adminMatchingUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminMatchingUpdateRequest** | **AdminMatchingUpdateRequest**|  | |
| **matchingRequestId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseMatchingRequestResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | You are authenticated but not allowed authorization |  -  |
|**200** | 매칭 변경 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

