# GroupStudyHomeworkApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteHomework**](#deletehomework) | **DELETE** /api/v1/homeworks/{homeworkId} | 과제 삭제|
|[**editHomework**](#edithomework) | **PUT** /api/v1/homeworks/{homeworkId} | 과제 수정|
|[**getHomework**](#gethomework) | **GET** /api/v1/homeworks/{homeworkId} | |
|[**submitHomework**](#submithomework) | **POST** /api/v1/missions/{missionId}/homeworks | 과제 제출|

# **deleteHomework**
> NoContentResponse deleteHomework()

제출한 과제를 삭제합니다. 평가가 완료되지 않았고 미션 기간 내에만 삭제할 수 있습니다.

### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)

const { status, data } = await apiInstance.deleteHomework(
    homeworkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 과제 삭제 성공 |  -  |
|**400** | 잘못된 요청 (이미 평가됨, 제출 기간 오류 등) |  -  |
|**404** | 과제를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **editHomework**
> BaseResponse editHomework(homeworkEditRequest)

제출한 과제의 내용을 수정합니다. 평가가 완료되지 않았고 미션 기간 내에만 수정할 수 있습니다. 텍스트 내용은 최소 100자 이상이어야 합니다.

### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration,
    HomeworkEditRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)
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
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 과제 수정 성공 |  -  |
|**400** | 잘못된 요청 (이미 평가됨, 텍스트 내용 길이 부족, 제출 기간 오류 등) |  -  |
|**404** | 과제를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHomework**
> BaseResponseHomeworkResponseDto getHomework()


### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let homeworkId: number; // (default to undefined)

const { status, data } = await apiInstance.getHomework(
    homeworkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseHomeworkResponseDto**

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

# **submitHomework**
> BaseResponse submitHomework(homeworkSubmissionRequest)

특정 미션에 대한 과제를 제출합니다. 텍스트 내용은 최소 100자 이상이어야 하며, 선택적으로 링크를 포함할 수 있습니다.

### Example

```typescript
import {
    GroupStudyHomeworkApi,
    Configuration,
    HomeworkSubmissionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyHomeworkApi(configuration);

let missionId: number; //미션 ID (default to undefined)
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
| **missionId** | [**number**] | 미션 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 과제 제출 성공 |  -  |
|**400** | 잘못된 요청 (텍스트 내용 길이 부족, 제출 기간 오류 등) |  -  |
|**404** | 과제 또는 미션을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

