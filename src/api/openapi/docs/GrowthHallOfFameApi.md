# GrowthHallOfFameApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getHallOfFame**](#gethalloffame) | **GET** /api/v1/hall-of-fame | 명예의 전당 통합 조회|
|[**getMVPTeam**](#getmvpteam) | **GET** /api/v1/hall-of-fame/mvp-team | 저번 주 스터디 MVP 팀 조회|
|[**getRankings**](#getrankings) | **GET** /api/v1/hall-of-fame/rankings | 명예의 전당 랭킹 조회|
|[**getSharedLinks**](#getsharedlinks) | **GET** /api/v1/hall-of-fame/shared-links | 이번 주 공유한 자료 조회|

# **getHallOfFame**
> HallOfFameResponse getHallOfFame()

명예의 전당 페이지에 필요한 모든 데이터(랭킹, MVP 팀 등)를 한 번에 조회합니다.

### Example

```typescript
import {
    GrowthHallOfFameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameApi(configuration);

let date: string; //기준 날짜 (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.getHallOfFame(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] | 기준 날짜 (YYYY-MM-DD) | (optional) defaults to undefined|


### Return type

**HallOfFameResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMVPTeam**
> MVPTeamResponse getMVPTeam()

저번 주 최고의 스터디 메이트(MVP 팀) 정보를 조회합니다.

### Example

```typescript
import {
    GrowthHallOfFameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameApi(configuration);

let week: string; //주차 정보 (예: \"2026-W03\") (optional) (default to undefined)

const { status, data } = await apiInstance.getMVPTeam(
    week
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **week** | [**string**] | 주차 정보 (예: \&quot;2026-W03\&quot;) | (optional) defaults to undefined|


### Return type

**MVPTeamResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRankings**
> RankingResponse getRankings()

불꽃 출석왕, 열정 기록왕, 성실 온도왕 TOP 5 랭킹 정보를 조회합니다.

### Example

```typescript
import {
    GrowthHallOfFameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameApi(configuration);

let date: string; //기준 날짜 (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.getRankings(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] | 기준 날짜 (YYYY-MM-DD) | (optional) defaults to undefined|


### Return type

**RankingResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSharedLinks**
> SharedLinksResponse getSharedLinks()

이번 주 공유된 자료 목록을 조회합니다.

### Example

```typescript
import {
    GrowthHallOfFameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthHallOfFameApi(configuration);

let week: string; //주차 정보 (예: \"2026-W03\") (optional) (default to undefined)
let limit: number; //조회할 자료 수 (기본값: 5, 최대: 20) (optional) (default to 5)

const { status, data } = await apiInstance.getSharedLinks(
    week,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **week** | [**string**] | 주차 정보 (예: \&quot;2026-W03\&quot;) | (optional) defaults to undefined|
| **limit** | [**number**] | 조회할 자료 수 (기본값: 5, 최대: 20) | (optional) defaults to 5|


### Return type

**SharedLinksResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

