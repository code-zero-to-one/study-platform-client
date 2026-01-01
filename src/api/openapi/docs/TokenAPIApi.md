# TokenAPIApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**generateToken**](#generatetoken) | **GET** /api/v1/tokens/token | |

# **generateToken**
> BaseResponseTemporalToken generateToken()


### Example

```typescript
import {
    TokenAPIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenAPIApi(configuration);

let memberId: number; // (default to undefined)
let roleId: string; // (default to undefined)

const { status, data } = await apiInstance.generateToken(
    memberId,
    roleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] |  | defaults to undefined|
| **roleId** | [**string**] |  | defaults to undefined|


### Return type

**BaseResponseTemporalToken**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

