# GrowthHallOfFameAdminApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**runDailyRankingBatch**](#rundailyrankingbatch) | **POST** /api/v1/admin/hall-of-fame/batch/daily-ranking | 일간 랭킹 배치 수동 실행|
|[**runWeeklyMVPBatch**](#runweeklymvpbatch) | **POST** /api/v1/admin/hall-of-fame/batch/weekly-mvp | 주간 MVP 배치 수동 실행|

# **runDailyRankingBatch**
> BaseResponseString runDailyRankingBatch()

지정된 날짜 기준으로 일간 랭킹 배치를 실행합니다. (date 미지정 시 오늘 기준으로 어제 데이터 집계)

### Example

```typescript
import {
    GrowthHallOfFameAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameAdminApi(configuration);

let date: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.runDailyRankingBatch(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseString**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **runWeeklyMVPBatch**
> BaseResponseString runWeeklyMVPBatch()

주차 시작일(월요일)을 직접 지정하여 MVP 배치를 실행합니다. weeklyPeriodIdentifier 미지정 시 최근 마감 주차(금요일 23:59 마감)의 월요일을 기준으로 실행합니다.

### Example

```typescript
import {
    GrowthHallOfFameAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameAdminApi(configuration);

let weeklyPeriodIdentifier: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.runWeeklyMVPBatch(
    weeklyPeriodIdentifier
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **weeklyPeriodIdentifier** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseString**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

