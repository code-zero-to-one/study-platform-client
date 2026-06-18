# AdminAlerttalkControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**dryRun**](#dryrun) | **POST** /api/v5/admin/alerttalk/schedules/dry-run | |
|[**getLogDetail**](#getlogdetail) | **GET** /api/v5/admin/alerttalk/delivery-logs/{jobId} | |
|[**getLogs**](#getlogs) | **GET** /api/v5/admin/alerttalk/delivery-logs | |
|[**getTemplates**](#gettemplates) | **GET** /api/v5/admin/alerttalk/templates | |
|[**retry**](#retry) | **POST** /api/v5/admin/alerttalk/delivery-logs/{jobId}/retry | |
|[**syncTemplates1**](#synctemplates1) | **POST** /api/v5/admin/alerttalk/templates/sync | |
|[**testSend**](#testsend) | **POST** /api/v5/admin/alerttalk/test-send | |
|[**testSendByTemplate**](#testsendbytemplate) | **POST** /api/v5/admin/alerttalk/templates/{templateKey}/test-send | |

# **dryRun**
> BaseResponseClassAlerttalkDryRunResponse dryRun(classAlerttalkDryRunRequest)


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration,
    ClassAlerttalkDryRunRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let classAlerttalkDryRunRequest: ClassAlerttalkDryRunRequest; //

const { status, data } = await apiInstance.dryRun(
    classAlerttalkDryRunRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classAlerttalkDryRunRequest** | **ClassAlerttalkDryRunRequest**|  | |


### Return type

**BaseResponseClassAlerttalkDryRunResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLogDetail**
> BaseResponseClassAlerttalkLogDetailResponse getLogDetail()


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let jobId: number; // (default to undefined)

const { status, data } = await apiInstance.getLogDetail(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseClassAlerttalkLogDetailResponse**

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

# **getLogs**
> BaseResponseListClassAlerttalkLogResponse getLogs()


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let templateKey: string; // (optional) (default to undefined)
let status: string; // (optional) (default to undefined)
let from: string; // (optional) (default to undefined)
let to: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getLogs(
    templateKey,
    status,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **templateKey** | [**string**] |  | (optional) defaults to undefined|
| **status** | [**string**] |  | (optional) defaults to undefined|
| **from** | [**string**] |  | (optional) defaults to undefined|
| **to** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseListClassAlerttalkLogResponse**

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

# **getTemplates**
> BaseResponseClassAlerttalkTemplateListResponse getTemplates()


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let templateKey: string; // (optional) (default to undefined)
let approvalStatus: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getTemplates(
    templateKey,
    approvalStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **templateKey** | [**string**] |  | (optional) defaults to undefined|
| **approvalStatus** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseClassAlerttalkTemplateListResponse**

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

# **retry**
> BaseResponseClassAlerttalkRetryResponse retry()


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration,
    ClassAlerttalkRetryRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let jobId: number; // (default to undefined)
let classAlerttalkRetryRequest: ClassAlerttalkRetryRequest; // (optional)

const { status, data } = await apiInstance.retry(
    jobId,
    classAlerttalkRetryRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classAlerttalkRetryRequest** | **ClassAlerttalkRetryRequest**|  | |
| **jobId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseClassAlerttalkRetryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **syncTemplates1**
> BaseResponseClassAlerttalkTemplateSyncResponse syncTemplates1()


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration,
    ClassAlerttalkTemplateSyncRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let classAlerttalkTemplateSyncRequest: ClassAlerttalkTemplateSyncRequest; // (optional)

const { status, data } = await apiInstance.syncTemplates1(
    classAlerttalkTemplateSyncRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classAlerttalkTemplateSyncRequest** | **ClassAlerttalkTemplateSyncRequest**|  | |


### Return type

**BaseResponseClassAlerttalkTemplateSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **testSend**
> BaseResponseClassAlerttalkTestSendResponse testSend(classAlerttalkTestSendRequest)


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration,
    ClassAlerttalkTestSendRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let classAlerttalkTestSendRequest: ClassAlerttalkTestSendRequest; //

const { status, data } = await apiInstance.testSend(
    classAlerttalkTestSendRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classAlerttalkTestSendRequest** | **ClassAlerttalkTestSendRequest**|  | |


### Return type

**BaseResponseClassAlerttalkTestSendResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **testSendByTemplate**
> BaseResponseClassAlerttalkTestSendResponse testSendByTemplate(classAlerttalkTemplateTestSendRequest)


### Example

```typescript
import {
    AdminAlerttalkControllerApi,
    Configuration,
    ClassAlerttalkTemplateTestSendRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAlerttalkControllerApi(configuration);

let templateKey: string; // (default to undefined)
let classAlerttalkTemplateTestSendRequest: ClassAlerttalkTemplateTestSendRequest; //

const { status, data } = await apiInstance.testSendByTemplate(
    templateKey,
    classAlerttalkTemplateTestSendRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classAlerttalkTemplateTestSendRequest** | **ClassAlerttalkTemplateTestSendRequest**|  | |
| **templateKey** | [**string**] |  | defaults to undefined|


### Return type

**BaseResponseClassAlerttalkTestSendResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

