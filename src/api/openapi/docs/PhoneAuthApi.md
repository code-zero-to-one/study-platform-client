# PhoneAuthApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**sendVerificationCode**](#sendverificationcode) | **POST** /api/v1/auth/phone/send | SMS 인증번호 발송|
|[**verifyCode**](#verifycode) | **POST** /api/v1/auth/phone/verify | SMS 인증번호 검증|

# **sendVerificationCode**
> PhoneAuthResponseSchema sendVerificationCode(phoneAuthSendRequestDto)

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 입력된 전화번호로 6자리 인증번호를 발송합니다.  - 인증번호는 3분간 유효하며, 캐시에 저장됩니다.  - 개발/테스트 환경에서는 실제 SMS 발송 대신 로그로 출력됩니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | realName | string | 실명 | 필수 | \"홍길동\" | | phoneNumber | string | 전화번호 (01로 시작하는 10-11자리) | 필수 | \"01012345678\" |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-12-11T10:11:12.123456\" | | content | object | 응답 데이터 | - | | content.success | boolean | 성공 여부 | true | | content.message | string | 처리 결과 메시지 | \"인증번호가 발송되었습니다.\" | | message | string | 처리 결과 | \"SMS 인증번호 발송 성공\" |  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스빌더프로필.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png\" alt=\"S-클래스빌더프로필\" width=\"720\" /> 

### Example

```typescript
import {
    PhoneAuthApi,
    Configuration,
    PhoneAuthSendRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneAuthApi(configuration);

let phoneAuthSendRequestDto: PhoneAuthSendRequestDto; //

const { status, data } = await apiInstance.sendVerificationCode(
    phoneAuthSendRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phoneAuthSendRequestDto** | **PhoneAuthSendRequestDto**|  | |


### Return type

**PhoneAuthResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | SMS 인증번호 발송 성공 |  -  |
|**400** | 잘못된 요청 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyCode**
> PhoneAuthResponseSchema verifyCode(phoneAuthVerifyRequestDto)

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 발송된 인증번호를 검증하고 회원 정보를 업데이트합니다.  - 검증 성공 시 현재 회원의 실명, 전화번호가 저장되고 인증 상태가 완료로 변경됩니다. - 전화번호는 여러 계정에 중복 저장될 수 있으며, 본 API는 다른 계정의 전화번호/인증 상태를 변경하지 않습니다.  - 인증번호는 검증 후 캐시에서 자동으로 삭제됩니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | realName | string | 실명 | 필수 | \"홍길동\" | | phoneNumber | string | 전화번호 (01로 시작하는 10-11자리) | 필수 | \"01012345678\" | | code | string | 인증번호 (6자리 숫자) | 필수 | \"152943\" |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 404: 회원 없음 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-12-11T10:11:12.123456\" | | content | object | 응답 데이터 | - | | content.success | boolean | 성공 여부 | true | | content.message | string | 처리 결과 메시지 | \"본인인증이 완료되었습니다.\" | | message | string | 처리 결과 | \"SMS 인증번호 검증 성공\" |  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스빌더프로필.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png\" alt=\"S-클래스빌더프로필\" width=\"720\" /> 

### Example

```typescript
import {
    PhoneAuthApi,
    Configuration,
    PhoneAuthVerifyRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneAuthApi(configuration);

let phoneAuthVerifyRequestDto: PhoneAuthVerifyRequestDto; //

const { status, data } = await apiInstance.verifyCode(
    phoneAuthVerifyRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phoneAuthVerifyRequestDto** | **PhoneAuthVerifyRequestDto**|  | |


### Return type

**PhoneAuthResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | SMS 인증번호 검증 성공 |  -  |
|**400** | 인증번호 불일치 또는 잘못된 요청 |  -  |
|**404** | 회원 정보를 찾을 수 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

