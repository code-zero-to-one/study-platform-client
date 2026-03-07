# DailyStudyApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**completeDailyStudy**](#completedailystudy) | **POST** /api/v1/study/daily/{dailyStudyId}/complete | 면접 완료 및 회고 작성|
|[**deleteDailyStudy**](#deletedailystudy) | **DELETE** /api/v1/study/daily/{dailyStudyId} | 스터디 삭제|
|[**getDailyStudies**](#getdailystudies) | **GET** /api/v1/study/daily | 특정 날짜의 스터디 전체 조회 (커서 기반)|
|[**getMyDailyStudyByDate**](#getmydailystudybydate) | **GET** /api/v1/study/daily/mine/{studyDate} | 특정 날짜의 내 스터디 조회|
|[**getMyDailyStudyCalender**](#getmydailystudycalender) | **GET** /api/v1/study/daily/month | 월별 스터디 캘린더 조회|
|[**prepareDailyStudy**](#preparedailystudy) | **PUT** /api/v1/study/daily/{dailyId}/prepare | 면접 준비 시작|

# **completeDailyStudy**
> StringResponseSchema completeDailyStudy(completeDailyStudyRequestSchema)

면접 완료 후 회고를 작성합니다.  [Request] - PathVariable: dailyStudyId (면접 완료할 스터디 ID) - RequestBody: feedback (회고 내용), progressStatus (스터디 상태) - 인증 토큰 필요 (Bearer)  [Response] - BaseResponse<String>: 성공 메시지 반환  **사용 방법:** 1. 먼저 `GET /api/v1/study/daily/mine/{studyDate}` API를 호출하여 스터디 정보를 조회합니다. 2. 응답에서 `dailyStudyId`를 확인합니다. 3. 해당 `dailyStudyId`를 이 API의 경로 파라미터로 사용합니다.

### Example

```typescript
import {
    DailyStudyApi,
    Configuration,
    CompleteDailyStudyRequestSchema
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let dailyStudyId: number; // (default to undefined)
let completeDailyStudyRequestSchema: CompleteDailyStudyRequestSchema; //면접 완료 및 회고 작성 정보

const { status, data } = await apiInstance.completeDailyStudy(
    dailyStudyId,
    completeDailyStudyRequestSchema
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **completeDailyStudyRequestSchema** | **CompleteDailyStudyRequestSchema**| 면접 완료 및 회고 작성 정보 | |
| **dailyStudyId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 면접 완료 및 회고 작성 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 스터디를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDailyStudy**
> deleteDailyStudy()

본인이 작성한 스터디를 삭제합니다. (Soft delete)  [Request] - PathVariable: dailyStudyId (삭제할 스터디 ID) - 인증 토큰 필요 (Bearer)  [Response] - 204 No Content: 성공 시 본문 없음  **사용 방법:** 1. 먼저 `GET /api/v1/study/daily/mine/{date}` API를 호출하여 스터디 정보를 조회합니다. 2. 응답에서 `dailyStudyId`를 확인합니다. 3. 해당 `dailyStudyId`를 이 API의 경로 파라미터로 사용합니다.

### Example

```typescript
import {
    DailyStudyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let dailyStudyId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDailyStudy(
    dailyStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dailyStudyId** | [**number**] |  | defaults to undefined|


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
|**204** | 스터디 삭제 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 스터디를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDailyStudies**
> GetDailyStudiesResponseSchema getDailyStudies()

지정한 날짜의 모든 공개 스터디 목록을 커서 기반 페이지네이션으로 조회합니다.  [동작 방식] - 평일(월~금) 요청 시: 해당 날짜의 스터디 목록을 반환합니다. - 주말(토,일) 요청 시: 다음 주 월요일부터 금요일까지의 모든 스터디 목록을 한 번에 반환합니다.  [Request] - QueryParam: studyDate (YYYY-MM-DD 형식, 생략 시 오늘) - QueryParam: cursor (다음 페이지 요청용) - QueryParam: pageSize (기본 20) [Response] - CursorResponseDto<DailyStudyResponse>: items(스터디 목록), nextCursor, hasNext 등 포함 

### Example

```typescript
import {
    DailyStudyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let cursor: number; //다음 페이지 조회를 위한 마지막 스터디 ID (첫 페이지는 null 또는 생략) (optional) (default to undefined)
let pageSize: number; //한 페이지에 보여줄 항목 수 (optional) (default to 20)
let studyDate: string; //조회할 날짜 (지정하지 않으면 오늘 날짜) (optional) (default to undefined)

const { status, data } = await apiInstance.getDailyStudies(
    cursor,
    pageSize,
    studyDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cursor** | [**number**] | 다음 페이지 조회를 위한 마지막 스터디 ID (첫 페이지는 null 또는 생략) | (optional) defaults to undefined|
| **pageSize** | [**number**] | 한 페이지에 보여줄 항목 수 | (optional) defaults to 20|
| **studyDate** | [**string**] | 조회할 날짜 (지정하지 않으면 오늘 날짜) | (optional) defaults to undefined|


### Return type

**GetDailyStudiesResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스터디 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyDailyStudyByDate**
> GetTodayMyDailyStudyResponseSchema getMyDailyStudyByDate()

인증된 사용자의 특정 날짜 스터디 정보를 상세 조회합니다.  [Request] - PathVariable: studyDate (YYYY-MM-DD 형식) - 인증 토큰 필요 (Bearer)  [Response] - TodayStudyDataResponse: dailyStudyId, interviewerId, interviewerName(닉네임), interviewerRealName(실명), intervieweeRealName(실명), ... 등 상세 정보 포함 

### Example

```typescript
import {
    DailyStudyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let studyDate: string; // (default to undefined)

const { status, data } = await apiInstance.getMyDailyStudyByDate(
    studyDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyDate** | [**string**] |  | defaults to undefined|


### Return type

**GetTodayMyDailyStudyResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스터디 상세 조회 성공 |  -  |
|**404** | 해당 날짜의 스터디를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyDailyStudyCalender**
> GetMyDailyStudyCalenderResponseSchema getMyDailyStudyCalender()

사용자의 월별 스터디 현황을 캘린더 형태로 조회합니다.  [Request] - QueryParam: year (조회할 연도, 예: 2024) - QueryParam: month (조회할 월, 예: 7) - 인증 토큰 필요 (Bearer)  [Response] - calendar: 달력의 각 날짜별 상태 배열 (각 요소는 day, hasStudy, status 필드 포함)   - day: 날짜(일)   - hasStudy: 해당 날짜에 스터디가 존재하는지 여부 (true/false)   - status: 스터디 상태 (COMPLETE, PENDING 등). hasStudy가 false면 null - monthlyCompletedCount: 이번 달 완료(Complete)한 일수 - totalCompletedCount: 해당 유저의 전체 기간 완료(Complete) 출석 수(누적)

### Example

```typescript
import {
    DailyStudyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let year: number; //조회할 연도 (4자리). 생략 시 현재 연도를 사용합니다. (optional) (default to undefined)
let month: number; //조회할 월 (1-12). 생략 시 현재 월을 사용합니다. (optional) (default to undefined)

const { status, data } = await apiInstance.getMyDailyStudyCalender(
    year,
    month
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **year** | [**number**] | 조회할 연도 (4자리). 생략 시 현재 연도를 사용합니다. | (optional) defaults to undefined|
| **month** | [**number**] | 조회할 월 (1-12). 생략 시 현재 월을 사용합니다. | (optional) defaults to undefined|


### Return type

**GetMyDailyStudyCalenderResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 캘린더 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **prepareDailyStudy**
> StringResponseSchema prepareDailyStudy(prepareDailyStudyRequestSchema)

특정 ID의 스터디 진행 상태를 \'IN_PROGRESS\'로 변경하여 면접 준비를 시작합니다.  [Request] - PathVariable: dailyId (준비 시작할 스터디 ID) - 인증 토큰 필요 (Bearer)  [Response] - BaseResponse<String>: 성공 메시지 반환 

### Example

```typescript
import {
    DailyStudyApi,
    Configuration,
    PrepareDailyStudyRequestSchema
} from './api';

const configuration = new Configuration();
const apiInstance = new DailyStudyApi(configuration);

let dailyId: number; // (default to undefined)
let prepareDailyStudyRequestSchema: PrepareDailyStudyRequestSchema; //면접 준비에 필요한 주제와 참고 링크

const { status, data } = await apiInstance.prepareDailyStudy(
    dailyId,
    prepareDailyStudyRequestSchema
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **prepareDailyStudyRequestSchema** | **PrepareDailyStudyRequestSchema**| 면접 준비에 필요한 주제와 참고 링크 | |
| **dailyId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 면접 준비 시작 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 스터디를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

