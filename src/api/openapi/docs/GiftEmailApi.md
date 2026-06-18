# GiftEmailApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create**](#create) | **POST** /api/v5/members/me/gift-email | Gift 이메일 등록|
|[**getMyGiftEmail**](#getmygiftemail) | **GET** /api/v5/members/me/gift-email | 내 Gift 이메일 조회|

# **create**
> GiftEmailResponse create(giftEmailCreateRequest)

FRD I-01.  Screen usage: `S-클로드이메일모달` - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-클로드이메일모달.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%ED%81%B4%EB%A1%9C%EB%93%9C%EC%9D%B4%EB%A9%94%EC%9D%BC%EB%AA%A8%EB%8B%AC.png`  <img src=\"/api-docs/frd-screenmap/v0.6/S-%ED%81%B4%EB%A1%9C%EB%93%9C%EC%9D%B4%EB%A9%94%EC%9D%BC%EB%AA%A8%EB%8B%AC.png\" alt=\"S-클로드이메일모달\" width=\"720\" />  Claude Pro Gift entitlement가 있는 성공 결제자(`giftEligibleSnapshot=true`, `PaymentStatus.SUCCESS`) 또는 운영자가 Claude Pro Gift 수신 이메일을 등록합니다. 같은 이메일 재등록은 idempotent 성공으로 처리하고, 다른 이메일 재등록은 409로 거절합니다. 

### Example

```typescript
import {
    GiftEmailApi,
    Configuration,
    GiftEmailCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GiftEmailApi(configuration);

let giftEmailCreateRequest: GiftEmailCreateRequest; //

const { status, data } = await apiInstance.create(
    giftEmailCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **giftEmailCreateRequest** | **GiftEmailCreateRequest**|  | |


### Return type

**GiftEmailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 등록 성공 또는 같은 이메일 idempotent 성공 |  -  |
|**400** | email blank 또는 형식 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**409** | 이미 다른 Gift 이메일이 등록됨 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyGiftEmail**
> GiftEmailResponse getMyGiftEmail()

FRD I-02.  로그인 사용자의 Claude Pro Gift 이메일 등록 여부를 조회합니다. 조회 권한은 Claude Pro Gift entitlement가 있는 성공 결제자(`giftEligibleSnapshot=true`, `PaymentStatus.SUCCESS`) 또는 운영자에게만 열립니다. 등록된 이메일이 있으면 `isRegistered=true`와 `email`을 반환하고, 없으면 `isRegistered=false`만 반환합니다. 

### Example

```typescript
import {
    GiftEmailApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GiftEmailApi(configuration);

const { status, data } = await apiInstance.getMyGiftEmail();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GiftEmailResponse**

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

