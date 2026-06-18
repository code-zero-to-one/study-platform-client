# DeveloperApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyDeveloperRegistration**](#getmydeveloperregistration) | **GET** /api/v1/developers/me | 내 개발자 등록 상태 조회|
|[**updateMyDeveloperRegistration**](#updatemydeveloperregistration) | **PUT** /api/v1/developers/me/registration | 내 개발자 등록 상태 변경|

# **getMyDeveloperRegistration**
> BaseResponseMyDeveloperRegistrationResponseDto getMyDeveloperRegistration()


### Example

```typescript
import {
    DeveloperApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeveloperApi(configuration);

const { status, data } = await apiInstance.getMyDeveloperRegistration();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponseMyDeveloperRegistrationResponseDto**

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

# **updateMyDeveloperRegistration**
> BaseResponseMyDeveloperRegistrationResponseDto updateMyDeveloperRegistration(developerRegistrationUpdateRequest)

registered=true면 등록, false면 등록 해제합니다.

### Example

```typescript
import {
    DeveloperApi,
    Configuration,
    DeveloperRegistrationUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DeveloperApi(configuration);

let developerRegistrationUpdateRequest: DeveloperRegistrationUpdateRequest; //

const { status, data } = await apiInstance.updateMyDeveloperRegistration(
    developerRegistrationUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **developerRegistrationUpdateRequest** | **DeveloperRegistrationUpdateRequest**|  | |


### Return type

**BaseResponseMyDeveloperRegistrationResponseDto**

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

