# GroupStudyNoticeApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createNotice**](#createnotice) | **POST** /api/v1/group-studies/{groupStudyId}/notice | 그룹스터디 공지 등록|
|[**getNotice**](#getnotice) | **GET** /api/v1/group-studies/{groupStudyId}/notice | 그룹스터디 공지 조회|
|[**updateNotice**](#updatenotice) | **PUT** /api/v1/group-studies/{groupStudyId}/notice | 그룹스터디 공지 수정|

# **createNotice**
> GroupStudyNoticeResponse createNotice(groupStudyNoticeRequest)

스터디 리더가 특정 그룹스터디의 공지를 등록합니다.

### Example

```typescript
import {
    GroupStudyNoticeApi,
    Configuration,
    GroupStudyNoticeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyNoticeApi(configuration);

let groupStudyId: number; // (default to undefined)
let groupStudyNoticeRequest: GroupStudyNoticeRequest; //

const { status, data } = await apiInstance.createNotice(
    groupStudyId,
    groupStudyNoticeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyNoticeRequest** | **GroupStudyNoticeRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**GroupStudyNoticeResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 공지 등록 성공 |  -  |
|**403** | 리더가 아니거나 종료된 스터디일 때 |  -  |
|**409** | 공지가 이미 존재할 때 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getNotice**
> GroupStudyNoticeResponse getNotice()

특정 그룹스터디의 공지를 조회합니다.

### Example

```typescript
import {
    GroupStudyNoticeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyNoticeApi(configuration);

let groupStudyId: number; // (default to undefined)

const { status, data } = await apiInstance.getNotice(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**GroupStudyNoticeResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 공지 조회 성공 |  -  |
|**404** | 공지 없음 또는 스터디 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateNotice**
> GroupStudyNoticeResponse updateNotice(groupStudyNoticeRequest)

특정 그룹스터디의 공지를 수정합니다.

### Example

```typescript
import {
    GroupStudyNoticeApi,
    Configuration,
    GroupStudyNoticeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyNoticeApi(configuration);

let groupStudyId: number; // (default to undefined)
let groupStudyNoticeRequest: GroupStudyNoticeRequest; //

const { status, data } = await apiInstance.updateNotice(
    groupStudyId,
    groupStudyNoticeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyNoticeRequest** | **GroupStudyNoticeRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**GroupStudyNoticeResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 공지 수정 성공 |  -  |
|**403** | 리더가 아니거나 또는 종료된 스터디일 때 |  -  |
|**404** | 공지 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

