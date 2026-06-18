# MyClassWithdrawalApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**withdraw**](#withdraw) | **DELETE** /api/v6/mypage/class/withdraw | 클래스 탈퇴|

# **withdraw**
> MyClassWithdrawalResponse withdraw(myClassWithdrawalRequest)

FRD B-21.  `S-클래스탈퇴`의 최종 탈퇴 CTA를 처리하고 class withdrawal audit를 저장합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스탈퇴.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%83%88%ED%87%B4.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%ED%83%88%ED%87%B4.png\" alt=\"S-클래스탈퇴\" width=\"720\" /> 

### Example

```typescript
import {
    MyClassWithdrawalApi,
    Configuration,
    MyClassWithdrawalRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MyClassWithdrawalApi(configuration);

let myClassWithdrawalRequest: MyClassWithdrawalRequest; //

const { status, data } = await apiInstance.withdraw(
    myClassWithdrawalRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **myClassWithdrawalRequest** | **MyClassWithdrawalRequest**|  | |


### Return type

**MyClassWithdrawalResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 클래스 탈퇴 성공 |  -  |
|**400** | 탈퇴 동의 누락 |  -  |
|**409** | 이미 탈퇴했거나 탈퇴 가능한 클래스 참여가 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

