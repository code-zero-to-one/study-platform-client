# MemberProfileApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**checkNicknameAvailability**](#checknicknameavailability) | **GET** /api/v1/nicknames/check | 닉네임 중복 체크|
|[**findAllCareers**](#findallcareers) | **GET** /api/v1/careers | 경력(Career) 목록 조회|
|[**findAllJobs**](#findalljobs) | **GET** /api/v1/jobs | 직업(Job) 목록 조회|
|[**findAllStudyFormatTypes**](#findallstudyformattypes) | **GET** /api/v1/study-format-types | 스터디 포맷 타입(StudyFormatType) 목록 조회|
|[**findAllStudySubjects**](#findallstudysubjects) | **GET** /api/v1/study-subjects | [CS 스터디 신청하기 팝업] (선호하는) 스터디 주제 모두 조회|
|[**getAllAvailableStudyTimes**](#getallavailablestudytimes) | **GET** /api/v1/available-study-times | [내 정보 수정 팝업] 가능 시간대 전체 목록 조회|
|[**getMemberProfile**](#getmemberprofile) | **GET** /api/v1/members/{memberId}/profile | [마이페이지] 회원 프로필 조회|
|[**getMemberProfileForStudy**](#getmemberprofileforstudy) | **GET** /api/v1/members/{memberId}/profile/for-study | [CS 스터디 신청하기 팝업] 회원 프로필 조회|
|[**updateMemberInfo**](#updatememberinfo) | **PATCH** /api/v1/members/{memberId}/profile/info | [내 정보 수정 팝업] 회원 정보 수정|
|[**updateProfile**](#updateprofile) | **PATCH** /api/v1/members/{memberId}/profile | [내 프로필 수정 팝업] 회원 프로필 업데이트|

# **checkNicknameAvailability**
> NicknameAvailabilityResponse checkNicknameAvailability()

작성일자: 2025-12-13  작성자: 최현준  ---  ## Description  - 프론트엔드에서 실시간으로 닉네임 중복 여부를 확인하기 위한 API입니다. - 쿼리 파라미터로 전달된 닉네임이 이미 사용 중인지 확인합니다. - **인증이 필요합니다.** (로그인한 사용자만 사용 가능)  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | nickname | string | 중복 체크할 닉네임 (특수문자 제외 2~20자, 한글/영문/숫자만 허용) | 필수 | \"원영이\" |  ---  ## Response  - 성공 시, 닉네임 사용 가능 여부를 반환합니다. (상세 내용은 예시 참고) 

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

let nickname: string; //중복 체크할 닉네임 (default to undefined)

const { status, data } = await apiInstance.checkNicknameAvailability(
    nickname
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **nickname** | [**string**] | 중복 체크할 닉네임 | defaults to undefined|


### Return type

**NicknameAvailabilityResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 닉네임 사용 불가 (이미 사용 중) |  -  |
|**400** | 닉네임 파라미터 누락 또는 형식 오류 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findAllCareers**
> CareerListResponse findAllCareers()

작성일자: 2025-12-13  작성자: 최현준  ---  ## Description  - 회원이 선택할 수 있는 경력(Career) enum 목록을 조회합니다. - 프론트엔드에서 enum을 관리하지 않고 백엔드에서 관리하기 위한 API입니다.  ---  ## Response  - 성공 시, 모든 경력 enum 목록을 반환합니다. (상세 내용은 예시 참고) 

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

const { status, data } = await apiInstance.findAllCareers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**CareerListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 경력 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findAllJobs**
> JobListResponse findAllJobs()

작성일자: 2025-12-13  작성자: 최현준  ---  ## Description  - 회원이 선택할 수 있는 직업(Job) enum 목록을 조회합니다. - 프론트엔드에서 enum을 관리하지 않고 백엔드에서 관리하기 위한 API입니다.  ---  ## Response  - 성공 시, 모든 직업 enum 목록을 반환합니다. (상세 내용은 예시 참고) 

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

const { status, data } = await apiInstance.findAllJobs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**JobListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 직업 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findAllStudyFormatTypes**
> StudyFormatTypeListResponse findAllStudyFormatTypes()

작성일자: 2025-12-13  작성자: 최현준  ---  ## Description  - 회원이 선택할 수 있는 스터디 포맷 타입(StudyFormatType) enum 목록을 조회합니다. - 프론트엔드에서 enum을 관리하지 않고 백엔드에서 관리하기 위한 API입니다.  ---  ## Response  - 성공 시, 모든 스터디 포맷 타입 enum 목록을 반환합니다. (상세 내용은 예시 참고) 

### Example

```typescript
import {
    MemberProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberProfileApi(configuration);

const { status, data } = await apiInstance.findAllStudyFormatTypes();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**StudyFormatTypeListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 스터디 포맷 타입 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findAllStudySubjects**
> StudySubjectListResponse findAllStudySubjects()

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

**StudySubjectListResponse**

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
> AvailableStudyTimeListResponse getAllAvailableStudyTimes()

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

**AvailableStudyTimeListResponse**

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
> FullMemberProfileResponse getMemberProfile()

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 특정 회원의 전체 프로필 정보를 조회합니다. - 마이페이지, 다른 유저 프로필 조회 등에서 사용됩니다. - 응답에는 회원의 기본 정보, 스터디 관련 정보, 개인 프로필, 성실온도 등이 포함됩니다.  ---  ## Request  | **키** | **타입** | **위치** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | --- | | memberId | number | Path | 프로필을 조회할 회원의 ID | 필수 | 10000 |  ---  ## Response  | **키** | **타입** | **설명** | | --- | --- | --- | | statusCode | number | 상태 코드 | | timestamp | string(datetime) | 응답 일시 | | content | object | 응답 데이터 | | content.memberId | number | 회원 ID | | content.autoMatching | boolean | 자동 매칭 활성화 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.studyApplied | boolean | 스터디 신청 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.isVerified | boolean | 본인 인증 완료 여부 (본인 프로필 조회 시에만 포함됨, null 가능) | | content.memberInfo | object | 스터디 관련 정보 | | content.memberInfo.selfIntroduction | string | 자기소개 (HTML 가능) | | content.memberInfo.studyPlan | string | 공부 계획 | | content.memberInfo.goal | string | 목표 | | content.memberInfo.jobs | array(string) | 직업 리스트 (Enum) | | content.memberInfo.career | string | 경력 (Enum) | | content.memberInfo.preferredStudySubject | object | 선호 스터디 주제 | | content.memberInfo.studyFormatTypes | array(string) | 스터디 포맷 타입 목록 (Enum) | | content.memberInfo.availableStudyTimes | array(object) | 스터디 가능 시간대 | | content.memberProfile | object | 개인 프로필 정보 | | content.memberProfile.memberName | string | 실명 (본인 또는 관리자 프로필 조회 시에만 포함됨, null 가능) | | content.memberProfile.nickname | string | 닉네임 (항상 조회 가능) | | content.memberProfile.tel | string | 연락처 (본인 또는 관리자 프로필 조회 시에만 포함됨, null 가능) | | content.memberProfile.profileImage | object | 프로필 이미지 정보 | | content.memberProfile.simpleIntroduction | string | 한마디 소개 | | content.memberProfile.mbti | string | MBTI (Enum) | | content.memberProfile.interests | array(object) | 관심사 | | content.memberProfile.githubLink | object | GitHub 링크 정보 | | content.memberProfile.birthDate | string(date) | 생년월일 (yyyy-MM-dd) | | content.memberProfile.blogOrSnsLink | object | 블로그/SNS 링크 정보 | | content.memberProfile.techStacks | array(object) | 기술 스택 | | content.sincerityTemp | object | 성실온도 정보 | | content.sincerityTemp.temperature | number | 현재 온도 | | content.sincerityTemp.levelId | number | 레벨 ID | | content.sincerityTemp.levelName | string | 레벨 이름 | | message | string | 처리 결과 메시지 (nullable) |  ---  ## 접근 권한  - **본인 프로필 조회 시 (memberId == 요청자 ID)**: 모든 필드가 포함됩니다.   - `autoMatching`, `studyApplied`, `isVerified`, `memberName`, `tel` 필드가 포함됩니다.  - **다른 사용자 프로필 조회 시**: 일부 민감 정보가 제외됩니다.   - `autoMatching`, `studyApplied`, `isVerified` 필드가 null로 반환되거나 포함되지 않습니다.   - `memberName`, `tel` 필드가 null로 반환되거나 포함되지 않습니다.  - **관리자 프로필 조회 시**: 관리자 권한으로 조회하는 경우 모든 필드가 포함됩니다.   - `autoMatching`, `studyApplied`, `isVerified`, `memberName`, `tel` 필드가 모두 포함됩니다. 

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberProfileForStudy**
> MemberProfileForStudy getMemberProfileForStudy()

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

**MemberProfileForStudy**

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
> MemberInfoUpdateResponse updateMemberInfo(memberInfoUpdateResponseDto)

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 회원의 스터디 관련 정보를 수정합니다. (\'내 정보 수정\' 팝업) - `ignore-null=true` 쿼리 파라미터를 사용하면 요청 body에 포함되지 않거나 `null`로 전달된 필드는 업데이트하지 않습니다.  ### 💡 업데이트 정책 이 API는 `ignore-null` 파라미터에 따라 **데이터 삭제(초기화)** 동작이 달라집니다.  | 케이스 | 요청 예시 | ignore-null=true (기본) | ignore-null=false | | :--- | :--- | :--- | :--- | | **필드 생략** | `{}` | 유지 (변경 없음) | 유지 (변경 없음) | | **Null 값** | `\"career\": null` | 유지 (무시) | **삭제** (초기화) | | **빈 문자열** | `\"career\": \"\"` | 유지 (무시) | **삭제** (초기화) | | **빈 리스트** | `\"jobs\": []` | **삭제** (빈 리스트로 변경) | **삭제** (빈 리스트로 변경) | | **유효한 값** | `\"career\": \"JUNIOR\"` | 수정 (값 변경) | 수정 (값 변경) |  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | selfIntroduction | string | 자기소개 (HTML 가능) | 선택 | \"안녕하세요...\" | | studyPlan | string | 공부 계획 | 선택 | \"매일 3시간씩...\" | | goal | string | 목표 | 선택 | \"사이드 프로젝트 완성\" | | jobs | array(string) | 직업 리스트 (최대 5개, Enum) | 선택 | [\"IT_PRACTITIONER_BACKEND\"] | | career | string | 경력 (Enum: BEGINNER, JUNIOR, MIDDLE, SENIOR 등) | 선택 | \"JUNIOR\" | | preferredStudySubjectId | string | 선호 스터디 주제 ID | 선택 | \"CS_DEEP\" | | studyFormatTypes | array(string) | 스터디 포맷 타입 목록 (Enum: PROJECT, SEMINAR, MENTORING 등) | 선택 | [\"PROJECT\", \"SEMINAR\"] | | availableStudyTimeIds | array(number) | 스터디 가능 시간 ID 목록 | 선택 | [1, 3, 5] |  ---  ## Response  - 성공 시, 업데이트된 회원 정보의 일부를 반환합니다. (상세 내용은 예시 참고) 

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

**MemberInfoUpdateResponse**

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
> MemberProfileUpdateResponse updateProfile(memberProfileUpdateRequestDto)

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 회원의 프로필 정보를 업데이트합니다. (\'내 프로필 수정\' 팝업) - `ignore-null=true` 쿼리 파라미터를 사용하면 요청 body에 포함되지 않거나 `null`로 전달된 필드는 업데이트하지 않습니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | githubLink | string | GitHub 링크 | 선택 | \"https://github.com/rudeh1253\" | | blogOrSnsLink | string | 블로그/SNS 링크 | 선택 | \"https://velog.io/@rudeh1253/posts\" | | simpleIntroduction | string | 한 마디 소개 (최대 200자) | 선택 | \"백엔드 개발자입니다.\" | | mbti | string | MBTI (Enum) | 선택 | \"ENTP\" | | interests | array(string) | 관심사 리스트 (기존 데이터는 날아가고 이걸로 대체) | 선택 | [\"Spring Cloud\", \"Spring Batch\"] | | birthDate | string(date) | 생년월일 (yyyy-MM-dd 형식) | 선택 | \"1997-09-16\" | | profileImageExtension | string | 프로필 이미지 확장자 (null이 아닐 경우 프로필 이미지 업로드 URL이 반환됨) | 선택 | \"jpg\" | | techStackIds | array(number) | 기술 스택 ID 목록 | 선택 | [11, 12, 15] | | nickname | string | 닉네임 | 선택 | \"원영이\" |  ---  ## Response  - 성공 시, 업데이트된 회원 프로필 정보의 일부를 반환합니다. (상세 내용은 예시 참고) 

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

**MemberProfileUpdateResponse**

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

