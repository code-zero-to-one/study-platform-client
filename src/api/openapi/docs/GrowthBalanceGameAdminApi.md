# GrowthBalanceGameAdminApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**runVoteCountSyncBatch**](#runvotecountsyncbatch) | **POST** /api/v1/admin/balance-games/batch/vote-count-sync | 투표 수 정합성 검증 배치 수동 실행|

# **runVoteCountSyncBatch**
> BalanceGameBatchResponse runVoteCountSyncBatch()

밸런스 게임 투표 수 정합성 검증 배치를 수동으로 실행합니다. 옵션별 투표 수와 게임별 전체 투표 수를 실제 투표 데이터와 비교하여 불일치 시 자동으로 수정합니다.

### Example

```typescript
import {
    GrowthBalanceGameAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameAdminApi(configuration);

const { status, data } = await apiInstance.runVoteCountSyncBatch();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BalanceGameBatchResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 배치 실행 성공 |  -  |
|**500** | 배치 실행 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

