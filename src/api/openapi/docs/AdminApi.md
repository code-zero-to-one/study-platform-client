# AdminApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**findMembers**](#findmembers) | **GET** /api/v1/admin/members | 회원 목록 조회|
|[**getMemberAccountHistoryResponse**](#getmemberaccounthistoryresponse) | **GET** /api/v1/admin/members/{memberId}/account-histories | |
|[**getMemberProfile1**](#getmemberprofile1) | **GET** /api/v1/admin/members/{memberId}/profile | [마이페이지] 회원 프로필 조회|
|[**getSincerityTempHist**](#getsinceritytemphist) | **GET** /api/v1/admin/members/{memberId}/sincerity-temperature-histories | 성실온도 이력 조회|
|[**updateMemberRole**](#updatememberrole) | **PATCH** /api/v1/admin/members/{memberId}/role | 회원 권한 변경|
|[**updateMemberStatus**](#updatememberstatus) | **PATCH** /api/v1/admin/members/{memberId}/status | 회원 상태 변경|

# **findMembers**
> findMembers()

(관리자) 회원 목록을 조회합니다.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let roleId: string; //권한 ID. null이거나 빈 문자열일 경우 무시 (optional) (default to undefined)
let memberStatus: 'ACTIVE' | 'PAUSED' | 'PERM_BAN' | 'DORMANT'; //회원 상태. null일 경우 무시 (optional) (default to undefined)
let searchKeyword: string; //검색어. 회원의 이름으로 검색합니다. 회원의 이름이 검색어를 포함하면 회원 정보 가져옵니다. null이거나 빈 문자열일 경우 무시 (optional) (default to undefined)
let page: number; //페이지. 1부터 시작 (optional) (default to 1)
let pageSize: number; //페이지 사이즈 (optional) (default to 10)

const { status, data } = await apiInstance.findMembers(
    roleId,
    memberStatus,
    searchKeyword,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleId** | [**string**] | 권한 ID. null이거나 빈 문자열일 경우 무시 | (optional) defaults to undefined|
| **memberStatus** | [**&#39;ACTIVE&#39; | &#39;PAUSED&#39; | &#39;PERM_BAN&#39; | &#39;DORMANT&#39;**]**Array<&#39;ACTIVE&#39; &#124; &#39;PAUSED&#39; &#124; &#39;PERM_BAN&#39; &#124; &#39;DORMANT&#39;>** | 회원 상태. null일 경우 무시 | (optional) defaults to undefined|
| **searchKeyword** | [**string**] | 검색어. 회원의 이름으로 검색합니다. 회원의 이름이 검색어를 포함하면 회원 정보 가져옵니다. null이거나 빈 문자열일 경우 무시 | (optional) defaults to undefined|
| **page** | [**number**] | 페이지. 1부터 시작 | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 사이즈 | (optional) defaults to 10|


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
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**0** | 회원 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberAccountHistoryResponse**
> BaseResponseMemberAccountHistoryResponseDto getMemberAccountHistoryResponse()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let memberId: number; // (default to undefined)

const { status, data } = await apiInstance.getMemberAccountHistoryResponse(
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseMemberAccountHistoryResponseDto**

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

# **getMemberProfile1**
> FullMemberProfileResponseSchema getMemberProfile1()

회원 프로필을 조회합니다.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let memberId: number; //프로필을 조회할 회원의 ID. 숫자여야 한다 (default to undefined)

const { status, data } = await apiInstance.getMemberProfile1(
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 프로필을 조회할 회원의 ID. 숫자여야 한다 | defaults to undefined|


### Return type

**FullMemberProfileResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | memberId에 해당하는 회원이 없을 경우 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSincerityTempHist**
> getSincerityTempHist()

성실온도 이력 조회

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let memberId: number; //회원 ID (default to undefined)
let page: number; //조회할 페이지. 1부터 시작 (optional) (default to 1)
let pageSize: number; //페이지 크기. (optional) (default to 10)

const { status, data } = await apiInstance.getSincerityTempHist(
    memberId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 회원 ID | defaults to undefined|
| **page** | [**number**] | 조회할 페이지. 1부터 시작 | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기. | (optional) defaults to 10|


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
|**200** | 성실온도 이력 조회 성공. 최신순으로 가져옵니다. |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMemberRole**
> updateMemberRole()

Updates the role of a member. Available roles include ROLE_MEMBER, ROLE_GUEST, ROLE_ADMIN, etc.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let memberId: number; //ID of the member whose role will be updated (default to undefined)
let roleId: string; //Role ID to update the member to (default to undefined)

const { status, data } = await apiInstance.updateMemberRole(
    memberId,
    roleId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | ID of the member whose role will be updated | defaults to undefined|
| **roleId** | [**string**] | Role ID to update the member to | defaults to undefined|


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
|**200** | Member role updated successfully |  -  |
|**404** | Role not found |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMemberStatus**
> updateMemberStatus()

회원의 상태를 변경합니다. 회원의 상태는 \"활성화\", \"일시정지\", \"영구정지\", \"휴면 상태\"가 있습니다.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let memberId: number; //상태를 변경할 회원의 ID (default to undefined)
let to: 'ACTIVE' | 'PAUSED' | 'PERM_BAN' | 'DORMANT'; //회원의 상태를 이 값으로 변경 ACTIVE - 활성화 PAUSED - 일시정지 PERM_BAN - 영구정지 DORMANT - 휴면  (default to undefined)

const { status, data } = await apiInstance.updateMemberStatus(
    memberId,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 상태를 변경할 회원의 ID | defaults to undefined|
| **to** | [**&#39;ACTIVE&#39; | &#39;PAUSED&#39; | &#39;PERM_BAN&#39; | &#39;DORMANT&#39;**]**Array<&#39;ACTIVE&#39; &#124; &#39;PAUSED&#39; &#124; &#39;PERM_BAN&#39; &#124; &#39;DORMANT&#39;>** | 회원의 상태를 이 값으로 변경 ACTIVE - 활성화 PAUSED - 일시정지 PERM_BAN - 영구정지 DORMANT - 휴면  | defaults to undefined|


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
|**200** | 회원 상태 변경 성공 |  -  |
|**400** | 유효하지 않은 회원 상태 값 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

