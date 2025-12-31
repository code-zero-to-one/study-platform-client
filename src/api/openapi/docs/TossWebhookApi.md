# TossWebhookApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**handleTossWebhook**](#handletosswebhook) | **POST** /api/v1/webhooks/toss | Toss Webhook 수신|

# **handleTossWebhook**
> BaseResponseVoid handleTossWebhook(tossWebhookPayload)

Toss Payments에서 발생한 이벤트를 수신합니다. secret 값으로 검증합니다.

### Example

```typescript
import {
    TossWebhookApi,
    Configuration,
    TossWebhookPayload
} from './api';

const configuration = new Configuration();
const apiInstance = new TossWebhookApi(configuration);

let tossWebhookPayload: TossWebhookPayload; //

const { status, data } = await apiInstance.handleTossWebhook(
    tossWebhookPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tossWebhookPayload** | **TossWebhookPayload**|  | |


### Return type

**BaseResponseVoid**

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

