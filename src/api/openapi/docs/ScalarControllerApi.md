# ScalarControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**scalar**](#scalar) | **GET** /scalar | |

# **scalar**
> string scalar()


### Example

```typescript
import {
    ScalarControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ScalarControllerApi(configuration);

const { status, data } = await apiInstance.scalar();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/html


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

