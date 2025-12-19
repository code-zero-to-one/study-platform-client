# SettlementUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMySettlements**](#getmysettlements) | **GET** /api/v1/mypage/settlements | |

# **getMySettlements**
> BaseResponsePageResponseDtoStudySettlementSummaryResponse getMySettlements()


### Example

```typescript
import {
    SettlementUserApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementUserApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getMySettlements(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**BaseResponsePageResponseDtoStudySettlementSummaryResponse**

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

