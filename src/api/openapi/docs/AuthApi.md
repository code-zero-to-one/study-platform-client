# AuthApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**accessToken**](#accesstoken) | **GET** /api/v1/auth/access-token/refresh | 토큰 리프레시|
|[**logout**](#logout) | **POST** /api/v1/auth/logout | 로그아웃|
|[**oauth2Login**](#oauth2login) | **GET** /api/v1/auth/{authVendor}/redirect-uri | OAuth 2.0 소셜 로그인 리다이렉트 URI|
|[**whoAmI**](#whoami) | **GET** /api/v1/auth/me | Who am I?|

# **accessToken**
> RefreshedAccessTokenResponseSchema accessToken()

Refresh token으로 새 Access token을 발급받는 엔드포인트.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let refreshToken: string; //Refresh Token. Refresh Token은 기본적으로 HTTP-only 쿠키에 담겨 있다. (default to undefined)

const { status, data } = await apiInstance.accessToken(
    refreshToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refreshToken** | [**string**] | Refresh Token. Refresh Token은 기본적으로 HTTP-only 쿠키에 담겨 있다. | defaults to undefined|


### Return type

**RefreshedAccessTokenResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  * Set-Cookie - Refresh Token; HTTP-only <br>  |
|**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logout**
> BaseResponseVoid logout()

Cookie에 저장된 Refresh token을 제거함으로써 로그아웃 진행. 프론트에서 Access token을 제거할 필요가 있음

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let referer: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.logout(
    referer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **referer** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseVoid**

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

# **oauth2Login**
> oauth2Login()

OAuth 2.0 스펙에 따라 로그인을 진행할 때, 리다이렉트되는 엔드포인트. 프론트에서 이 엔드포인트에 직접 요청할 일은 없고, Auth server (카카오, 구글 등 소셜 로그인 서버)에서 이 엔드포인트로 리다이렉션한다.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let authVendor: string; //OAuth 2.0 Auth server (default to undefined)
let code: string; // (default to undefined)
let state: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.oauth2Login(
    authVendor,
    code,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authVendor** | [**string**] | OAuth 2.0 Auth server | defaults to undefined|
| **code** | [**string**] |  | defaults to undefined|
| **state** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**308** | 소셜 로그인 성공. Access Token, Refresh Token, 회원 이름, 프로필 사진 URL 반환 |  * Set-Cookie - Refresh Token; HTTP-only <br>  * Location - 소셜 로그인 후 리다이렉션할 페이지 URL. [[[ 가입된 회원일 경우: {프론트엔드 도메인}/ ]]], [[[ 가입되지 않은 사용자일 경우: {프론트엔드 도메인}/sign-up ]]], [[[ 소셜 로그인이 실패할 경우: {프론트엔드 도메인}/login]]]  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **whoAmI**
> LongValueSchema whoAmI()

Access token으로부터 사용자 정보를 가져와 반환. memberId만 반환한다.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.whoAmI();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**LongValueSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

