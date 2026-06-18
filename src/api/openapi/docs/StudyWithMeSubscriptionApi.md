# StudyWithMeSubscriptionApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create1**](#create1) | **POST** /api/v5/courses/{courseId}/study-with-me/subscription | Study With Me 알림 신청|

# **create1**
> StudyWithMeSubscriptionResponse create1(studyWithMeSubscriptionCreateRequest)

FRD F-03.  Screen usage: `S-코스상세-스터디알림` - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-코스상세-스터디알림.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-%EC%8A%A4%ED%84%B0%EB%94%94%EC%95%8C%EB%A6%BC.png`  <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%BD%94%EC%8A%A4%EC%83%81%EC%84%B8-%EC%8A%A4%ED%84%B0%EB%94%94%EC%95%8C%EB%A6%BC.png\" alt=\"S-코스상세-스터디알림\" width=\"720\" />  비회원 포함 누구나 코스별 Study With Me 알림을 신청할 수 있습니다. 전화번호는 `010-XXXX-XXXX` 한 형식만 허용하며, 동일 코스 동일 번호 중복 신청은 409로 거절합니다. 로그인 사용자는 `member_id` 를 함께 저장하고, 비회원은 `member_id=null` 로 저장합니다. 

### Example

```typescript
import {
    StudyWithMeSubscriptionApi,
    Configuration,
    StudyWithMeSubscriptionCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new StudyWithMeSubscriptionApi(configuration);

let courseId: number; //알림 대상 코스 ID (default to undefined)
let studyWithMeSubscriptionCreateRequest: StudyWithMeSubscriptionCreateRequest; //

const { status, data } = await apiInstance.create1(
    courseId,
    studyWithMeSubscriptionCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyWithMeSubscriptionCreateRequest** | **StudyWithMeSubscriptionCreateRequest**|  | |
| **courseId** | [**number**] | 알림 대상 코스 ID | defaults to undefined|


### Return type

**StudyWithMeSubscriptionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 신청 성공 |  -  |
|**400** | phone 형식 오류 또는 agreed&#x3D;false |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | 동일 코스 동일 번호 중복 신청 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

