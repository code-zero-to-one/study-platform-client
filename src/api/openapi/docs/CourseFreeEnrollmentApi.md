# CourseFreeEnrollmentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**enroll**](#enroll) | **POST** /api/v5/courses/{courseId}/free-enrollments | 코스 무료수강신청|
|[**getMyEnrollment**](#getmyenrollment) | **GET** /api/v5/courses/{courseId}/free-enrollments/me | 내 무료수강신청 여부 조회|

# **enroll**
> CourseFreeEnrollmentResponse enroll()

                FRD J-01.  ## Narrative - 이 API는 코스 상세에서 무료 코스 시작하기를 눌렀을 때 호출합니다.   - 사용자가 공개 랜딩에서 학습 상태로 넘어가는 첫 action API입니다.   - 신청과 동시에 무료 레슨 진도 초기화까지 묶여 있으므로, 단순 토글이 아니라 실제 학습 시작 신호로 봐야 합니다. - 사용자 상태에 따라 실패 이유가 명확히 갈립니다.   - 비로그인은 401, 이미 신청한 사람은 409 FREE_ENROLLMENT_ALREADY_EXISTS, 이미 결제한 사람은 409 FREE_ENROLLMENT_ALREADY_PAID 입니다.   - 정상 성공이면 freeLessonCount로 지금 바로 열리는 무료 범위를 알려줍니다. - 프론트엔드는 성공 직후 코스 상세나 학습여정을 다시 읽어야 합니다.   - 일반 사용자는 viewerStatus가 FREE_ENROLLED로 바뀌고, 관리자는 viewerStatus=ADMIN을 유지한 채 isFreeEnrolled=true 로 바뀝니다.   - 무료 레슨이 열렸다고 로컬에서 임의 계산하지 말고 재조회로 맞추는 편이 안전합니다. - 관리자는 전체 코스를 원래도 볼 수 있지만, 무료수강신청을 하면 실제 수강자 집합에 들어갑니다.   - 즉 후속 챕터 알림, 무료 레슨 진도 초기화, 수강자 집계는 무료수강신청 이후에만 적용됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-코스상세-A, S-코스상세-B, S-코스상세-C | | Primary Screen | 코스 상세 무료 코스 시작하기 CTA | | Screenmap Path | 없음 (Phase 2 사진 대기) | | Contract Path | docs/FRD/v0.6/class/1-7-implementation/api-contracts/J-free-enrollment.md | | Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/J-free-enrollment.md |  로그인 사용자의 무료수강신청을 생성하고, 같은 트랜잭션에서 무료 공개 레슨 진도를 초기화합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | MEMBER only | | 권한 | 비로그인 요청은 401 | | 권한 | 이미 무료수강신청한 사용자는 409 FREE_ENROLLMENT_ALREADY_EXISTS | | 권한 | 이미 결제 완료한 사용자는 409 FREE_ENROLLMENT_ALREADY_PAID | | 권한 | 관리자도 호출할 수 있으며, 이 경우 full access 권한은 유지한 채 실제 무료수강 상태만 추가됩니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | path courseId는 A-02 코스 상세 응답에서 받은 무료수강신청 대상 코스 ID입니다. | | 규칙 | 신청 성공 시 course_free_enrollment(member_id, course_id) row를 생성합니다. | | 규칙 | 진도 초기화는 무료 공개 레슨만 대상으로 하며, 첫 레슨은 IN_PROGRESS, 나머지는 LOCKED로 저장합니다. | | 규칙 | 결제 완료 사용자는 무료수강신청 대상이 아니므로 중복 수강권 생성을 허용하지 않습니다. | | 규칙 | 관리자는 무료수강신청 여부와 상관없이 코스를 볼 수 있지만, 무료수강신청 후에만 실제 수강자 플로우와 후속 챕터 알림 대상에 포함됩니다. | 

### Example

```typescript
import {
    CourseFreeEnrollmentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseFreeEnrollmentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.enroll(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**CourseFreeEnrollmentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 무료수강신청 성공 + 무료 레슨 progress 초기화 |  -  |
|**401** | 로그인 필요 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |
|**409** | 이미 무료수강신청했거나 이미 결제 완료한 코스 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyEnrollment**
> MyCourseFreeEnrollmentResponse getMyEnrollment()

                FRD J-02.  ## Narrative - 이 API는 무료수강신청 상태를 따로 확인하거나 새로고침할 때 호출합니다.   - 코스 상세의 CTA를 보조 검증하거나, 무료수강신청 직후 로컬 상태를 다시 맞출 때 쓰는 API입니다.   - 주 상태 source는 A-02 코스 상세지만, 이 API는 그 상태를 빠르게 다시 확인하는 용도에 가깝습니다. - 로그인한 본인 기준 상태만 내려옵니다.   - 신청하지 않았으면 isFreeEnrolled=false 로 오고, 신청했으면 freeEnrollmentId와 freeLessonCount가 같이 옵니다.   - 비로그인은 이 API 자체를 호출 대상에서 빼는 편이 맞습니다. - 프론트엔드는 isFreeEnrolled를 가장 먼저 보면 됩니다.   - true면 무료 시작 CTA 대신 학습여정 진입이나 이어서 보기로 바꾸면 됩니다.   - freeLessonCount는 몇 개까지 열렸는지 안내하는 보조 값으로 쓰면 됩니다.  ## Screen Usage | 비고 | 설명 | |---|---| | 사용 화면 | S-코스상세-A, S-코스상세-B, S-코스상세-C | | Primary Screen | A-02 코스 상세 overlay 판단용 | | Screenmap Path | 없음 (A-02 overlay 판단용 internal API) | | Contract Path | docs/FRD/v0.6/class/1-7-implementation/api-contracts/J-free-enrollment.md | | Contract Raw URL | https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/docs/FRD/v0.6/class/1-7-implementation/api-contracts/J-free-enrollment.md |  현재 로그인 사용자의 무료수강신청 여부를 조회합니다.  ## Access | 항목 | 설명 | |---|---| | 권한 | MEMBER only | | 권한 | 비로그인 요청은 401 | | 권한 | 본인 기준 조회이며 미신청 상태도 200으로 반환합니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | A-02 코스 상세가 코스 진입의 canonical 상태 source이고, 이 API는 액션 직후 명시적 refresh 또는 보조 확인용으로 사용합니다. | | 규칙 | 신청 상태면 isFreeEnrolled=true, freeEnrollmentId, enrolledAt, freeLessonCount를 반환합니다. | | 규칙 | 미신청 상태면 isFreeEnrolled=false와 null metadata를 반환합니다. | 

### Example

```typescript
import {
    CourseFreeEnrollmentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CourseFreeEnrollmentApi(configuration);

let courseId: number; //코스 ID (default to undefined)

const { status, data } = await apiInstance.getMyEnrollment(
    courseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**MyCourseFreeEnrollmentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 (신청/미신청 모두 200) |  -  |
|**401** | 로그인 필요 |  -  |
|**404** | 코스를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

