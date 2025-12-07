# StudyDashboardApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getStudyDashBoard**](#getstudydashboard) | **GET** /api/v1/study/dashboard | 개인 스터디 관련 통계 조회|

# **getStudyDashBoard**
> GetStudyDashboardResponseSchema getStudyDashBoard()

개인 스터디 관련 통계를 조회 하는 API

### Example

```typescript
import {
    StudyDashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyDashboardApi(configuration);

const { status, data } = await apiInstance.getStudyDashBoard();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetStudyDashboardResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 나의 티어, 나의 경험치, 월간 출석률, 주간 출석률, 구체적인 기술에 대한 공부 횟수(Java, Spring), 통합 기술에 대한 공부 횟수(BE, FE, CS) |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

