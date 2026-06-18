# NotificationSettingApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMySetting**](#getmysetting) | **GET** /api/v5/members/me/notification-setting | 내 알림톡 수신 시간 조회|
|[**updateMySetting**](#updatemysetting) | **PUT** /api/v5/members/me/notification-setting | 내 알림톡 수신 시간 수정|

# **getMySetting**
> NotificationSettingResponseSchema getMySetting()

FRD C-01 / B-02 alias.  로그인 사용자의 현재 알림톡 수신 시간을 조회합니다. 설정이 없으면 기본값 19:00을 반환합니다. v1.0 consumer screen은 `S-마이클래스`이며 notification canonical contract를 재사용합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png\" alt=\"S-마이클래스\" width=\"720\" /> 

### Example

```typescript
import {
    NotificationSettingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationSettingApi(configuration);

const { status, data } = await apiInstance.getMySetting();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**NotificationSettingResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMySetting**
> NotificationSettingResponseSchema updateMySetting(notificationSettingUpdateRequest)

FRD C-02 / B-03 alias.  로그인 사용자의 알림톡 수신 시간을 수정합니다. 기존 row가 없으면 생성하고, 있으면 같은 row를 갱신합니다. v1.0 consumer screen은 `S-마이클래스`이며 notification canonical contract를 재사용합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png\" alt=\"S-마이클래스\" width=\"720\" /> 

### Example

```typescript
import {
    NotificationSettingApi,
    Configuration,
    NotificationSettingUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationSettingApi(configuration);

let notificationSettingUpdateRequest: NotificationSettingUpdateRequest; //

const { status, data } = await apiInstance.updateMySetting(
    notificationSettingUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **notificationSettingUpdateRequest** | **NotificationSettingUpdateRequest**|  | |


### Return type

**NotificationSettingResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | hour/minute 범위 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

