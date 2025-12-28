# GroupStudyHomeworkApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**editHomework**](#edithomework) | **PUT** /homeworks/{homeworkId} | |
|[**submitHomework**](#submithomework) | **POST** /missions/{missionId}/homeworks | |

# **editHomework**
> BaseResponse editHomework(homeworkEditRequest)


### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration,
    HomeworkEditRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let homeworkId: number; // (default to undefined)
let homeworkEditRequest: HomeworkEditRequest; //

const { status, data } = await apiInstance.editHomework(
    homeworkId,
    homeworkEditRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkEditRequest** | **HomeworkEditRequest**|  | |
| **homeworkId** | [**number**] |  | defaults to undefined|


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

# **submitHomework**
> BaseResponse submitHomework(homeworkSubmissionRequest)


### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration,
    HomeworkSubmissionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let missionId: number; // (default to undefined)
let homeworkSubmissionRequest: HomeworkSubmissionRequest; //

const { status, data } = await apiInstance.submitHomework(
    missionId,
    homeworkSubmissionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkSubmissionRequest** | **HomeworkSubmissionRequest**|  | |
| **missionId** | [**number**] |  | defaults to undefined|


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

