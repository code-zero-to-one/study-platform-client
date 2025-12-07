# DocumentedErrorCodeControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**downloadMarkdown**](#downloadmarkdown) | **GET** /error-code/download-markdown | |
|[**getDocumentation**](#getdocumentation) | **GET** /error-code | |

# **downloadMarkdown**
> string downloadMarkdown()


### Example

```typescript
import {
    DocumentedErrorCodeControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentedErrorCodeControllerApi(configuration);

const { status, data } = await apiInstance.downloadMarkdown();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

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

# **getDocumentation**
> { [key: string]: object | undefined; } getDocumentation()


### Example

```typescript
import {
    DocumentedErrorCodeControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentedErrorCodeControllerApi(configuration);

const { status, data } = await apiInstance.getDocumentation();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: object | undefined; }**

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

