# TossWebhookApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**handleTossWebhook**](#handletosswebhook) | **POST** /api/v1/webhooks/toss | Toss Webhook 수신|

# **handleTossWebhook**
> handleTossWebhook(tossWebhookPayload)

작성일자: 2026-01-08  작성자: 이도현  ---  ## Description  - Toss Payments에서 결제/환불 상태 변경 시 호출되는 Webhook 엔드포인트입니다. - **인증 없이 호출**되며, `secret` 값으로 요청의 유효성을 검증합니다. - 멱등키(idempotencyKey)를 사용하여 중복 웹훅 이벤트를 방지합니다.  ---  ## 지원 이벤트 타입  | 이벤트 타입              | 설명                           | |--------------------------|--------------------------------| | PAYMENT_STATUS_CHANGED   | 결제 상태 변경 (입금 완료 등)   |  ---  ## 가상계좌 입금 완료 처리  - 가상계좌 결제 시 `WAITING_FOR_DEPOSIT` 상태로 대기합니다. - 사용자가 입금을 완료하면 Toss에서 `PAYMENT_STATUS_CHANGED` 이벤트를 전송합니다. - Webhook 수신 시 `status: \"DONE\"`이면 결제 상태를 `SUCCESS`로 변경합니다. - 입금 기한 만료 시 `status: \"EXPIRED\"`로 전송되며, 결제 상태를 `FAILED`로 변경합니다.  ---  ## 상태 전이 규칙  | 현재 상태             | 전이 가능한 상태                                   | |-----------------------|---------------------------------------------------| | REQUESTED             | SUCCESS, WAITING_FOR_DEPOSIT, CANCELED, FAILED    | | PENDING               | SUCCESS, WAITING_FOR_DEPOSIT, CANCELED, FAILED    | | WAITING_FOR_DEPOSIT   | SUCCESS, CANCELED, FAILED (입금완료/취소/만료)     | | SUCCESS               | CANCELED (환불 시)                                | | CANCELED              | (종료 상태)                                        | | FAILED                | (종료 상태)                                        |  ---  ## Request Body (TossWebhookPayload)  | 키        | 타입     | 설명                                   | |-----------|----------|----------------------------------------| | eventType | string   | 이벤트 타입 (PAYMENT_STATUS_CHANGED)    | | createdAt | datetime | 이벤트 발생 시각 (ISO 8601)             | | data      | object   | 결제 정보                              |  ### data (PaymentData)  | 키           | 타입   | 설명                                      | |--------------|--------|-------------------------------------------| | paymentKey   | string | Toss 결제 키                              | | orderId      | string | 주문 ID                                   | | status       | string | 결제 상태 (DONE, EXPIRED, CANCELED 등)   | | method       | string | 결제 수단                                 | | totalAmount  | number | 총 결제 금액                              | | secret       | string | 검증용 secret                             | | cancels      | array  | 취소 정보 배열 (환불 시)                   |  ---  ## Response  - 항상 200 OK를 반환합니다. - 중복 웹훅 이벤트는 자동으로 무시됩니다. 

### Example

```typescript
import {
    TossWebhookApi,
    Configuration,
    TossWebhookPayload
} from './api';

const configuration = new Configuration();
const apiInstance = new TossWebhookApi(configuration);

let tossWebhookPayload: TossWebhookPayload; //Toss Webhook 페이로드

const { status, data } = await apiInstance.handleTossWebhook(
    tossWebhookPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tossWebhookPayload** | **TossWebhookPayload**| Toss Webhook 페이로드 | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Webhook 수신 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

