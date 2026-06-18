# CoursePaymentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancel**](#cancel) | **POST** /api/v5/courses/{courseId}/payments/{paymentId}/cancel | 코스 결제 취소|
|[**confirm**](#confirm) | **POST** /api/v5/courses/{courseId}/payments/toss/confirm | 코스 결제 confirm|
|[**prepare**](#prepare) | **POST** /api/v5/courses/{courseId}/payments/prepare | 코스 결제 준비|

# **cancel**
> CourseVoidResponse cancel()

                FRD K-03.  ## Narrative - 이 API는 아직 성공하지 않은 결제 흐름을 사용자가 중단할 때 호출합니다.   - 결제 진행 화면에서 닫기, 취소 CTA를 눌렀을 때 현재 결제 row를 CANCELED로 바꾸는 용도입니다.   - 결제 준비를 다시 시작하기 전에 이전 시도를 정리하는 단계라고 보면 됩니다. - 모든 결제가 취소 가능한 것은 아닙니다.   - REQUESTED, PENDING, WAITING_FOR_DEPOSIT 같은 성공 전 상태만 취소할 수 있습니다.   - 이미 SUCCESS, FAILED, CANCELED 상태면 409로 거절됩니다. - 프론트엔드는 성공 후 결제 흐름을 닫는 쪽에 집중하면 됩니다.   - 상세를 더 이상 유지하지 말고 상위 화면으로 복귀시키면 됩니다.   - 성공 후 새 결제를 시작할 수 있는 상태가 되었는지는 필요하면 prepare 재호출로 확인하면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | 결제 진행 중 취소 CTA (phase 2 후보 화면, prototype PNG 아직 없음) | | Reference Contract | docs/FRD/v0.6/class/1-7-implementation/api-contracts/K-payment.md |  사용자가 성공 전 결제를 취소합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인 결제만 취소할 수 있습니다. | | 권한 | 다른 회원의 paymentId에 접근하면 403 PAYMENT_FORBIDDEN을 반환합니다. |  ## Business Rules | 항목 | 설명 | |---|---| | 허용 상태 | REQUESTED, PENDING, WAITING_FOR_DEPOSIT | | 거부 상태 | SUCCESS, FAILED, CANCELED | | 동작 | SUCCESS 이후 환불은 이 API 범위가 아니며 별도 환불 흐름에서 처리합니다. | | 동작 | 취소 시 canceledAt을 기록하고 status를 CANCELED로 전이합니다. | 

### Example

```typescript
import {
    CoursePaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoursePaymentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let paymentId: number; //취소할 결제 ID (default to undefined)

const { status, data } = await apiInstance.cancel(
    courseId,
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **paymentId** | [**number**] | 취소할 결제 ID | defaults to undefined|


### Return type

**CourseVoidResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 결제 취소 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 결제가 아님 |  -  |
|**404** | paymentId 또는 courseId를 찾을 수 없음 |  -  |
|**409** | 현재 상태에서는 취소할 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **confirm**
> CoursePaymentConfirmResponse confirm(tossPaymentConfirmRequest)

                FRD K-02.  ## Narrative - 이 API는 외부 결제 성공 뒤 실제 수강권을 확정하는 단계입니다.   - 토스 결제창이 끝난 뒤 paymentKey, orderId, amount를 들고 서버가 최종 검증할 때 호출합니다.   - 이 단계가 끝나야 코스 상세와 학습여정에서 결제자 상태가 열립니다. - 사용자 상태보다 결제 상태 검증이 핵심입니다.   - paymentId가 본인 것이 아니거나, orderId와 amount가 준비 단계 값과 다르면 실패합니다.   - SUCCESS가 되면 lesson progress 초기화까지 이어져 학습을 바로 시작할 수 있는 상태가 됩니다. - 프론트엔드는 confirm 성공만으로 화면을 낙관적으로 바꾸지 말고 후속 조회로 마무리해야 합니다.   - A-02 코스 상세를 다시 불러 viewerStatus=PAID를 확인하는 흐름이 안전합니다.   - WAITING_FOR_DEPOSIT처럼 즉시 성공이 아닌 상태도 올 수 있으니 status 필드를 그대로 해석해야 합니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-결제완료-카드 / S-결제완료-무통장 | | Screenmap Image URL | /api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%EC%99%84%EB%A3%8C-%EC%B9%B4%EB%93%9C.png, /api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%EC%99%84%EB%A3%8C-%EB%AC%B4%ED%86%B5%EC%9E%A5.png |  - 이미지명: S-결제완료-카드 / S-결제완료-무통장   - 이미지 설명: 카드 즉시결제 완료와 무통장 입금대기 결과를 각각 보여주는 완료 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-결제완료-카드.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%EC%99%84%EB%A3%8C-%EC%B9%B4%EB%93%9C.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%EC%99%84%EB%A3%8C-%EC%B9%B4%EB%93%9C.png\" alt=\"S-결제완료-카드\" width=\"720\" />  토스 결제창 성공 후 서버 confirm을 수행합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 본인만 호출할 수 있습니다. | | 권한 | paymentId가 본인 소유가 아니면 403 PAYMENT_FORBIDDEN을 반환합니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | paymentId는 K-01 prepare 응답에서 받은 값을 사용합니다. | | 규칙 | orderId는 prepare 응답의 tossOrderId와 같아야 합니다. | | 규칙 | amount는 prepare 응답의 amount와 같아야 하며, 서버가 다시 검증합니다. | | 규칙 | paymentKey는 토스 결제창 성공 콜백에서 받은 값을 그대로 전달합니다. | | 규칙 | 관리자 계정은 내부 수강권 생성 목적일 때만 외부 Toss confirm을 우회할 수 있으며, 이때도 paymentId/orderId/amount 검증과 SUCCESS 결제 row/lesson_progress 생성은 동일하게 수행합니다. |  ## Business Rules | 항목 | 설명 | |---|---| | 동작 | 외부 Toss confirm 호출은 DB 트랜잭션 밖에서 수행합니다. | | 동작 | 관리자 계정은 외부 Toss confirm 호출 없이 SUCCESS로 전이하고 LessonProgressInitService를 호출합니다. | | 동작 | Toss 응답이 DONE이면 SUCCESS로 전이하고 LessonProgressInitService를 호출해 진도를 초기화합니다. | | 동작 | Toss 응답이 WAITING_FOR_DEPOSIT이면 가상계좌 정보를 저장하고 WAITING_FOR_DEPOSIT 상태를 반환합니다. | | 동작 | 이미 SUCCESS인 결제는 409 PAYMENT_ALREADY_DONE으로 거절합니다. | | 동작 | Toss 외부 응답 오류 시 502 PAYMENT_TOSS_FAIL을 반환하며 row 상태는 성공 상태로 바꾸지 않습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | paymentId | confirm한 결제 row ID | | courseId | 대상 코스 ID | | planId | 결제된 코스 플랜 ID | | planCode | 결제 시점 플랜 slug snapshot (kebab-case) | | amount | 승인된 결제 금액 | | status | SUCCESS 또는 WAITING_FOR_DEPOSIT | | paymentMethod | 실제 결제 수단 표시값 | | paidAt | 결제 완료 시각 (SUCCESS일 때만 값이 생길 수 있음) | | tossReceiptUrl | 토스 영수증 URL (SUCCESS일 때 주로 값이 생김) | | virtualAccountNumber | 가상계좌 번호 (WAITING_FOR_DEPOSIT일 때) | | virtualAccountDueDate | 가상계좌 입금 기한 (WAITING_FOR_DEPOSIT일 때) | | virtualAccountHolderName | 가상계좌 예금주명 (WAITING_FOR_DEPOSIT일 때) | 

### Example

```typescript
import {
    CoursePaymentApi,
    Configuration,
    TossPaymentConfirmRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CoursePaymentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let tossPaymentConfirmRequest: TossPaymentConfirmRequest; //토스 결제 confirm 요청

const { status, data } = await apiInstance.confirm(
    courseId,
    tossPaymentConfirmRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tossPaymentConfirmRequest** | **TossPaymentConfirmRequest**| 토스 결제 confirm 요청 | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CoursePaymentConfirmResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 결제 confirm 성공 |  -  |
|**400** | orderId 또는 amount가 서버 저장값과 불일치 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 결제가 아님 |  -  |
|**404** | paymentId 또는 courseId를 찾을 수 없음 |  -  |
|**409** | 이미 SUCCESS 상태인 결제를 재confirm |  -  |
|**502** | 토스 confirm 처리 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **prepare**
> CoursePaymentPrepareResponse prepare(coursePaymentPrepareRequest)

                FRD K-01.  ## Narrative - 이 API는 결제창으로 보내기 직전에 주문 문맥을 만드는 단계입니다.   - S-코스상세-A나 결제 진행 화면에서 사용자가 플랜을 확정했을 때 호출합니다.   - 여기서 받은 paymentId, tossOrderId, amount가 이후 confirm의 기준값이 됩니다. - 사용자 상태에 따라 막히는 이유가 분명합니다.   - 이미 결제 완료한 사람은 409 PAYMENT_ALREADY_DONE, 진행 중 결제가 있으면 409 PAYMENT_IN_PROGRESS 입니다.   - 무료수강자도 로그인 상태라면 결제를 시작할 수 있지만, 금액은 항상 서버 카탈로그가 최종 결정합니다. - 프론트엔드는 이 응답을 결제 세션의 진실원천으로 써야 합니다.   - amount를 클라이언트 계산값으로 덮어쓰지 말고 그대로 토스 진입에 넘겨야 합니다.   - 성공 후에는 결제창으로 이동하고, 실패 코드는 재시도 가능 여부 메시지로 바로 연결하면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-결제하기 | | 선행 화면 | S-플랜선택 | | Screenmap Image URL | /api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%ED%95%98%EA%B8%B0.png |  - 이미지명: S-결제하기   - 이미지 설명: 구매자 정보, 약관 동의, 결제수단 선택 후 실제 결제 준비를 확정하는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-결제하기.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%ED%95%98%EA%B8%B0.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EA%B2%B0%EC%A0%9C%ED%95%98%EA%B8%B0.png\" alt=\"S-결제하기\" width=\"720\" />  결제할 코스 플랜을 기준으로 코스 결제 준비 정보를 생성합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 회원만 호출할 수 있습니다. | | 권한 | 이미 결제를 완료한 회원은 재호출 시 409가 날 수 있습니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | path courseId는 A-02 코스 상세 응답에서 받은 코스 ID를 사용합니다. | | 규칙 | body에는 canonical field 인 planId와 이름/이메일/휴대폰/약관동의/결제수단을 함께 보냅니다. | | 규칙 | planCode는 FE 전환 기간 fallback 으로만 허용됩니다. | | 규칙 | paymentMethod는 CARD, VIRTUAL_ACCOUNT 중 하나여야 합니다. | | 규칙 | buyerPhoneCountryCode는 현재 +82만 허용합니다. | | 규칙 | 금액은 클라이언트가 보내지 않고 서버 카탈로그가 계산합니다. |  ## Business Rules | 항목 | 설명 | |---|---| | 동작 | 서버는 `course_plan.early_bird_ends_at`과 선택된 플랜을 기준으로 금액을 결정합니다. | | 동작 | 재시도 가능한 기존 결제가 있으면 새 row 대신 기존 payment를 재사용할 수 있습니다. | | 동작 | 진행 중 결제(WAITING_FOR_DEPOSIT 등)가 있으면 409를 반환할 수 있습니다. | | 동작 | 응답의 tossOrderId와 amount는 이후 confirm 단계의 기준값입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | paymentId | confirm/cancel 단계에서 사용할 결제 ID | | courseId | 대상 코스 ID | | planId | 결제에 사용된 코스 플랜 ID | | planCode | 결제 시점 플랜 slug snapshot (kebab-case) | | amount | 서버 카탈로그가 결정한 결제 금액 | | tossOrderId | 토스 결제창 orderId | | orderName | 토스 결제창 노출 상품명 | 

### Example

```typescript
import {
    CoursePaymentApi,
    Configuration,
    CoursePaymentPrepareRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CoursePaymentApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let coursePaymentPrepareRequest: CoursePaymentPrepareRequest; //결제 준비 요청 (planId 기준, planCode는 전환 기간 fallback)

const { status, data } = await apiInstance.prepare(
    courseId,
    coursePaymentPrepareRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coursePaymentPrepareRequest** | **CoursePaymentPrepareRequest**| 결제 준비 요청 (planId 기준, planCode는 전환 기간 fallback) | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CoursePaymentPrepareResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 결제 준비 성공 |  -  |
|**400** | 잘못된 planId/planCode 또는 공통 입력 검증 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | 이미 결제 완료되었거나 진행 중인 결제가 있음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

