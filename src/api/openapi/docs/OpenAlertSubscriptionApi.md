# OpenAlertSubscriptionApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create4**](#create4) | **POST** /api/v5/courses/{courseId}/alert-subscription | 오픈 알림 신청|

# **create4**
> OpenAlertSubscriptionResponse create4(openAlertSubscriptionCreateRequest)

FRD G-01.  Screen usage: `S-코스목록-알림모달` - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스목록-알림모달.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EB%AA%A9%EB%A1%9D-%EC%95%8C%EB%A6%BC%EB%AA%A8%EB%8B%AC.png`  <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EB%AA%A9%EB%A1%9D-%EC%95%8C%EB%A6%BC%EB%AA%A8%EB%8B%AC.png\" alt=\"S-코스목록-알림모달\" width=\"720\" />  Coming Soon 상태 코스에 대해 이메일 기반 오픈 알림 신청을 생성합니다. 비회원 포함 누구나 호출할 수 있으며, 동일 `courseId + email` 중복 신청은 409로 거절합니다. 

### Example

```typescript
import {
    OpenAlertSubscriptionApi,
    Configuration,
    OpenAlertSubscriptionCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OpenAlertSubscriptionApi(configuration);

let courseId: number; //Coming Soon 코스 ID (default to undefined)
let openAlertSubscriptionCreateRequest: OpenAlertSubscriptionCreateRequest; //

const { status, data } = await apiInstance.create4(
    courseId,
    openAlertSubscriptionCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **openAlertSubscriptionCreateRequest** | **OpenAlertSubscriptionCreateRequest**|  | |
| **courseId** | [**number**] | Coming Soon 코스 ID | defaults to undefined|


### Return type

**OpenAlertSubscriptionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 신청 성공 |  -  |
|**400** | email blank / 형식 오류 / agreed&#x3D;false |  -  |
|**404** | Coming Soon 코스를 찾을 수 없음 |  -  |
|**409** | 동일 이메일 중복 신청 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

