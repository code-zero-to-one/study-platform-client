# MemberProfileApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**findAllStudySubjects**](#findallstudysubjects) | **GET** /api/v1/study-subjects | [CS 스터디 신청하기 팝업] (선호하는) 스터디 주제 모두 조회|
|[**getAllAvailableStudyTimes**](#getallavailablestudytimes) | **GET** /api/v1/available-study-times | [내 정보 수정 팝업] 가능 시간대 전체 목록 조회|
|[**getMemberProfile**](#getmemberprofile) | **GET** /api/v1/members/{memberId}/profile | [마이페이지] 회원 프로필 조회|
|[**getMemberProfileForStudy**](#getmemberprofileforstudy) | **GET** /api/v1/members/{memberId}/profile/for-study | [CS 스터디 신청하기 팝업] 회원 프로필 조회|
|[**updateMemberInfo**](#updatememberinfo) | **PATCH** /api/v1/members/{memberId}/profile/info | [내 정보 수정 팝업] 회원 정보 수정|
|[**updateProfile**](#updateprofile) | **PATCH** /api/v1/members/{memberId}/profile | [내 프로필 수정 팝업] 회원 프로필 업데이트|

# **findAllStudySubjects**
> findAllStudySubjects()

스터디 주제를 모두 조회합니다.

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

const { status, data } = await apiInstance.findAllStudySubjects();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | 스터디 주제 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllAvailableStudyTimes**
> getAllAvailableStudyTimes()

가능 시간대 전체 목록을 조회합니다. 가능 시간대 목록 개수는 고정돼 있습니다. 시간순으로 정렬됩니다.

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

const { status, data } = await apiInstance.getAllAvailableStudyTimes();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberProfile**
> FullMemberProfileResponseSchema getMemberProfile()

회원 프로필을 조회합니다.

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

let memberId: number; //프로필을 조회할 회원의 ID. 숫자여야 한다 (default to undefined)

const { status, data } = await apiInstance.getMemberProfile(
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberProfileForStudy**
> MemberProfileForStudySchema getMemberProfileForStudy()

스터디 신청할 때 필수적으로 입력해야 하는 회원 정보를 가져옵니다.

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

let memberId: number; // (default to undefined)

const { status, data } = await apiInstance.getMemberProfileForStudy(
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] |  | defaults to undefined|


### Return type

**MemberProfileForStudySchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 프로필 조회 성공 |  -  |
|**404** | memberId에 해당하는 회원이 없을 경우 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMemberInfo**
> updateMemberInfo(memberInfoUpdateResponseDto)

회원 정보 수정

### Example

```typescript
import {
    MemberProfileApi,
    Configuration,
    MemberInfoUpdateResponseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

let memberId: number; //수정할 회원의 ID (default to undefined)
let memberInfoUpdateResponseDto: MemberInfoUpdateResponseDto; //
let ignoreNull: boolean; //true일 경우 null은 무시 (null인 필드는 업데이트되지 않음) (optional) (default to false)

const { status, data } = await apiInstance.updateMemberInfo(
    memberId,
    memberInfoUpdateResponseDto,
    ignoreNull
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberInfoUpdateResponseDto** | **MemberInfoUpdateResponseDto**|  | |
| **memberId** | [**number**] | 수정할 회원의 ID | defaults to undefined|
| **ignoreNull** | [**boolean**] | true일 경우 null은 무시 (null인 필드는 업데이트되지 않음) | (optional) defaults to false|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 정보 업데이트 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateProfile**
> MemberProfileUpdateResponseSchema updateProfile(memberProfileUpdateRequestDto)

회원 프로필을 업데이트합니다.

### Example

```typescript
import {
    MemberProfileApi,
    Configuration,
    MemberProfileUpdateRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

let memberId: number; //회원의 ID. 숫자가 와야 함 (default to undefined)
let memberProfileUpdateRequestDto: MemberProfileUpdateRequestDto; //
let ignoreNull: boolean; //true일 경우 null인 필드 반영, false일 경우 null인 필드 무시. Default=false (optional) (default to false)

const { status, data } = await apiInstance.updateProfile(
    memberId,
    memberProfileUpdateRequestDto,
    ignoreNull
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberProfileUpdateRequestDto** | **MemberProfileUpdateRequestDto**|  | |
| **memberId** | [**number**] | 회원의 ID. 숫자가 와야 함 | defaults to undefined|
| **ignoreNull** | [**boolean**] | true일 경우 null인 필드 반영, false일 경우 null인 필드 무시. Default&#x3D;false | (optional) defaults to false|


### Return type

**MemberProfileUpdateResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | memberId에 해당하는 회원이 없을 경우 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

