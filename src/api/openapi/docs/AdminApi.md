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

(관리자) 회원 목록을 조회합니다. 자동 매칭 수동 실행 화면에서는 `role-id=ROLE_ADMIN`, `member-status=ACTIVE` 필터를 사용해 관리자 dropdown 후보를 조회하는 용도로도 사용합니다. 

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let roleId: string; //권한 ID. 자동 매칭 관리자 dropdown 조회 시에는 `ROLE_ADMIN`을 사용합니다. null이거나 빈 문자열일 경우 무시 (optional) (default to undefined)
let memberStatus: 'ACTIVE' | 'PAUSED' | 'PERM_BAN' | 'DORMANT'; //회원 상태. 자동 매칭 관리자 dropdown 조회 시에는 `ACTIVE`를 사용합니다. null일 경우 무시 (optional) (default to undefined)
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
| **roleId** | [**string**] | 권한 ID. 자동 매칭 관리자 dropdown 조회 시에는 &#x60;ROLE_ADMIN&#x60;을 사용합니다. null이거나 빈 문자열일 경우 무시 | (optional) defaults to undefined|
| **memberStatus** | [**&#39;ACTIVE&#39; | &#39;PAUSED&#39; | &#39;PERM_BAN&#39; | &#39;DORMANT&#39;**]**Array<&#39;ACTIVE&#39; &#124; &#39;PAUSED&#39; &#124; &#39;PERM_BAN&#39; &#124; &#39;DORMANT&#39;>** | 회원 상태. 자동 매칭 관리자 dropdown 조회 시에는 &#x60;ACTIVE&#x60;를 사용합니다. null일 경우 무시 | (optional) defaults to undefined|
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
> FullMemberProfileResponse getMemberProfile1()

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 특정 회원의 전체 프로필 정보를 조회합니다. - 마이페이지, 다른 유저 프로필 조회 등에서 사용됩니다. - 응답에는 회원의 기본 정보, 스터디 관련 정보, 개인 프로필, 성실온도 등이 포함됩니다.  ---  ## Request  | **키** | **타입** | **위치** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | --- | | memberId | number | Path | 프로필을 조회할 회원의 ID | 필수 | 10000 |  ---  ## Response  | **키** | **타입** | **설명** | | --- | --- | --- | | statusCode | number | 상태 코드 | | timestamp | string(datetime) | 응답 일시 | | content | object | 응답 데이터 | | content.memberId | number | 회원 ID | | content.autoMatching | boolean | 자동 매칭 활성화 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.studyApplied | boolean | 스터디 신청 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.isVerified | boolean | 본인 인증 완료 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.memberInfo | object | 스터디 관련 정보 | | content.memberInfo.selfIntroduction | string | 자기소개 (HTML 가능) | | content.memberInfo.studyPlan | string | 공부 계획 | | content.memberInfo.goal | string | 목표 | | content.memberInfo.jobs | array(string) | 직업 리스트 (Enum) | | content.memberInfo.career | string | 경력 (Enum) | | content.memberInfo.preferredStudySubject | object | 선호 스터디 주제 | | content.memberInfo.studyFormatTypes | array(string) | 스터디 포맷 타입 목록 (Enum) | | content.memberInfo.availableStudyTimes | array(object) | 스터디 가능 시간대 | | content.memberProfile | object | 개인 프로필 정보 | | content.memberProfile.memberName | string | 실명 (본인 또는 관리자 프로필 조회 시에만 포함됨, null 가능) | | content.memberProfile.nickname | string | 닉네임 (항상 조회 가능) | | content.memberProfile.tel | string | 연락처 (본인 또는 관리자 프로필 조회 시에만 포함됨, null 가능) | | content.memberProfile.profileImage | object | 프로필 이미지 정보 | | content.memberProfile.simpleIntroduction | string | 한마디 소개 | | content.memberProfile.mbti | string | MBTI (Enum) | | content.memberProfile.interests | array(object) | 관심사 | | content.memberProfile.githubLink | object | GitHub 링크 정보 | | content.memberProfile.birthDate | string(date) | 생년월일 (yyyy-MM-dd) | | content.memberProfile.blogOrSnsLink | object | 블로그/SNS 링크 정보 | | content.memberProfile.techStacks | array(object) | 기술 스택 | | content.sincerityTemp | object | 성실온도 정보 | | content.sincerityTemp.temperature | number | 현재 온도 | | content.sincerityTemp.levelId | number | 레벨 ID | | content.sincerityTemp.levelName | string | 레벨 이름 | | message | string | 처리 결과 메시지 (nullable) |  ---  ## 접근 권한  - **본인 프로필 조회 시 (memberId == 요청자 ID)**: 모든 필드가 포함됩니다.   - `autoMatching`, `studyApplied`, `isVerified`, `memberName`, `tel` 필드가 포함됩니다.  - **다른 사용자 프로필 조회 시**: 일부 민감 정보가 제외됩니다.   - `autoMatching`, `studyApplied`, `isVerified` 필드가 null로 반환되거나 포함되지 않습니다.   - `memberName`, `tel` 필드가 null로 반환되거나 포함되지 않습니다.  - **관리자 프로필 조회 시**: 관리자 권한으로 조회하는 경우 모든 필드가 포함됩니다.   - `autoMatching`, `studyApplied`, `isVerified`, `memberName`, `tel` 필드가 모두 포함됩니다. 

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

**FullMemberProfileResponse**

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

