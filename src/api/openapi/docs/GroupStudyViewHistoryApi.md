# GroupStudyViewHistoryApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**recordView**](#recordview) | **POST** /api/v1/group-studies/{groupStudyId}/views | 그룹스터디 조회 이력 기록|

# **recordView**
> recordView()

그룹스터디 조회 이력을 기록합니다. 동일 사용자가 1시간 이내에 같은 스터디를 조회한 경우 중복 기록하지 않습니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - Bearer Token이 필요합니다. 

### Example

```typescript
import {
    GroupStudyViewHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyViewHistoryApi(configuration);

let groupStudyId: number; // (default to undefined)

const { status, data } = await apiInstance.recordView(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|


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
|**201** | 조회 이력 기록 성공 |  -  |
|**204** | 조회 이력이 기록되지 않음 - 인증되지 않은 사용자 접근 -&gt; 에러 발생 X, 그러나 조회수 상승 X |  -  |
|**404** | 그룹스터디 또는 회원을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

