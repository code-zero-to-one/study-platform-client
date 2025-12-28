# FileControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**uploadProfileImage**](#uploadprofileimage) | **PUT** /api/v1/files/{filePath} | |

# **uploadProfileImage**
> BaseResponse uploadProfileImage()


### Example

```typescript
import {
    FileControllerApi,
    Configuration,
    UploadProfileImageRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileControllerApi(configuration);

let filePath: string; // (default to undefined)
let fileClassification: string; // (default to undefined)
let uploadProfileImageRequest: UploadProfileImageRequest; // (optional)

const { status, data } = await apiInstance.uploadProfileImage(
    filePath,
    fileClassification,
    uploadProfileImageRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadProfileImageRequest** | **UploadProfileImageRequest**|  | |
| **filePath** | [**string**] |  | defaults to undefined|
| **fileClassification** | [**string**] |  | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

