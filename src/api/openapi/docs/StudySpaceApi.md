# StudySpaceApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createStudySpace**](#createstudyspace) | **POST** /api/v1/study/week | 스터디 공간 수동 생성 (관리자용)|
|[**deleteStudySpace**](#deletestudyspace) | **DELETE** /api/v1/study/week/{studySpaceId} | 금주 스터디 취소|
|[**getStudySpace**](#getstudyspace) | **GET** /api/v1/study/week/{studySpaceId} | [관리자] 스터디 공간 상세 조회|
|[**getStudySpaces**](#getstudyspaces) | **GET** /api/v1/study/week | [관리자] 스터디 공간 전체 조회|
|[**getWeekStudySpace**](#getweekstudyspace) | **GET** /api/v1/study/week/participation | 사용자의 특정 주차 스터디 참여 유무 조회|
|[**updateStudySpace**](#updatestudyspace) | **PUT** /api/v1/study/week/{studySpaceId} | 스터디 공간 업데이트|

# **createStudySpace**
> StringResponseSchema createStudySpace(createStudySpaceRequest)

자동 매칭 실패 등 예외적인 상황에서 관리자가 수동으로 스터디 공간을 생성합니다. 스터디 공간 생성 후, 해당 주간의 DailyStudy 일정이 자동으로 생성됩니다. **관리자 권한(ROLE_ADMIN)이 필요합니다.** 

### Example

```typescript
import {
    StudySpaceApi,
    Configuration,
    CreateStudySpaceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

let createStudySpaceRequest: CreateStudySpaceRequest; //

const { status, data } = await apiInstance.createStudySpace(
    createStudySpaceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createStudySpaceRequest** | **CreateStudySpaceRequest**|  | |


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 스터디 공간 및 주간 스터디 일정 생성 성공 |  -  |
|**400** | 잘못된 요청 데이터 |  -  |
|**403** | 권한 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteStudySpace**
> StringResponseSchema deleteStudySpace()

금주에 진행 예정인 스터디를 취소합니다. - 취소 시 관련 패널티나 보상 정책은 추후 도입될 수 있습니다. - **본인이 참여하는 스터디만 취소 가능합니다.** 

### Example

```typescript
import {
    StudySpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

let studySpaceId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteStudySpace(
    studySpaceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studySpaceId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스터디 취소 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 스터디 공간을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStudySpace**
> GetStudySpaceResponseSchema getStudySpace()

금주에 진행되는 스터디중 하나를 상세적으로 조회하는 API / 현재 MVP 미반영으로 추후에 필요할 경우를 대비하여 미리 설계

### Example

```typescript
import {
    StudySpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

let studySpaceId: number; // (default to undefined)

const { status, data } = await apiInstance.getStudySpace(
    studySpaceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studySpaceId** | [**number**] |  | defaults to undefined|


### Return type

**GetStudySpaceResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStudySpaces**
> GetStudySpacesResponseSchema getStudySpaces()

금주에 진행되는 스터디를 전체적으로 조회하는 API / 현재 MVP 미반영으로 추후에 필요할 경우를 대비하여 미리 설계

### Example

```typescript
import {
    StudySpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

const { status, data } = await apiInstance.getStudySpaces();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetStudySpacesResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getWeekStudySpace**
> StudySpaceIsParticipateResponseSchema getWeekStudySpace()

사용자가 특정 날짜가 포함된 주차에 스터디에 참여하고 있는지 유무를 조회하는 API  **Request:** - `studyDate`: 조회할 날짜 (형식: YYYY-MM-DD)  **Response:** - `isParticipate`: 해당 주차 스터디 참여 여부 (true/false) 

### Example

```typescript
import {
    StudySpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

let studyDate: string; // (default to undefined)

const { status, data } = await apiInstance.getWeekStudySpace(
    studyDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyDate** | [**string**] |  | defaults to undefined|


### Return type

**StudySpaceIsParticipateResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 날짜 형식 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateStudySpace**
> StringResponseSchema updateStudySpace(updateStudySpaceRequest)

한 주 동안 진행되는 스터디의 정보를 변경합니다. - 스터디 주제, 설명, 계획 시간 등을 변경할 수 있습니다. - **본인이 참여하는 스터디만 수정 가능합니다.** (서버에서 권한 확인) 

### Example

```typescript
import {
    StudySpaceApi,
    Configuration,
    UpdateStudySpaceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new StudySpaceApi(configuration);

let studySpaceId: number; // (default to undefined)
let updateStudySpaceRequest: UpdateStudySpaceRequest; //

const { status, data } = await apiInstance.updateStudySpace(
    studySpaceId,
    updateStudySpaceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateStudySpaceRequest** | **UpdateStudySpaceRequest**|  | |
| **studySpaceId** | [**number**] |  | defaults to undefined|


### Return type

**StringResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스터디 정보 변경 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 스터디 공간을 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

